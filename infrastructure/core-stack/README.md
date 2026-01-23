# Core Stack - AWS CDK Infrastructure

This is a production-ready CDK stack for deploying a containerized application on AWS with best practices for security, scalability, and maintainability.

## Features

- 🔒 **Secure by Default**: Database credentials in Secrets Manager, encrypted storage, private subnets
- 🏗️ **Production-Ready**: Load balancer, auto-healing, logging, monitoring, and health checks
- 📦 **Container-Based**: ECS Fargate with ECR integration
- 🗄️ **Managed Database**: RDS PostgreSQL with automated backups
- 🚀 **Distributed Caching**: ElastiCache Redis for high-performance caching
- 🌐 **Networking**: VPC with public/private subnets and NAT gateway
- 📊 **Observability**: CloudWatch logs, Container Insights, and comprehensive outputs

## Architecture

The stack creates:

- **VPC**: Multi-AZ VPC with public and private subnets
- **RDS PostgreSQL**: Encrypted database in private subnet
- **ElastiCache Redis**: Single-node Redis cluster for caching in private subnet
- **ECS Fargate**: Containerized application with Application Load Balancer
- **Security Groups**: Least-privilege network access controls
- **Secrets Manager**: Secure credential storage and retrieval
- **IAM Roles**: Properly scoped permissions for ECS tasks

## Prerequisites

- Node.js 20.x or later
- AWS CLI configured with appropriate credentials
- AWS CDK CLI: `npm install -g aws-cdk`
- Docker image pushed to ECR repository

## Quick Start

1. **Clone and navigate to the stack directory:**
   ```bash
   cd infrastructure/core-stack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.dist .env
   # Edit .env with your AWS account details and configuration
   ```

4. **Build the stack:**
   ```bash
   npm run build
   ```

5. **Deploy to AWS:**
   ```bash
   npx cdk deploy
   ```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_ACCOUNT_ID` | Your AWS account number (12 digits) |
| `AWS_REGION` | AWS region for deployment (e.g., eu-west-1) |
| `AWS_ECR_REPOSITORY_NAME` | Name of your ECR repository |
| `DB_NAME` | Database name to create |
| `DB_USER` | Database username |
| `ACCESS_TOKEN_TTL` | JWT token time-to-live in seconds |
| `JWT_SECRET` | Secret key for JWT signing |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PORT` | 5432 | PostgreSQL port |
| `ENVIRONMENT` | dev | Environment name (dev/staging/prod) |
| `DESIRED_TASK_COUNT` | 1 | Number of ECS tasks to run |
| `CONTAINER_PORT` | 4000 | Application container port |
| `MAX_AZS` | 2 | Maximum availability zones |
| `NAT_GATEWAYS` | 1 | Number of NAT gateways |
| `ENABLE_DELETION_PROTECTION` | false | Protect database from deletion |

See `.env.dist` for a complete configuration template.

## Stack Outputs

After deployment, the stack provides these outputs:

- **LoadBalancerDnsName**: DNS name of the load balancer
- **LoadBalancerUrl**: HTTP URL to access the application
- **DatabaseEndpoint**: Database connection endpoint
- **DatabaseSecretArn**: ARN of the database credentials in Secrets Manager
- **RedisEndpoint**: Redis cluster endpoint address
- **RedisPort**: Redis cluster port (default: 6379)
- **VpcId**: ID of the created VPC
- **EcsClusterName**: Name of the ECS cluster

## Redis Configuration

The stack provisions an ElastiCache Redis cluster with the following configuration:

- **Engine**: Redis
- **Node Type**: `cache.t4g.micro` (suitable for development/small workloads)
- **Nodes**: Single node (non-clustered)
- **Port**: 6379
- **Subnet**: Private subnet (not publicly accessible)

### Connecting to Redis

ECS tasks automatically receive Redis connection details via environment variables:

- `REDIS_HOST`: Redis endpoint address
- `REDIS_PORT`: Redis port number

### Redis Security

- Redis is deployed in private subnets with no public access
- Security group allows connections only from ECS tasks
- No authentication enabled by default (secured via network isolation)

