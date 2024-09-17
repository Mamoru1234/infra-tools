import { ECRClient } from "@aws-sdk/client-ecr";
import { once } from "lodash";

export const getEcrClient = once(() => {
  return new ECRClient({
    region: process.env.AWS_REGION ?? 'eu-central-1',
  });
});