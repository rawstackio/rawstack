import { EventBridgeEvent } from "aws-lambda";
import { ECSClient, UpdateServiceCommand } from "@aws-sdk/client-ecs";

const ecsClient = new ECSClient({ region: process.env.AWS_REGION });

export const handler = async (event: EventBridgeEvent<string, any>) => {
  const command = new UpdateServiceCommand({
    cluster: process.env.ECS_CLUSTER_NAME!,
    service: process.env.ECS_SERVICE_NAME!,
    forceNewDeployment: true,
  });

  return await ecsClient.send(command);
};
