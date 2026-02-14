import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Rule } from 'aws-cdk-lib/aws-events';
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import { CfnOutput, RemovalPolicy, Tags } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

/**
 * Configuration interface for CoreStack
 * Defines all required and optional configuration parameters
 */
interface CoreStackConfig {
  // Required AWS configuration
  readonly ecrRepositoryName: string;

  // Database configuration
  readonly databaseName: string;
  readonly databaseUser: string;
  readonly databasePort?: number;

  // Application configuration
  readonly jwtAccessTokenTtl: string;
  readonly jwtSecret: string;

  // Infrastructure configuration
  readonly environment?: string;
  readonly desiredTaskCount?: number;
  readonly containerPort?: number;
  readonly maxAzs?: number;
  readonly natGateways?: number;
  readonly enableDeletionProtection?: boolean;
}

/**
 * CoreStack - Infrastructure as Code for the application
 *
 * This stack provisions:
 * - VPC with public and private subnets
 * - RDS PostgreSQL database with secure credentials
 * - REDIS
 * - ECS Fargate cluster with Application Load Balancer
 * - ECR integration for container images
 * - Secure networking and IAM roles
 *
 * @remarks
 * Follows AWS best practices for security and scalability
 */
export class CoreStack extends cdk.Stack {
  // Constants for better maintainability
  private static readonly DEFAULT_CONTAINER_PORT = 3001;
  private static readonly DEFAULT_DATABASE_PORT = 5432;
  private static readonly DEFAULT_REDIS_PORT = 6379;
  private static readonly DEFAULT_DESIRED_TASK_COUNT = 1;
  private static readonly DEFAULT_MAX_AZS = 2;
  private static readonly DEFAULT_NAT_GATEWAYS = 1;
  private static readonly DEFAULT_ENVIRONMENT = "dev";
  private static readonly DEFAULT_AUTOSCALING_MIN_CAPACITY = 1;
  private static readonly DEFAULT_AUTOSCALING_MAX_CAPACITY = 10;
  private static readonly DEFAULT_AUTOSCALING_CPU_TARGET = 70;
  private static readonly DEFAULT_AUTOSCALING_MEMORY_TARGET = 70;

  // Resource references for cross-stack usage
  public readonly vpc: ec2.Vpc;
  public readonly database: rds.DatabaseInstance;
  public readonly redis: elasticache.CfnCacheCluster;
  public readonly cluster: ecs.Cluster;
  public readonly fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Load and validate configuration
    const config = this.loadAndValidateConfig();

    // Apply tags to all resources in this stack
    this.applyStackTags(config.environment || CoreStack.DEFAULT_ENVIRONMENT);

    // Create VPC
    this.vpc = this.createVpc(config);

    // Create database with secure credentials
    const { database, databaseSecret } = this.createDatabase(config);
    this.database = database;

    // Create ECS cluster
    this.cluster = this.createEcsCluster();

    // Create ECS service with load balancer
    this.fargateService = this.createFargateService(config, databaseSecret);

    // Create Redis cache cluster
    this.redis = this.createRedisCluster();

    // Configure auto-scaling for ECS service
    this.configureAutoScaling();

    // Setup automatic deployment on ECR image push
    this.setupAutomaticDeployment(config);

    // Configure security groups
    this.configureSecurityGroups(config);

