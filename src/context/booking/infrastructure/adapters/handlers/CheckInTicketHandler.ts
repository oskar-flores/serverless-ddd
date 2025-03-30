import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBTicketRepository } from '../../repositories/DynamoDBTicketRepository';
import { EventBridgePublisher } from 'src/context/shared/infrastructure/EventBridgePublisher';
import { TicketService } from 'src/context/booking/domain/services/TicketService';
import {CheckInTicketRequest, CheckInTicketUseCase } from '../../../application/useCases/CheckInTicketUseCase';

// Initialize dependencies
const ticketService = new TicketService();
const ticketRepository = new DynamoDBTicketRepository(process.env.TICKETS_TABLE_NAME || 'Tickets');
const eventPublisher = new EventBridgePublisher(
  process.env.EVENT_BUS_NAME || 'default',
  'com.travier.booking'
);

// Initialize use case
let checkInTicketUseCase= new CheckInTicketUseCase({
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

    const requestBody = JSON.parse(event.body) as CheckInTicketRequest;

    // Validate request
    if (!requestBody.ticketId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Ticket ID is required' })
      };
    }

    // Execute use case
    const result = await checkInTicketUseCase.execute(requestBody);

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error checking in ticket:', error);
    
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
    
    if (error instanceof Error && error.message.includes('not in a "Reserved" state')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Invalid ticket state',
          error: error.message
        })
      };
    }
    
    // Return general error response
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error checking in ticket',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};