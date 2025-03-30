import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBPaymentRepository } from '../../repositories/DynamoDBPaymentRepository';
import { EventBridgePublisher } from '../../../../shared/infrastructure/EventBridgePublisher';
import { PaymentService } from '../../../domain/services/PaymentService';
import { ProcessPaymentUseCase, ProcessPaymentRequest } from '../../../application/useCases/ProcessPaymentUseCase';


// Initialize dependencies
const paymentService = new PaymentService();
const paymentRepository = new DynamoDBPaymentRepository(process.env.PAYMENTS_TABLE_NAME || 'Payments');
const eventPublisher = new EventBridgePublisher(
  process.env.EVENT_BUS_NAME || 'default',
  'com.travier.payment'
);

// Initialize use case
const processPaymentUseCase = new ProcessPaymentUseCase({
  paymentService,
  paymentRepository,
  eventPublisher
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Request body is required' })
      };
    }

    const requestBody = JSON.parse(event.body) as ProcessPaymentRequest;

    // Validate request
    if (!requestBody.ticketId || !requestBody.amount || !requestBody.currency || !requestBody.paymentMethod) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }

    // Execute use case
    const result = await processPaymentUseCase.execute(requestBody);

    // Return success response
    return {
      statusCode: 201,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    
    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error processing payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};