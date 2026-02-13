import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Rule } from 'aws-cdk-lib/aws-events';
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import { CfnOutput, Tags } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as logs from "aws-cdk-lib/aws-logs";
import * as path from 'path';

/**
 * Configuration interface for WebStack
 * Defines all required and optional configuration parameters
 */
interface WebStackConfig {
  // Required AWS configuration
  readonly ecrRepositoryName: string;

  // Infrastructure configuration
  readonly environment?: string;
  readonly desiredTaskCount?: number;
  readonly containerPort?: number;
  readonly enableDeletionProtection?: boolean;
  readonly cloudFrontPriceClass?: cloudfront.PriceClass;
}


export interface WebStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

/**
 * WebStack - Infrastructure as Code for the Next.js web application
 *
 * This stack provisions:
 * - ECS Fargate cluster with Application Load Balancer (using VPC from core-stack)
 * - CloudFront distribution for global content delivery
 * - ECR integration for container images
 * - Secure networking and IAM roles
 *
 * @remarks
 * This stack depends on core-stack and reuses its VPC and networking resources.
 * Deploy core-stack first before deploying this stack.
 * Follows AWS best practices for security and scalability
 */
export class WebStack extends cdk.Stack {
  // Constants for better maintainability
  private static readonly DEFAULT_CONTAINER_PORT = 3000;
  private static readonly DEFAULT_DESIRED_TASK_COUNT = 1;
  private static readonly DEFAULT_ENVIRONMENT = "dev";
  private static readonly DEFAULT_AUTOSCALING_MIN_CAPACITY = 1;
  private static readonly DEFAULT_AUTOSCALING_MAX_CAPACITY = 10;
  private static readonly DEFAULT_AUTOSCALING_CPU_TARGET = 70;
  private static readonly DEFAULT_AUTOSCALING_MEMORY_TARGET = 70;
  private static readonly DEFAULT_CLOUDFRONT_PRICE_CLASS = cloudfront.PriceClass.PRICE_CLASS_100;

  // Resource references for cross-stack usage
  public readonly vpc: ec2.IVpc;
  public readonly cluster: ecs.Cluster;
  public readonly fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    this.vpc = props.vpc;

    // Load and validate configuration
    const config = this.loadAndValidateConfig();

    // Apply tags to all resources in this stack
    this.applyStackTags(config.environment || WebStack.DEFAULT_ENVIRONMENT);

    // Create ECS cluster
    this.cluster = this.createEcsCluster();

    // Create ECS service with load balancer
    this.fargateService = this.createFargateService(config);

    // Create CloudFront distribution
    this.distribution = this.createCloudFrontDistribution(config);

    // Configure auto-scaling for ECS service
    this.configureAutoScaling();

    // Setup automatic deployment on ECR image push
    this.setupAutomaticDeployment(config);

    // Configure security groups
    this.configureSecurityGroups(config);

