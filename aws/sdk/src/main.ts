import 'dotenv/config';
import { EC2Client, DescribeInstancesCommand, Tag, StartInstancesCommand, StopInstancesCommand } from '@aws-sdk/client-ec2';
import { Command } from 'commander';
import { flatten } from 'lodash';
import { join } from 'path';
import { STATE_DIR } from './constants';
import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';

const program = new Command();

const client = new EC2Client({
  region: 'eu-central-1',
});

const CONFIG_PATH = join(STATE_DIR, 'ec2-config.json');

program
  .name('ec2-instance')
  .description('EC2 instance management');

function mapInstanceTags(tags: Tag[] | undefined): Record<string, string> {
  if (!tags) {
    return {};
  }
  return tags.reduce((acc, it) => {
    acc[it.Key!] = it.Value!;
    return acc;
  }, {} as Record<string, string>)
}

program.command('index')
  .action(async () => {
    const { Reservations } = await client.send(new DescribeInstancesCommand());
    if (!Reservations) {
      console.log('No reservations');
      return;
    }
    const Instances = flatten(Reservations.map((it) => it.Instances!))
      .map((it) => ({
        name: mapInstanceTags(it.Tags).Name,
        id: it.InstanceId,
      }))
      .filter((it) => it.id && it.name)
      .reduce((acc, it) => {
        acc[it.name] = it.id!;
        return acc;
      }, {} as Record<string, string>);
    await writeFile(CONFIG_PATH, JSON.stringify(Instances, null, 2));
  });

program.command('start')
  .argument('<instanceName>')
  .action(async (instanceName: string) => {
    const configRaw = await readFile(CONFIG_PATH);
    const config = JSON.parse(configRaw.toString());
    const instanceId = config[instanceName];
    if (!instanceId) {
      console.log('No instance id in config');
      return;
    }
    console.log('Found instance id', instanceId);
    await client.send(new StartInstancesCommand({
      InstanceIds: [instanceId],
    }));
  });

program.command('stop')
  .argument('<instanceName>')
  .action(async (instanceName: string) => {
    const configRaw = await readFile(CONFIG_PATH);
    const config = JSON.parse(configRaw.toString());
    const instanceId = config[instanceName];
    if (!instanceId) {
      console.log('No instance id in config');
      return;
    }
    console.log('Found instance id', instanceId);
    await client.send(new StopInstancesCommand({
      InstanceIds: [instanceId],
    }));
  });

const SERVICE_PREFIX = '# AWS-Server:';

program.command('sync')
  .action(async () => {
    const configRaw = await readFile(CONFIG_PATH);
    const config = JSON.parse(configRaw.toString());
    const { Reservations } = await client.send(new DescribeInstancesCommand());
    if (!Reservations) {
      console.log('No reservations');
      return;
    }
    const dnsNames = flatten(Reservations.map((it) => it.Instances!)).reduce((acc, { InstanceId, PublicDnsName }) => {
      if (!InstanceId || !PublicDnsName) {
        return acc;
      }
      acc[InstanceId] = PublicDnsName;
      return acc;
    }, {} as Record<string, string>);
    const sshConfigPath = join(homedir(), '.ssh', 'config');
    const sshConfigRaw = await readFile(sshConfigPath);
    const sshConfig = sshConfigRaw.toString();
    const newSshConfig = sshConfig.split('\n').map((line) => {
      if (line.includes(SERVICE_PREFIX)) {
        const hostStart = line.indexOf('ec2');
        const hostEnd = line.indexOf(SERVICE_PREFIX) - 1;
        const serviceStart = hostEnd + SERVICE_PREFIX.length + 2;
        const serviceName = line.substring(serviceStart).trim();
        const instanceId = config[serviceName];
        if (!instanceId) {
          console.log('No instance found');
          return line;
        }
        const dnsName = dnsNames[instanceId];
        if (!dnsName) {
          console.log('Dns name not found');
          return line;
        }
        return line.substring(0, hostStart) + dnsName + line.substring(hostEnd);
      }
      return line;
    }).join('\n');
    await writeFile(sshConfigPath, newSshConfig);
  });

program.parseAsync().catch((e) => console.error('Error during parsing', e));
