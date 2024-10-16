import { Command } from "commander";
import { getLambdaClient, getLogClient } from "../aws.client";
import { ListFunctionsCommand } from "@aws-sdk/client-lambda";
import { DeleteLogGroupCommand, DescribeLogGroupsCommand } from "@aws-sdk/client-cloudwatch-logs";

async function cleanAction(): Promise<void> {
  console.log(new Date(), 'Start cloudwatch clean');
  const lambdaClient = getLambdaClient();
  const logClient = getLogClient();
  const { Functions, NextMarker } = await lambdaClient.send(new ListFunctionsCommand());
  if (NextMarker) {
    throw new Error('Pagination is not supported');
  }
  if (!Functions) {
    console.log(new Date(), 'No functions');
    return;
  }
  const properGroups = Functions.map((it) => `/aws/lambda/${it.FunctionName}`);
  const { logGroups, nextToken } = await logClient.send(new DescribeLogGroupsCommand());
  if (nextToken) {
    throw new Error('Pagination is not supported');
  }
  if (!logGroups) {
    console.log(new Date(), 'No log groups');
    return;
  }
  const groupsToDelete = logGroups
    .map((it) => it.logGroupName)
    .filter((it) => it && it.startsWith('/aws/lambda') && !properGroups.includes(it));
  if (!groupsToDelete.length) {
    console.log('No groups to delete');
    return;
  }
  for (const group of groupsToDelete) {
    await logClient.send(new DeleteLogGroupCommand({
      logGroupName: group,
    }));
  }
}

export function cloudWatchClean(program: Command) {
  program.command('cloudwatch-clean').action(cleanAction);
}