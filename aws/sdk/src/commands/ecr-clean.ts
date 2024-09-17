import { Command } from "commander";
import { getEcrClient } from "../aws.client";
import { BatchDeleteImageCommand, DescribeRepositoriesCommand, ImageIdentifier, ListImagesCommand } from "@aws-sdk/client-ecr";

async function ecrCleanAction(): Promise<void> {
  console.log(new Date(), 'Start cleaning ecr');
  const client = getEcrClient();
  const { repositories } = await client.send(new DescribeRepositoriesCommand());
  if (!repositories || !repositories.length) {
    console.log(new Date(), 'No repositories');
    return;
  }
  for (const repository of repositories) {
    if (repository.imageTagMutability !== 'MUTABLE') {
      console.log(new Date(), 'Image tag is not mutable skip for now', repository.repositoryName);
      continue;
    }
    const { imageIds } = await client.send(new ListImagesCommand({
      repositoryName: repository.repositoryName!,
      filter: {
        tagStatus: 'UNTAGGED',
      },
    }))
    if (!imageIds || !imageIds.length) {
      continue;
    }
    await client.send(new BatchDeleteImageCommand({
      imageIds: imageIds,
      repositoryName: repository.repositoryName,
    }));
  }
  console.log(new Date(), 'Clean-up completed');
}

export function ecrCleanCommand(program: Command): void {
  program.command('ecr-clean')
    .action(ecrCleanAction);
}