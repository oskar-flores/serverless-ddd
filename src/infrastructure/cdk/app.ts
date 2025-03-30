#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SharedInfrastructureStack } from './shared-infrastructure-stack';
import { BookingStack } from './booking-stack';
import { PaymentStack } from './payment-stack';

const app = new cdk.App();

// Create shared infrastructure stack
const sharedInfraStack = new SharedInfrastructureStack(app, 'TravierSharedInfrastructure', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  description: 'Shared infrastructure for Travier Plane Ticketing Service'
});

// Create booking stack
const bookingStack = new BookingStack(app, 'TravierBooking', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  description: 'Booking bounded context for Travier Plane Ticketing Service',
  eventBus: sharedInfraStack.eventBus
});

// Create payment stack
const paymentStack = new PaymentStack(app, 'TravierPayment', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  description: 'Payment bounded context for Travier Plane Ticketing Service',
  eventBus: sharedInfraStack.eventBus
});

// Add dependencies
bookingStack.addDependency(sharedInfraStack);
paymentStack.addDependency(sharedInfraStack);