    // Create CloudFormation outputs
    this.createOutputs();
  }

  /**
   * Loads configuration from environment variables and validates required values
   */
  private loadAndValidateConfig(): WebStackConfig {
    const requiredEnvVars = ['WEB_ECR_REPOSITORY_NAME'];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
          `Please ensure all required variables are set in your .env file.`
      );
    }

    const config: WebStackConfig = {
      ecrRepositoryName: process.env.WEB_ECR_REPOSITORY_NAME!,
      environment: process.env.ENVIRONMENT || WebStack.DEFAULT_ENVIRONMENT,
      desiredTaskCount: process.env.WEB_DESIRED_TASK_COUNT
        ? parseInt(process.env.WEB_DESIRED_TASK_COUNT)
        : WebStack.DEFAULT_DESIRED_TASK_COUNT,
      containerPort: process.env.WEB_CONTAINER_PORT
        ? parseInt(process.env.WEB_CONTAINER_PORT)
        : WebStack.DEFAULT_CONTAINER_PORT,
      enableDeletionProtection: process.env.ENABLE_DELETION_PROTECTION === 'true',
      cloudFrontPriceClass: this.parseCloudFrontPriceClass(process.env.WEB_CLOUDFRONT_PRICE_CLASS),
    };

    return config;
  }

  /**
   * Parses CloudFront price class from environment variable
   */
  private parseCloudFrontPriceClass(priceClass?: string): cloudfront.PriceClass {
    switch (priceClass) {
      case 'PRICE_CLASS_100':
        return cloudfront.PriceClass.PRICE_CLASS_100;
      case 'PRICE_CLASS_200':
        return cloudfront.PriceClass.PRICE_CLASS_200;
      case 'PRICE_CLASS_ALL':
        return cloudfront.PriceClass.PRICE_CLASS_ALL;
      default:
        return WebStack.DEFAULT_CLOUDFRONT_PRICE_CLASS;
    }
  }

  /**
   * Applies consistent tags to all resources in the stack
   */
  private applyStackTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
    Tags.of(this).add('ManagedBy', 'CDK');
    Tags.of(this).add('Application', 'WebStack');
  }

  /**
   * Creates ECS Cluster
   */
  private createEcsCluster(): ecs.Cluster {
    return new ecs.Cluster(this, 'WebEcsCluster', {
      vpc: this.vpc,
      containerInsights: true,
    });
  }

  /**
   * Creates Fargate service with Application Load Balancer
   */
  private createFargateService(
    config: WebStackConfig
  ): ecsPatterns.ApplicationLoadBalancedFargateService {
    // Create task execution role with necessary permissions
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'ECS Task Execution Role for WebStack',
    });

    taskExecutionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
    );

    // Add permissions to access ECR
    taskExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
        ],
        resources: ['*'],
      })
    );

    // Role assumed by the running application
    const taskRole = new iam.Role(this, 'WebTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'IAM role for application runtime access',
    });

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['events:PutEvents'],
        resources: ['*'], // EventBridge does not support resource-level restriction
      })
    );

    // Create task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'WebTaskDefinition', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole: taskExecutionRole,
      taskRole: taskRole,
    });

    // Reference ECR repository
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'WebEcrRepository',
      config.ecrRepositoryName
    );

    // Add container to task definition
    const container = taskDefinition.addContainer('WebContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'WebApp',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        // Non-sensitive environment variables
        NODE_ENV: 'production',
        ENVIRONMENT: config.environment || WebStack.DEFAULT_ENVIRONMENT,
      },
    });

    container.addPortMappings({
      containerPort: config.containerPort || WebStack.DEFAULT_CONTAINER_PORT,
      protocol: ecs.Protocol.TCP,
    });

    // Create security group for ECS service
    const ecsServiceSecurityGroup = new ec2.SecurityGroup(this, 'EcsServiceSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ECS service',
      allowAllOutbound: true,
    });

    // Create Application Load Balanced Fargate Service
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'WebFargateService',
      {
        cluster: this.cluster,
        taskDefinition,
        publicLoadBalancer: true,
        desiredCount: config.desiredTaskCount || WebStack.DEFAULT_DESIRED_TASK_COUNT,
        listenerPort: 80,
        // WebStack uses the injected VPC from the core stack.
        taskSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        assignPublicIp: false,
        securityGroups: [ecsServiceSecurityGroup],
        // Must be >= container healthCheck startPeriod to avoid tasks getting killed during startup.
        healthCheckGracePeriod: cdk.Duration.seconds(180),
        enableExecuteCommand: true,
        circuitBreaker: { rollback: true },
      }
    );

    // Configure target group health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      // Use 'traffic-port' (default) - the port the target receives traffic on
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(15),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
    });

    return fargateService;
  }

  /**
   * Creates CloudFront distribution for global content delivery
   *
   * @remarks
   * CloudFront sits in front of the ALB to provide:
   * - Global edge caching
   * - DDoS protection
   * - SSL/TLS termination
   */
  private createCloudFrontDistribution(config: WebStackConfig): cloudfront.Distribution {
    // Create ALB origin for CloudFront
    const albOrigin = new origins.LoadBalancerV2Origin(this.fargateService.loadBalancer, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      httpPort: 80,
    });

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'WebDistribution', {
      defaultBehavior: {
        origin: albOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      priceClass: config.cloudFrontPriceClass || WebStack.DEFAULT_CLOUDFRONT_PRICE_CLASS,
      enabled: true,
      comment: `${this.stackName} Web Application Distribution`,
    });

    return distribution;
  }

  /**
   * Configures auto-scaling for the ECS Fargate service
   *
   * @remarks
   * Auto-scaling is configured based on CPU and memory utilization
   * Scales between min and max capacity defined in constants
   */
  private configureAutoScaling(): void {
    const scaling = this.fargateService.service.autoScaleTaskCount({
      minCapacity: WebStack.DEFAULT_AUTOSCALING_MIN_CAPACITY,
      maxCapacity: WebStack.DEFAULT_AUTOSCALING_MAX_CAPACITY,
    });

    // Scale based on CPU utilization
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: WebStack.DEFAULT_AUTOSCALING_CPU_TARGET,
    });

    // Scale based on memory utilization
    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: WebStack.DEFAULT_AUTOSCALING_MEMORY_TARGET,
    });
  }

  /**
   * Sets up automatic deployment when new images are pushed to ECR
   *
   * @remarks
   * Lambda function is triggered by EventBridge rule on ECR image push
   * Lambda updates the ECS service to pull the new image
   */
  private setupAutomaticDeployment(config: WebStackConfig): void {
    // Create IAM role for deployment Lambda
    const lambdaRole = new iam.Role(this, 'WebDeploymentLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Execution role for automatic deployment Lambda',
    });

    // Add basic execution permissions
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // Add ECS update permissions
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ecs:UpdateService',
          'ecs:DescribeServices',
          'ecs:DescribeClusters',
        ],
        resources: ['*'], // Consider restricting to specific cluster/service ARNs in production
      })
    );

    // Create Lambda function for deployment
    const deploymentLambda = new NodejsFunction(this, 'WebDeploymentLambda', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/web-stack/deployment-trigger.ts'),
      handler: 'handler',
      role: lambdaRole,
      description: 'Triggers ECS service update on ECR image push',
      environment: {
        ECS_CLUSTER_NAME: this.cluster.clusterName,
        ECS_SERVICE_NAME: this.fargateService.service.serviceName,
      },
    });

    // Create EventBridge rule to trigger on ECR image push
    new Rule(this, 'EcrImagePushRule', {
      description: 'Trigger deployment on ECR image push',
      eventPattern: {
        source: ['aws.ecr'],
        detailType: ['ECR Image Action'],
        detail: {
          'action-type': ['PUSH'],
          'repository-name': [config.ecrRepositoryName],
          'image-tag': ['latest'],
        },
      },
      targets: [new targets.LambdaFunction(deploymentLambda)],
    });
  }

  /**
   * Configures security groups to allow necessary network traffic
   */
  private configureSecurityGroups(config: WebStackConfig): void {
    const ecsSecurityGroup = this.fargateService.service.connections.securityGroups[0];

    // Allow load balancer to connect to ECS tasks
    ecsSecurityGroup.addIngressRule(
      this.fargateService.loadBalancer.connections.securityGroups[0],
      ec2.Port.tcp(config.containerPort || WebStack.DEFAULT_CONTAINER_PORT),
      'Allow load balancer to connect to ECS tasks'
    );
  }

  /**
   * Creates CloudFormation outputs for important resources
   */
  private createOutputs(): void {
    new CfnOutput(this, 'LoadBalancerDnsName', {
      value: this.fargateService.loadBalancer.loadBalancerDnsName,
      description: 'DNS name of the Application Load Balancer',
      exportName: `${this.stackName}-LoadBalancerDns`,
    });

    new CfnOutput(this, 'LoadBalancerUrl', {
      value: `http://${this.fargateService.loadBalancer.loadBalancerDnsName}`,
      description: 'URL of the Application Load Balancer',
    });

    new CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
      exportName: `${this.stackName}-DistributionDomain`,
    });

    new CfnOutput(this, 'DistributionUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL (recommended for production use)',
    });

    new CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `${this.stackName}-DistributionId`,
    });

    new CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${this.stackName}-VpcId`,
    });

    new CfnOutput(this, 'EcsClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster name',
      exportName: `${this.stackName}-EcsClusterName`,
    });
  }
}
