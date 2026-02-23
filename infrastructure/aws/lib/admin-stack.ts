import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { CfnOutput, RemovalPolicy, Tags } from 'aws-cdk-lib';
import * as path from 'path';
import * as fs from 'fs';
import { DomainConfig, getHostedZone, isDomainConfigEnabled, toWwwDomain } from './domain';

/**
 * Configuration interface for AdminStack
 * Defines all required and optional configuration parameters
 */
interface AdminStackConfig {
  // Build configuration
  readonly adminBuildPath: string;

  // CloudFront configuration
  readonly priceClass: cloudfront.PriceClass;

  // Infrastructure configuration
  readonly environment?: string;
  readonly enableDeletionProtection?: boolean;

  /** Optional custom domain configuration. */
  readonly domain?: DomainConfig;
}

/**
 * AdminStack - Infrastructure as Code for admin website hosting
 *
 * This stack provisions:
 * - S3 bucket for static website hosting (private, accessed via CloudFront)
 * - CloudFront distribution with Origin Access Control (OAC)
 * - Automatic deployment of admin React Vite application
 * - SPA routing support with error page fallbacks
 *
 * @remarks
 * Follows AWS best practices for security and performance
 * Uses OAC (Origin Access Control) instead of deprecated OAI
 */
export class AdminStack extends cdk.Stack {
  // Constants for better maintainability
  private static readonly DEFAULT_ENVIRONMENT = 'dev';
  private static readonly DEFAULT_PRICE_CLASS = cloudfront.PriceClass.PRICE_CLASS_100;
  private static readonly DEFAULT_MEMORY_LIMIT = 512;
  private static readonly SPA_ERROR_TTL_MINUTES = 5;

  // Resource references for cross-stack usage
  public readonly websiteBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  /** The configured custom domain name (if enabled). */
  public customDomainName?: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Load and validate configuration
    const config = this.loadAndValidateConfig();

    // Apply tags to all resources in this stack
    this.applyStackTags(config.environment || AdminStack.DEFAULT_ENVIRONMENT);

    // Create S3 bucket for website hosting
    this.websiteBucket = this.createWebsiteBucket(config);

    // Create CloudFront distribution with OAC
    this.distribution = this.createCloudFrontDistribution(config);

    // Deploy website assets to S3
    this.deployWebsiteAssets(config);

