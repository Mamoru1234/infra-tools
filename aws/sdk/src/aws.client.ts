import { CloudWatchLogs } from "@aws-sdk/client-cloudwatch-logs";
import { ECRClient } from "@aws-sdk/client-ecr";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { once } from "lodash";

export const getEcrClient = once(() => {
  return new ECRClient({
    region: process.env.AWS_REGION ?? 'eu-central-1',
  });
});

export const getLambdaClient = once(() => new LambdaClient({
  region: process.env.AWS_REGION ?? 'eu-central-1',
}));

export const getLogClient = once(() => new CloudWatchLogs({
  region: process.env.AWS_REGION ?? 'eu-central-1',
}));
