import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CancelTicketUseCase, CancelTicketRequest } from 'src/context/booking/application/useCases/CancelTicketUseCase';
import { DynamoDBTicketRepository } from '../../repositories/DynamoDBTicketRepository';
import { EventBridgePublisher } from 'src/context/shared/infrastructure/EventBridgePublisher';
import { TicketService } from 'src/context/booking/domain/services/TicketService';



// Initialize dependencies
const ticketService = new TicketService();
const ticketRepository = new DynamoDBTicketRepository(process.env.TICKETS_TABLE_NAME || 'Tickets');
const eventPublisher = new EventBridgePublisher(
  process.env.EVENT_BUS_NAME || 'default',
  'com.travier.booking'
);

// Initialize use case
const cancelTicketUseCase = new CancelTicketUseCase({
  ticketService,
  ticketRepository,
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

    const requestBody = JSON.parse(event.body) as CancelTicketRequest;

    // Validate request
    if (!requestBody.ticketId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Ticket ID is required' })
      };
    }

    // Execute use case
    const result = await cancelTicketUseCase.execute(requestBody);

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error cancelling ticket:', error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes('not found')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          message: 'Ticket not found',
          error: error.message
        })
      };
    }

    if (error instanceof Error && error.message.includes('already checked in')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Cannot cancel checked-in ticket',
          error: error.message
        })
      };
    }

    // Return general error response
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error cancelling ticket',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