### Production Redis Considerations

For production workloads, consider:

1. **High Availability**: Use Redis replication group with automatic failover
2. **Authentication**: Enable Redis AUTH with a password stored in Secrets Manager
3. **Encryption**: Enable encryption in-transit and at-rest
4. **Node Type**: Upgrade to a larger instance type (e.g., `cache.r6g.large`)
5. **Multi-AZ**: Enable Multi-AZ for automatic failover

## Security Best Practices

This stack implements several security best practices:

1. **Database Credentials**: Auto-generated and stored in AWS Secrets Manager
2. **Network Isolation**: Database and Redis in private subnets, no public access
3. **Encryption**: Database storage encryption enabled
4. **Least Privilege**: Security groups restrict access to necessary ports only
5. **Secret Management**: ECS tasks retrieve secrets securely at runtime
6. **Audit Trail**: CloudWatch logs for application and infrastructure

### Security Notes

⚠️ **Important**: The `JWT_SECRET` is currently passed as an environment variable. For production:
- Move it to AWS Secrets Manager
- Use a strong, randomly generated value (32+ characters)
- Rotate regularly

## Development

### Build
```bash
npm run build
```

### Watch mode
```bash
npm run watch
```

### Run tests
```bash
npm run test
```

### Useful CDK Commands

* `npx cdk synth`   - Synthesize CloudFormation template
* `npx cdk diff`    - Compare deployed stack with current state
* `npx cdk deploy`  - Deploy this stack to your AWS account/region
* `npx cdk destroy` - Remove all resources (use with caution!)

## Accessing Database Credentials

Database passwords are automatically generated and stored in Secrets Manager:

```bash
# Retrieve database credentials
aws secretsmanager get-secret-value \
  --secret-id <stack-name>-db-credentials \
  --query SecretString \
  --output text | jq .

# Get just the password
aws secretsmanager get-secret-value \
  --secret-id <stack-name>-db-credentials \
  --query SecretString \
  --output text | jq -r .password
```

## Troubleshooting

### Missing Environment Variables
If you see an error about missing environment variables:
1. Ensure `.env` file exists and is properly configured
2. Check that all required variables are set
3. Verify variable names match `.env.dist`

### Deployment Failures
1. Check CloudFormation console for detailed error messages
2. Verify AWS credentials have necessary permissions
3. Ensure ECR repository exists and contains an image tagged `latest`
4. Check that the AWS account and region are correct

### Database Connection Issues
1. Verify security groups allow traffic from ECS to RDS
2. Check database endpoint in outputs matches application configuration
3. Ensure ECS tasks have permission to read from Secrets Manager

### Redis Connection Issues
1. Verify security groups allow traffic from ECS to ElastiCache (port 6379)
2. Check `REDIS_HOST` and `REDIS_PORT` environment variables in ECS task
3. Ensure Redis cluster is in `available` state in AWS Console
4. Confirm ECS tasks are running in the same VPC as Redis

## Production Considerations

Before deploying to production, consider:

1. **High Availability**
   - Enable multi-AZ for database (`multiAz: true`)
   - Upgrade Redis to a replication group with automatic failover
   - Increase NAT gateways to match availability zones
   - Configure ECS auto-scaling

2. **Security**
   - Move JWT_SECRET to Secrets Manager
   - Enable Redis AUTH with password from Secrets Manager
   - Enable deletion protection (`ENABLE_DELETION_PROTECTION=true`)
   - Configure AWS WAF for the load balancer
   - Set up VPN or AWS Systems Manager Session Manager for administrative access

3. **Monitoring**
   - Set up CloudWatch alarms for critical metrics
   - Monitor Redis memory usage and evictions
   - Configure SNS for alerting
   - Enable AWS X-Ray for distributed tracing

4. **Networking**
   - Configure custom domain with Route 53
   - Add SSL/TLS certificate via ACM
   - Update load balancer to use HTTPS

5. **Backup & Recovery**
   - Adjust backup retention period
   - Enable Redis snapshots for data persistence
   - Test restore procedures
   - Document recovery process

## License

See [LICENSE](../../LICENSE) file in the repository root.
