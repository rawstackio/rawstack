# Admin Hosting Stack

This CDK stack deploys the admin React Vite application to AWS using S3 and CloudFront.

## Architecture

- **S3 Bucket**: Stores the static website files
- **CloudFront Distribution**: Global CDN for fast content delivery
- **Origin Access Identity**: Secure access from CloudFront to S3

## Prerequisites

1. Build the admin application:
   ```bash
   cd ../../apps/admin
   npm run build
   ```

2. Configure AWS credentials and region in `.env` file (copy from `.env.example`)

## Deployment

```bash
# Install dependencies
npm install

# Build the CDK stack
npm run build

# Deploy the stack
npm run cdk deploy
```

## Features

- **HTTPS Only**: All traffic is redirected to HTTPS
- **SPA Routing**: 404 and 403 errors redirect to index.html for client-side routing
- **Cache Optimization**: CloudFront caching for optimal performance
- **Automatic Deployment**: S3 deployment with CloudFront cache invalidation
- **Security**: 
  - No public bucket access
  - SSL/TLS enforcement
  - Origin Access Identity for secure CloudFront-to-S3 access

## Outputs

After deployment, the stack outputs:
- `WebsiteBucketName`: The S3 bucket name
- `DistributionId`: CloudFront distribution ID
- `DistributionDomainName`: CloudFront domain name
- `WebsiteUrl`: The full HTTPS URL to access the admin site

## Cleanup

To destroy the stack and all resources:
```bash
npm run cdk destroy
```
