import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';

export class SharedInfrastructureStack extends cdk.Stack {
  public readonly eventBus: events.EventBus;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create EventBridge event bus
    this.eventBus = new events.EventBus(this, 'TravierEventBus', {
      eventBusName: 'travier-event-bus'
    });

    // Output the event bus ARN
    new cdk.CfnOutput(this, 'EventBusArn', {
      value: this.eventBus.eventBusArn,
      description: 'The ARN of the EventBridge event bus',
      exportName: 'TravierEventBusArn'
    });
  }
}