    // Create CloudFormation outputs
    this.createOutputs(databaseSecret);
  }

  /**
   * Loads configuration from environment variables and validates required values
   */
  private loadAndValidateConfig(): CoreStackConfig {
    const requiredEnvVars = [
      'CORE_ECR_REPOSITORY_NAME',
      'CORE_DB_NAME',
      'CORE_DB_USER',
      'CORE_ACCESS_TOKEN_TTL',
      'CORE_JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please ensure all required variables are set in your .env file.`
      );
    }

    const config: CoreStackConfig = {
      ecrRepositoryName: process.env.CORE_ECR_REPOSITORY_NAME!,
      databaseName: process.env.CORE_DB_NAME!,
      databaseUser: process.env.CORE_DB_USER!,
      databasePort: process.env.CORE_DB_PORT ? parseInt(process.env.CORE_DB_PORT) : CoreStack.DEFAULT_DATABASE_PORT,
      jwtAccessTokenTtl: process.env.CORE_ACCESS_TOKEN_TTL!,
      jwtSecret: process.env.CORE_JWT_SECRET!,
      environment: process.env.ENVIRONMENT || CoreStack.DEFAULT_ENVIRONMENT,
      desiredTaskCount: process.env.CORE_DESIRED_TASK_COUNT
        ? parseInt(process.env.CORE_DESIRED_TASK_COUNT)
        : CoreStack.DEFAULT_DESIRED_TASK_COUNT,
      containerPort: process.env.CORE_CONTAINER_PORT
        ? parseInt(process.env.CORE_CONTAINER_PORT)
        : CoreStack.DEFAULT_CONTAINER_PORT,
      maxAzs: process.env.CORE_MAX_AZS ? parseInt(process.env.CORE_MAX_AZS) : CoreStack.DEFAULT_MAX_AZS,
      natGateways: process.env.CORE_NAT_GATEWAYS
        ? parseInt(process.env.CORE_NAT_GATEWAYS)
        : CoreStack.DEFAULT_NAT_GATEWAYS,
      enableDeletionProtection: process.env.ENABLE_DELETION_PROTECTION === 'true'
    };

    return config;
  }

  /**
   * Applies consistent tags to all resources in the stack
   */
  private applyStackTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
    Tags.of(this).add('ManagedBy', 'CDK');
    Tags.of(this).add('Application', 'CoreStack');
  }

  /**
   * Creates VPC with public and private subnets
   */
  private createVpc(config: CoreStackConfig): ec2.Vpc {
    const vpc = new ec2.Vpc(this, 'CoreVpc', {
      maxAzs: config.maxAzs || CoreStack.DEFAULT_MAX_AZS,
      natGateways: config.natGateways || CoreStack.DEFAULT_NAT_GATEWAYS,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    return vpc;
  }

  /**
   * Creates RDS PostgreSQL database with secure credentials stored in Secrets Manager
   *
   * @remarks
   * Database credentials are automatically generated and stored in AWS Secrets Manager
   * The database is placed in private subnets for security
   */
  private createDatabase(config: CoreStackConfig): {
    database: rds.DatabaseInstance;
    databaseSecret: secretsmanager.ISecret;
  } {
    // Create secure database credentials in Secrets Manager
    const databaseSecret = new secretsmanager.Secret(this, 'CoreDatabaseSecret', {
      secretName: `${this.stackName}-db-credentials`,
      description: 'Database credentials for CoreStack',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: config.databaseUser
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
      },
    });

    // Create database instance
    const database = new rds.DatabaseInstance(this, 'CoreDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO,
      ),
      credentials: rds.Credentials.fromSecret(databaseSecret),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      databaseName: config.databaseName,
      port: config.databasePort || CoreStack.DEFAULT_DATABASE_PORT,
      removalPolicy: config.enableDeletionProtection
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      deletionProtection: config.enableDeletionProtection || false,
      backupRetention: cdk.Duration.days(7),
      allocatedStorage: 20,
      storageEncrypted: true,
      multiAz: false, // Set to true for production
    });

    return { database, databaseSecret };
  }

  /**
   * Creates ECS Cluster
   */
  private createEcsCluster(): ecs.Cluster {
    return new ecs.Cluster(this, 'CoreApiEcsCluster', {
      vpc: this.vpc,
      containerInsights: true,
    });
  }

  /**
   * Creates Fargate service with Application Load Balancer
   */
  private createFargateService(
    config: CoreStackConfig,
    databaseSecret: secretsmanager.ISecret
  ): ecsPatterns.ApplicationLoadBalancedFargateService {
    // Create task execution role with necessary permissions
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'ECS Task Execution Role for CoreStack',
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
    const taskRole = new iam.Role(this, 'CoreApiTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'IAM role for application runtime access',
    });

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['events:PutEvents'],
        resources: ['*'], // EventBridge does not support resource-level restriction
      })
    );

    // Grant read access to database secret
    databaseSecret.grantRead(taskExecutionRole);

    // Create task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'CoreApiTaskDefinition', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole: taskExecutionRole,
      taskRole: taskRole,
    });

    // Reference ECR repository
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'CoreApiEcrRepository',
      config.ecrRepositoryName
    );

    // Add container to task definition
    const container = taskDefinition.addContainer('CoreApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'CoreApi',
        logRetention: 7, // Retain logs for 7 days
      }),
      environment: {
        // Non-sensitive environment variables
        SYSTEM_NAME: 'core-api',
        DB_HOST: this.database.instanceEndpoint.hostname,
        DB_NAME: config.databaseName,
        DB_PORT: (config.databasePort || CoreStack.DEFAULT_DATABASE_PORT).toString(),
        DB_SSL: 'true',
        ACCESS_TOKEN_TTL: config.jwtAccessTokenTtl,
        JWT_SECRET: config.jwtSecret, // TODO: Move to Secrets Manager in production
        ENVIRONMENT: config.environment || CoreStack.DEFAULT_ENVIRONMENT,
      },
      secrets: {
        // Sensitive values from Secrets Manager
        DB_USER: ecs.Secret.fromSecretsManager(databaseSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(databaseSecret, 'password'),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3001/v1/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    container.addPortMappings({
      containerPort: config.containerPort || CoreStack.DEFAULT_CONTAINER_PORT,
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
      'CoreFargateService',
      {
        cluster: this.cluster,
        taskDefinition,
        publicLoadBalancer: true,
        desiredCount: config.desiredTaskCount || CoreStack.DEFAULT_DESIRED_TASK_COUNT,
        listenerPort: 80,
        taskSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [ecsServiceSecurityGroup],
        healthCheckGracePeriod: cdk.Duration.seconds(60),
        enableExecuteCommand: true,
        circuitBreaker: { rollback: true }
      }
    );

    // Configure target group health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/v1/health',
      port: (config.containerPort || CoreStack.DEFAULT_CONTAINER_PORT).toString(),
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    return fargateService;
  }

  /**
   * Creates Redis (ElastiCache) cluster
   *
   * @remarks
   * Redis cluster is placed in private subnets for security
   * ECS tasks can connect to Redis through the configured security group
   */
  private createRedisCluster(): elasticache.CfnCacheCluster {
    // Create security group for Redis
    const redisSecurityGroup = new ec2.SecurityGroup(this, 'CoreRedisSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Redis cluster',
      allowAllOutbound: true,
    });

    // Create subnet group for Redis in private subnets
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CoreRedisSubnetGroup', {
      description: 'Subnet group for Redis cluster',
      subnetIds: this.vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }).subnetIds,
    });

    // Create single-node Redis cache cluster
    const redis = new elasticache.CfnCacheCluster(this, 'CoreRedisCluster', {
      engine: 'redis',
      cacheNodeType: 'cache.t4g.micro',
      numCacheNodes: 1,
      port: CoreStack.DEFAULT_REDIS_PORT,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
    });

    // Ensure subnet group is created first
    redis.addDependency(redisSubnetGroup);

    // Allow ECS tasks to connect to Redis
    const ecsSecurityGroup = this.fargateService.service.connections.securityGroups[0];
    redisSecurityGroup.addIngressRule(
      ecsSecurityGroup,
      ec2.Port.tcp(CoreStack.DEFAULT_REDIS_PORT),
      'Allow ECS tasks to connect to Redis'
    );

    // Provide Redis endpoint details to the container
    this.fargateService.taskDefinition.defaultContainer?.addEnvironment(
      'REDIS_HOST',
      redis.attrRedisEndpointAddress
    );
    this.fargateService.taskDefinition.defaultContainer?.addEnvironment(
      'REDIS_PORT',
      redis.attrRedisEndpointPort
    );

    return redis;
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
      minCapacity: CoreStack.DEFAULT_AUTOSCALING_MIN_CAPACITY,
      maxCapacity: CoreStack.DEFAULT_AUTOSCALING_MAX_CAPACITY,
    });

    // Scale based on CPU utilization
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: CoreStack.DEFAULT_AUTOSCALING_CPU_TARGET,
    });

    // Scale based on memory utilization
    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: CoreStack.DEFAULT_AUTOSCALING_MEMORY_TARGET,
    });
  }

  /**
   * Sets up automatic deployment when new images are pushed to ECR
   *
   * @remarks
   * Lambda function is triggered by EventBridge rule on ECR image push
   * Lambda updates the ECS service to pull the new image
   */
  private setupAutomaticDeployment(config: CoreStackConfig): void {
    // Create IAM role for deployment Lambda
    const lambdaRole = new iam.Role(this, 'CoreApiDeploymentLambdaRole', {
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
    const deploymentLambda = new NodejsFunction(this, 'CoreApiDeploymentLambda', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/core-stack/deployment-trigger.ts'),
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
  private configureSecurityGroups(config: CoreStackConfig): void {
    const ecsSecurityGroup = this.fargateService.service.connections.securityGroups[0];

    // Allow ECS tasks to access RDS database
    this.database.connections.allowFrom(
      ecsSecurityGroup,
      ec2.Port.tcp(config.databasePort || CoreStack.DEFAULT_DATABASE_PORT),
      'Allow ECS tasks to access RDS database'
    );

    // Allow load balancer to connect to ECS tasks
    ecsSecurityGroup.addIngressRule(
      this.fargateService.loadBalancer.connections.securityGroups[0],
      ec2.Port.tcp(config.containerPort || CoreStack.DEFAULT_CONTAINER_PORT),
      'Allow load balancer to connect to ECS tasks'
    );
  }

  /**
   * Creates CloudFormation outputs for important resources
   */
  private createOutputs(databaseSecret: secretsmanager.ISecret): void {
    new CfnOutput(this, 'LoadBalancerDnsName', {
      value: this.fargateService.loadBalancer.loadBalancerDnsName,
      description: 'DNS name of the Application Load Balancer',
      exportName: `${this.stackName}-LoadBalancerDns`,
    });

    new CfnOutput(this, 'LoadBalancerUrl', {
      value: `http://${this.fargateService.loadBalancer.loadBalancerDnsName}`,
      description: 'URL of the Application Load Balancer',
    });

    new CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'Database endpoint hostname',
      exportName: `${this.stackName}-DatabaseEndpoint`,
    });

    new CfnOutput(this, 'DatabaseSecretArn', {
      value: databaseSecret.secretArn,
      description: 'ARN of the database credentials secret',
      exportName: `${this.stackName}-DatabaseSecretArn`,
    });

    new CfnOutput(this, 'RedisEndpoint', {
      value: this.redis.attrRedisEndpointAddress,
      description: 'Redis endpoint address',
      exportName: `${this.stackName}-RedisEndpoint`,
    });

    new CfnOutput(this, 'RedisPort', {
      value: this.redis.attrRedisEndpointPort,
      description: 'Redis endpoint port',
      exportName: `${this.stackName}-RedisPort`,
    });

    new CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${this.stackName}-VpcId`,
    });

    // Export AZs and subnet IDs for cross-stack imports (e.g., web-stack/admin-stack).
    // We export as a comma-separated string for easy consumption via Fn.importValue.
    new CfnOutput(this, 'VpcAvailabilityZones', {
      value: cdk.Fn.join(',', this.vpc.availabilityZones),
      description: 'Comma-separated list of VPC availability zones',
      exportName: `${this.stackName}-VpcAvailabilityZones`,
    });

    new CfnOutput(this, 'PublicSubnet1Id', {
      value: this.vpc.publicSubnets[0].subnetId,
      description: 'ID of public subnet 1',
      exportName: `${this.stackName}-PublicSubnet1Id`,
    });

    new CfnOutput(this, 'PublicSubnet2Id', {
      value: this.vpc.publicSubnets[1].subnetId,
      description: 'ID of public subnet 2',
      exportName: `${this.stackName}-PublicSubnet2Id`,
    });

    new CfnOutput(this, 'PrivateSubnet1Id', {
      value: this.vpc.privateSubnets[0].subnetId,
      description: 'ID of private subnet 1',
      exportName: `${this.stackName}-PrivateSubnet1Id`,
    });

    new CfnOutput(this, 'PrivateSubnet2Id', {
      value: this.vpc.privateSubnets[1].subnetId,
      description: 'ID of private subnet 2',
      exportName: `${this.stackName}-PrivateSubnet2Id`,
    });

    new CfnOutput(this, 'EcsClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster name',
      exportName: `${this.stackName}-EcsClusterName`,
    });
  }
}
