# Docker Setup for NestJS API

This document describes the Docker configuration for the RawStack NestJS API and how to build and push images to AWS ECR.

## Overview

The API is containerized using a multi-stage Docker build that:
1. Builds the NestJS application
2. Generates Prisma client
3. Creates a lightweight production image
4. Runs database migrations on startup

## Files

### Dockerfile
- **Multi-stage build** for optimal image size
- **Build stage**: Installs all dependencies and builds the application
- **Production stage**: Only includes production dependencies and built artifacts
- **Port**: Exposes port 3001 (matches the NestJS app configuration)
- **Health check**: Includes curl for container health checks

### docker-entrypoint.sh
- Runs Prisma migrations (`npx prisma migrate deploy`)
- Starts the NestJS application
- Ensures database is up-to-date before the API starts serving requests

### .dockerignore
- Excludes unnecessary files from the Docker build context
- Reduces build time and image size

## Building and Pushing to ECR

### Prerequisites

1. **AWS CLI** installed and configured:
   ```bash
   aws configure
   ```

2. **Docker** installed and running

3. **Environment variables** configured in `infrastructure/core-stack/.env`:
   - `AWS_REGION` - AWS region (e.g., us-east-1)
   - `AWS_ACCOUNT_ID` - Your AWS account ID
   - `AWS_ECR_REPOSITORY_NAME` - ECR repository name

### Using the Push Script

A convenience script is provided at `scripts/push-api-to-ecr.sh`:

```bash
# Push with default 'latest' tag
./scripts/push-api-to-ecr.sh

# Push with a specific tag
./scripts/push-api-to-ecr.sh v1.0.0
```

The script will:
1. Load environment variables from `infrastructure/core-stack/.env`
2. Login to ECR
3. Create the ECR repository if it doesn't exist
4. Build the Docker image
5. Tag and push to ECR

### Manual Build and Push

If you prefer to build and push manually:

```bash
cd apps/api

# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Build the image
docker build -t <repository-name>:latest .

# Tag the image
docker tag <repository-name>:latest <account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>:latest
```

## Local Development with Docker

### Build locally
```bash
cd apps/api
docker build -t rawstack-api:dev .
```

### Run locally (requires environment variables)
```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e JWT_SECRET="your-secret" \
  -e ACCESS_TOKEN_TTL="3600" \
  rawstack-api:dev
```

### Using Docker Compose
See `docker-compose.yml` for the complete local development setup with database.

## Environment Variables

The container expects these environment variables:

### Database
- `DATABASE_URL` - Full PostgreSQL connection string (or individual components below)
- `DB_HOST` - Database hostname
- `DB_NAME` - Database name
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password

### Application
- `JWT_SECRET` - Secret for JWT token signing
- `ACCESS_TOKEN_TTL` - JWT token TTL in seconds
- `ENVIRONMENT` - Environment name (dev/staging/prod)

## Health Check

The container includes a health check endpoint at `/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

This is used by:
- Docker health checks (in the Dockerfile)
- ECS health checks (in the core-stack CDK)
- Load balancer target group health checks

## Integration with CDK

The `infrastructure/core-stack` CDK stack is configured to:
1. Pull images from the ECR repository
2. Use the `latest` tag by default
3. Run containers on port 3001
4. Perform health checks on `/health`
5. Inject database credentials from AWS Secrets Manager

### Deploying Updates

After pushing a new image to ECR:

```bash
cd infrastructure/core-stack

# Deploy the stack (will use the latest image)
npx cdk deploy

# Or force a new deployment of the ECS service
aws ecs update-service --cluster <cluster-name> --service <service-name> --force-new-deployment --region <region>
```

## Troubleshooting

### Image build fails
- Ensure you're in the `apps/api` directory
- Check that `package.json` and `prisma/schema.prisma` exist
- Verify Node.js dependencies are correct

### Prisma migrations fail on startup
- Check DATABASE_URL environment variable is correct
- Ensure database is accessible from the container
- Verify migration files exist in `prisma/migrations/`

### Health check fails
- Container may be starting up (allow 60 seconds grace period)
- Check application logs for startup errors
- Verify port 3001 is accessible

### ECR push fails
- Verify AWS credentials are configured
- Check IAM permissions for ECR operations
- Ensure ECR repository exists or script has permission to create it

## Best Practices

1. **Tag images** with version numbers for production deployments
2. **Use specific tags** in production (avoid `latest` in prod)
3. **Monitor image size** - current size should be ~200-300MB
4. **Scan images** for vulnerabilities using ECR image scanning
5. **Keep base images updated** - regularly update `node:20-alpine`

## Security Considerations

- Database credentials are injected at runtime (not baked into the image)
- JWT secrets should come from AWS Secrets Manager in production
- Images are scanned for vulnerabilities in ECR
- Containers run as non-root user (Node.js default in alpine)
- Only production dependencies are included in the final image

