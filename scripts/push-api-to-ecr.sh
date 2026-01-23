#!/bin/bash
set -e

# Script to build and push the NestJS API Docker image to AWS ECR
# Usage: ./scripts/push-api-to-ecr.sh [tag]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load environment variables
if [ -f "$PROJECT_ROOT/infrastructure/core-stack/.env" ]; then
  export $(cat "$PROJECT_ROOT/infrastructure/core-stack/.env" | grep -v '^#' | xargs)
  echo -e "${GREEN}✓ Loaded environment variables from infrastructure/core-stack/.env${NC}"
else
  echo -e "${RED}✗ Error: .env file not found at infrastructure/core-stack/.env${NC}"
  exit 1
fi

# Check required environment variables
if [ -z "$AWS_REGION" ]; then
  echo -e "${RED}✗ Error: AWS_REGION not set${NC}"
  exit 1
fi

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo -e "${RED}✗ Error: AWS_ACCOUNT_ID not set${NC}"
  exit 1
fi

if [ -z "$AWS_ECR_REPOSITORY_NAME" ]; then
  echo -e "${RED}✗ Error: AWS_ECR_REPOSITORY_NAME not set${NC}"
  exit 1
fi

# Set variables
TAG=${1:-latest}
IMAGE_NAME="$AWS_ECR_REPOSITORY_NAME"
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
FULL_IMAGE_NAME="$ECR_REGISTRY/$IMAGE_NAME:$TAG"

echo -e "${YELLOW}Building and pushing Docker image to ECR...${NC}"
echo -e "Repository: ${GREEN}$IMAGE_NAME${NC}"
echo -e "Tag: ${GREEN}$TAG${NC}"
echo -e "Registry: ${GREEN}$ECR_REGISTRY${NC}"
echo ""

# Change to API directory
cd "$PROJECT_ROOT/apps/api"

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
  echo -e "${RED}✗ Error: Dockerfile not found in apps/api${NC}"
  exit 1
fi

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Error: Failed to login to ECR${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Successfully logged in to ECR${NC}"

# Create ECR repository if it doesn't exist
echo -e "${YELLOW}Checking if ECR repository exists...${NC}"
if aws ecr describe-repositories --repository-names "$IMAGE_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  echo -e "${GREEN}✓ ECR repository exists${NC}"
else
  echo -e "${YELLOW}Creating ECR repository...${NC}"
  aws ecr create-repository --repository-name "$IMAGE_NAME" --region "$AWS_REGION" >/dev/null
  echo -e "${GREEN}✓ ECR repository created${NC}"
fi

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build \
  --build-arg ACCESS_TOKEN_TTL="${ACCESS_TOKEN_TTL:-1500}" \
  --build-arg REFRESH_TOKEN_TTL="${REFRESH_TOKEN_TTL:-604800}" \
  --build-arg PASSWORD_RESET_TOKEN_TTL="${PASSWORD_RESET_TOKEN_TTL:-604800}" \
  --build-arg EMAIL_VERIFICATION_TOKEN_TTL="${EMAIL_VERIFICATION_TOKEN_TTL:-604800}" \
  --build-arg CACHE_TTL="${CACHE_TTL:-31499600}" \
  -t "$IMAGE_NAME:$TAG" .

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Error: Docker build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker image built successfully${NC}"

# Tag the image
echo -e "${YELLOW}Tagging image...${NC}"
docker tag "$IMAGE_NAME:$TAG" "$FULL_IMAGE_NAME"
echo -e "${GREEN}✓ Image tagged as $FULL_IMAGE_NAME${NC}"

# Push to ECR
echo -e "${YELLOW}Pushing image to ECR...${NC}"
docker push "$FULL_IMAGE_NAME"

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Error: Failed to push image to ECR${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✓ Successfully pushed image to ECR!${NC}"
echo -e "Image: ${GREEN}$FULL_IMAGE_NAME${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy the CDK stack: cd infrastructure/core-stack && npx cdk deploy"
