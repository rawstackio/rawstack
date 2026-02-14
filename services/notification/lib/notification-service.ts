import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class NotificationService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, 'NotificationServiceHandler', {
      runtime: Runtime.NODEJS_24_X,
      architecture: Architecture.ARM_64,
      entry: 'src/index.ts',
      handler: 'handler',
      environment: {
        SITE_URL: process.env.SITE_URL!,
        RESEND_API_KEY: process.env.RESEND_API_KEY!,
        EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS!,
        OVERRIDE_RECIPIENT_EMAIL: process.env.OVERRIDE_RECIPIENT_EMAIL ?? '',
      },
    });

    const userCreatedEventRule = new events.Rule(this, 'UserCreatedEventRule', {
      eventPattern: {
        source: ['core-api'],
        detailType: ['user.user.wasCreated'],
      },
    });
    userCreatedEventRule.addTarget(new targets.LambdaFunction(handler));

    const passwordResetRequestEventRule = new events.Rule(this, 'PasswordResetRequestEventRule', {
      eventPattern: {
        source: ['core-api'],
        detailType: ['auth.token.wasCreated'],
        detail: {
          data: { type: ['PASSWORD_RESET'] },
        },
      },
    });
    passwordResetRequestEventRule.addTarget(new targets.LambdaFunction(handler));

    const emailVerificationEventRule = new events.Rule(this, 'EmailVerificationEventRule', {
      eventPattern: {
        source: ['core-api'],
        detailType: ['auth.token.wasCreated'],
        detail: {
          data: { type: ['EMAIL_VERIFICATION'] },
        },
      },
    });
    emailVerificationEventRule.addTarget(new targets.LambdaFunction(handler));
  }
}
