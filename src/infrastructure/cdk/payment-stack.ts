import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';

interface PaymentStackProps extends cdk.StackProps {
  eventBus: events.EventBus;
}

export class PaymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PaymentStackProps) {
    super(scope, id, props);

    // Create DynamoDB table for payments
    const paymentsTable = new dynamodb.Table(this, 'PaymentsTable', {
      tableName: 'Payments',
      partitionKey: { name: 'paymentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY // For development only
    });

    // Add GSI for querying by ticketId
    paymentsTable.addGlobalSecondaryIndex({
      indexName: 'TicketIdIndex',
      partitionKey: { name: 'ticketId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Create Lambda functions for Payment use cases
    const processPaymentLambda = new lambda.Function(this, 'ProcessPaymentFunction', {
      functionName: 'ProcessPayment',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'context/payment/infrastructure/adapters/handlers/ProcessPaymentHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist')),
      environment: {
        PAYMENTS_TABLE_NAME: paymentsTable.tableName,
        EVENT_BUS_NAME: props.eventBus.eventBusName
      },
      timeout: cdk.Duration.seconds(30)
    });

    const issueRefundLambda = new lambda.Function(this, 'IssueRefundFunction', {
      functionName: 'IssueRefund',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'context/payment/infrastructure/adapters/handlers/IssueRefundHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist')),
      environment: {
        PAYMENTS_TABLE_NAME: paymentsTable.tableName,
        EVENT_BUS_NAME: props.eventBus.eventBusName
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Grant permissions to Lambda functions
    paymentsTable.grantReadWriteData(processPaymentLambda);
    paymentsTable.grantReadWriteData(issueRefundLambda);

    // Grant permissions to put events on the event bus
    props.eventBus.grantPutEventsTo(processPaymentLambda);
    props.eventBus.grantPutEventsTo(issueRefundLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'PaymentApi', {
      restApiName: 'Payment Service',
      description: 'API for the Payment bounded context',
      deployOptions: {
        stageName: 'prod'
      }
    });

    // Create API resources and methods
    const paymentResource = api.root.addResource('payment');

    // Process payment endpoint
    const processPaymentResource = paymentResource.addResource('process');
    processPaymentResource.addMethod('POST', new apigateway.LambdaIntegration(processPaymentLambda));

    // Issue refund endpoint
    const issueRefundResource = paymentResource.addResource('refund');
    issueRefundResource.addMethod('POST', new apigateway.LambdaIntegration(issueRefundLambda));

    // Set up event rules to listen for events from the Booking context
    // Listen for TicketReserved events to automatically process payment
    const ticketReservedRule = new events.Rule(this, 'TicketReservedRule', {
      eventBus: props.eventBus,
      eventPattern: {
        source: ['com.travier.booking'],
        detailType: ['TicketReserved']
      },
      description: 'Rule to capture TicketReserved events and trigger payment processing'
    });

    // We could add a Lambda function here to handle the TicketReserved event and initiate payment
    // For now, we'll just log the event
    const logTicketReservedLambda = new lambda.Function(this, 'LogTicketReservedFunction', {
      functionName: 'LogTicketReserved',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log('TicketReserved event received:', JSON.stringify(event, null, 2));
          return { statusCode: 200, body: 'Event logged' };
        };
      `),
      timeout: cdk.Duration.seconds(30)
    });

    ticketReservedRule.addTarget(new targets.LambdaFunction(logTicketReservedLambda));

    // Listen for TicketCancelled events to automatically process refunds
    const ticketCancelledRule = new events.Rule(this, 'TicketCancelledRule', {
      eventBus: props.eventBus,
      eventPattern: {
        source: ['com.travier.booking'],
        detailType: ['TicketCancelled']
      },
      description: 'Rule to capture TicketCancelled events and trigger refund processing'
    });

    // We could add a Lambda function here to handle the TicketCancelled event and initiate refund
    // For now, we'll just log the event
    const logTicketCancelledLambda = new lambda.Function(this, 'LogTicketCancelledFunction', {
      functionName: 'LogTicketCancelled',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log('TicketCancelled event received:', JSON.stringify(event, null, 2));
          return { statusCode: 200, body: 'Event logged' };
        };
      `),
      timeout: cdk.Duration.seconds(30)
    });

    ticketCancelledRule.addTarget(new targets.LambdaFunction(logTicketCancelledLambda));

    // Output the API URL
    new cdk.CfnOutput(this, 'PaymentApiUrl', {
      value: api.url,
      description: 'The URL of the Payment API',
      exportName: 'PaymentApiUrl'
    });
  }
}
