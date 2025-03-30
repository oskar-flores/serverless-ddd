import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as path from 'path';

interface BookingStackProps extends cdk.StackProps {
  eventBus: events.EventBus;
}

export class BookingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BookingStackProps) {
    super(scope, id, props);

    // Create DynamoDB table for tickets
    const ticketsTable = new dynamodb.Table(this, 'TicketsTable', {
      tableName: 'Tickets',
      partitionKey: { name: 'ticketId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY // For development only
    });

    // Add GSIs for querying by flightId and passengerId
    ticketsTable.addGlobalSecondaryIndex({
      indexName: 'FlightIdIndex',
      partitionKey: { name: 'flightId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    ticketsTable.addGlobalSecondaryIndex({
      indexName: 'PassengerIdIndex',
      partitionKey: { name: 'passengerId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Create Lambda functions for Booking use cases
    const reserveTicketLambda = new lambda.Function(this, 'ReserveTicketFunction', {
      functionName: 'ReserveTicket',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'context/booking/infrastructure/adapters/handlers/ReserveTicketHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist')),
      environment: {
        TICKETS_TABLE_NAME: ticketsTable.tableName,
        EVENT_BUS_NAME: props.eventBus.eventBusName
      },
      timeout: cdk.Duration.seconds(30)
    });

    const checkInTicketLambda = new lambda.Function(this, 'CheckInTicketFunction', {
      functionName: 'CheckInTicket',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'context/booking/infrastructure/adapters/handlers/CheckInTicketHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist')),
      environment: {
        TICKETS_TABLE_NAME: ticketsTable.tableName,
        EVENT_BUS_NAME: props.eventBus.eventBusName
      },
      timeout: cdk.Duration.seconds(30)
    });

    const cancelTicketLambda = new lambda.Function(this, 'CancelTicketFunction', {
      functionName: 'CancelTicket',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'context/booking/infrastructure/adapters/handlers/CancelTicketHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist')),
      environment: {
        TICKETS_TABLE_NAME: ticketsTable.tableName,
        EVENT_BUS_NAME: props.eventBus.eventBusName
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Grant permissions to Lambda functions
    ticketsTable.grantReadWriteData(reserveTicketLambda);
    ticketsTable.grantReadWriteData(checkInTicketLambda);
    ticketsTable.grantReadWriteData(cancelTicketLambda);

    // Grant permissions to put events on the event bus
    props.eventBus.grantPutEventsTo(reserveTicketLambda);
    props.eventBus.grantPutEventsTo(checkInTicketLambda);
    props.eventBus.grantPutEventsTo(cancelTicketLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'BookingApi', {
      restApiName: 'Booking Service',
      description: 'API for the Booking bounded context',
      deployOptions: {
        stageName: 'prod'
      }
    });

    // Create API resources and methods
    const bookingResource = api.root.addResource('booking');

    // Reserve ticket endpoint
    const reserveTicketResource = bookingResource.addResource('reserve');
    reserveTicketResource.addMethod('POST', new apigateway.LambdaIntegration(reserveTicketLambda));

    // Check-in ticket endpoint
    const checkInTicketResource = bookingResource.addResource('check-in');
    checkInTicketResource.addMethod('POST', new apigateway.LambdaIntegration(checkInTicketLambda));

    // Cancel ticket endpoint
    const cancelTicketResource = bookingResource.addResource('cancel');
    cancelTicketResource.addMethod('POST', new apigateway.LambdaIntegration(cancelTicketLambda));

    // Output the API URL
    new cdk.CfnOutput(this, 'BookingApiUrl', {
      value: api.url,
      description: 'The URL of the Booking API',
      exportName: 'BookingApiUrl'
    });
  }
}
