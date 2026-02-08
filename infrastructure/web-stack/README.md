# Web Stack

AWS CDK stack for deploying the Next.js web application on AWS ECS Fargate with CloudFront CDN.

**⚠️ Important: This stack depends on the core-stack and must be deployed after it.**

## Architecture

This stack provisions:
- ECS Fargate cluster running the containerized Next.js app (using VPC from core-stack)
- Application Load Balancer for ECS tasks
- CloudFront distribution for global content delivery
- Automatic deployment on ECR image push
- Auto-scaling based on CPU and memory utilization

This stack reuses the VPC, subnets, and networking infrastructure from the core-stack to minimize costs and simplify network management.

## Prerequisites

1. It is recommended that the **Core stack should be deployed first** - This stack can then use the core-stack's VPC and networking resources
2. AWS CLI configured with appropriate credentials
3. Docker installed for building images
4. Node.js and npm installed
5. Next.js application built and containerized

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure your AWS account, region, and core-stack name:
   ```bash
   AWS_ACCOUNT_ID=your-account-id
   AWS_REGION=your-region
   AWS_ECR_REPOSITORY_NAME=rawstack-web-app
   CORE_STACK_NAME=core  # Name of your deployed core-stack
   ```

3. **Deploy core-stack first (if not already deployed):**
   ```bash
   cd ../core-stack
   # Configure core-stack .env file
   npx cdk deploy
   cd ../web-stack
   ```

4. Build and push the Docker image to ECR:
   ```bash
   cd ../..
   ./scripts/push-web-to-ecr.sh
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Bootstrap CDK (first time only):
   ```bash
   npx cdk bootstrap aws://ACCOUNT_ID/REGION
   ```

7. Deploy the stack:
   ```bash
   npx cdk deploy
   ```

## Useful Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npx cdk diff` - Compare deployed stack with current state
- `npx cdk synth` - Emit the synthesized CloudFormation template
- `npx cdk deploy` - Deploy this stack to your AWS account
- `npx cdk destroy` - Remove the stack from your AWS account

## Configuration

All configuration is done via environment variables in the `.env` file:

- **AWS_ACCOUNT_ID**: Your AWS account ID
- **AWS_REGION**: AWS region for deployment
- **AWS_ECR_REPOSITORY_NAME**: Name of the ECR repository
- **CORE_STACK_NAME**: Name of the core-stack (must be deployed first)
- **ENVIRONMENT**: Environment name (dev/staging/prod)
- **DESIRED_TASK_COUNT**: Number of ECS tasks to run
- **CONTAINER_PORT**: Port the container listens on (default: 3000)
- **CLOUDFRONT_PRICE_CLASS**: CloudFront edge location coverage

## Outputs

After deployment, the stack outputs:
- Load Balancer DNS name
- Load Balancer URL
- CloudFront Distribution domain name
- CloudFront Distribution URL
- VPC ID
- ECS Cluster name

## Automatic Deployment

The stack includes automatic deployment functionality:
- When a new image is pushed to ECR with the "latest" tag
- EventBridge triggers a Lambda function
- Lambda forces a new ECS service deployment
- ECS pulls the new image and performs a rolling update