    // Create CloudFormation outputs
    this.createOutputs();
  }

  /**
   * Loads configuration from environment variables and validates required values
   */
  private loadAndValidateConfig(): AdminStackConfig {
    const defaultAdminBuildPath = path.join(__dirname, '../../../apps/admin/dist');
    const adminBuildPath = process.env.ADMIN_BUILD_PATH || defaultAdminBuildPath;

    // Validate build path exists (only in non-synth context for CI/CD compatibility)
    if (process.env.CDK_CONTEXT_JSON === undefined && !fs.existsSync(adminBuildPath)) {
      console.warn(
        `Warning: Admin build path does not exist: ${adminBuildPath}\n` +
          `Make sure to build the admin app before deploying.`
      );
    }

    const priceClass = (() => {
      switch (process.env.ADMIN_CLOUDFRONT_PRICE_CLASS) {
        case 'PRICE_CLASS_100':
          return cloudfront.PriceClass.PRICE_CLASS_100;
        case 'PRICE_CLASS_200':
          return cloudfront.PriceClass.PRICE_CLASS_200;
        case 'PRICE_CLASS_ALL':
          return cloudfront.PriceClass.PRICE_CLASS_ALL;
        default:
          return AdminStack.DEFAULT_PRICE_CLASS;
      }
    })();

    const config: AdminStackConfig = {
      adminBuildPath,
      priceClass,
      environment: process.env.ENVIRONMENT || AdminStack.DEFAULT_ENVIRONMENT,
      enableDeletionProtection: process.env.ENABLE_DELETION_PROTECTION === 'true',
      domain: this.loadDomainConfigFromEnv(),
    };

    return config;
  }

  private loadDomainConfigFromEnv(): DomainConfig | undefined {
    const enabled = process.env.ADMIN_DOMAIN_ENABLED === 'true';
    if (!enabled) return undefined;

    const hostedZoneName = process.env.DOMAIN_HOSTED_ZONE_NAME;
    const hostedZoneId = process.env.DOMAIN_HOSTED_ZONE_ID;
    const domainName = process.env.ADMIN_DOMAIN_NAME;

    if (!hostedZoneName || !domainName) {
      throw new Error(
        'ADMIN_DOMAIN_ENABLED is true but DOMAIN_HOSTED_ZONE_NAME and/or ADMIN_DOMAIN_NAME are not set.'
      );
    }

    return {
      hostedZoneName,
      hostedZoneId,
      domainName,
      addWww: process.env.ADMIN_DOMAIN_ADD_WWW === 'true',
    };
  }

  /**
   * Applies consistent tags to all resources in the stack
   */
  private applyStackTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
    Tags.of(this).add('ManagedBy', 'CDK');
    Tags.of(this).add('Application', 'AdminStack');
  }

  /**
   * Creates S3 bucket for static website hosting
   *
   * @remarks
   * Bucket is private and accessed only through CloudFront
   * Uses S3 managed encryption for security
   */
  private createWebsiteBucket(config: AdminStackConfig): s3.Bucket {
    const bucket = new s3.Bucket(this, 'AdminWebsiteBucket', {
      bucketName: `${this.stackName.toLowerCase()}-website-${this.account}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: config.enableDeletionProtection
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      autoDeleteObjects: !config.enableDeletionProtection,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: config.enableDeletionProtection,
    });

    return bucket;
  }

  /**
   * Creates CloudFront distribution with Origin Access Control (OAC)
   *
   * @remarks
   * Uses OAC instead of deprecated OAI for better security
   * Configured for SPA routing with error page fallbacks
   */
  private createCloudFrontDistribution(config: AdminStackConfig): cloudfront.Distribution {
    // Create Origin Access Control for secure S3 access
    const oac = new cloudfront.S3OriginAccessControl(this, 'AdminOriginAccessControl', {
      description: `OAC for ${this.stackName} admin website`,
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
    });

    // Create S3 origin with OAC
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(this.websiteBucket, {
      originAccessControl: oac,
    });

    const { aliases, certificate } = this.maybeCreateDomainForCloudFront(config.domain);

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'AdminDistribution', {
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: this.createSpaErrorResponses(),
      priceClass: config.priceClass,
      enabled: true,
      comment: `${this.stackName} Admin Website Distribution`,
      domainNames: aliases,
      certificate,
    });

    if (isDomainConfigEnabled(config.domain)) {
      this.createRoute53RecordsForCloudFront(config.domain, distribution);
    }

    return distribution;
  }

  private maybeCreateDomainForCloudFront(domain?: DomainConfig): {
    aliases?: string[];
    certificate?: acm.ICertificate;
  } {
    if (!isDomainConfigEnabled(domain)) return {};

    // CloudFront certificates must be in us-east-1.
    const hostedZone = getHostedZone(this, domain, 'AdminHostedZoneCert');
    const cert = new acm.Certificate(this, 'AdminDomainCertificate', {
      domainName: domain.domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
      subjectAlternativeNames: domain.addWww ? [toWwwDomain(domain.domainName)] : undefined,
    });

    const aliases = [domain.domainName];
    if (domain.addWww) aliases.push(toWwwDomain(domain.domainName));

    this.customDomainName = domain.domainName;

    return { aliases, certificate: cert };
  }

  private createRoute53RecordsForCloudFront(domain: DomainConfig, distribution: cloudfront.Distribution): void {
    const zone = getHostedZone(this, domain, 'AdminHostedZoneRecords');

    new route53.ARecord(this, 'AdminAliasRecord', {
      zone,
      recordName: domain.domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    if (domain.addWww) {
      new route53.ARecord(this, 'AdminAliasRecordWww', {
        zone,
        recordName: toWwwDomain(domain.domainName),
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });
    }
  }

  /**
   * Creates error responses for SPA routing support
   *
   * @remarks
   * Redirects 403 and 404 errors to index.html for client-side routing
   */
  private createSpaErrorResponses(): cloudfront.ErrorResponse[] {
    return [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: cdk.Duration.minutes(AdminStack.SPA_ERROR_TTL_MINUTES),
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: cdk.Duration.minutes(AdminStack.SPA_ERROR_TTL_MINUTES),
      },
    ];
  }

  /**
   * Deploys website assets to S3 and invalidates CloudFront cache
   */
  private deployWebsiteAssets(config: AdminStackConfig): void {
    new s3deploy.BucketDeployment(this, 'AdminWebsiteDeployment', {
      sources: [s3deploy.Source.asset(config.adminBuildPath)],
      destinationBucket: this.websiteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
      prune: true,
      memoryLimit: AdminStack.DEFAULT_MEMORY_LIMIT,
    });
  }

  /**
   * Creates CloudFormation outputs for important resources
   */
  private createOutputs(): void {
    new CfnOutput(this, 'WebsiteBucketName', {
      value: this.websiteBucket.bucketName,
      description: 'S3 bucket name for admin website',
      exportName: `${this.stackName}-WebsiteBucketName`,
    });

    new CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `${this.stackName}-DistributionId`,
    });

    new CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
      exportName: `${this.stackName}-DistributionDomain`,
    });

    new CfnOutput(this, 'WebsiteUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Admin website URL',
      exportName: `${this.stackName}-WebsiteUrl`,
    });

    if (this.customDomainName) {
      new CfnOutput(this, 'CustomDomainName', {
        value: this.customDomainName,
        description: 'Custom domain name (if configured)',
        exportName: `${this.stackName}-CustomDomainName`,
      });

      new CfnOutput(this, 'CustomDomainUrl', {
        value: `https://${this.customDomainName}`,
        description: 'Custom domain URL (HTTPS)',
        exportName: `${this.stackName}-CustomDomainUrl`,
      });
    }
  }
}
