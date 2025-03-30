import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {TicketService} from 'src/context/booking/domain/services/TicketService';
import {DynamoDBTicketRepository} from '../../repositories/DynamoDBTicketRepository';
import {ReserveTicketUseCase, ReserveTicketRequest} from 'src/context/booking/application/useCases/ReserveTicketUseCase';
import {EventBridgePublisher} from 'src/context/shared/infrastructure/EventBridgePublisher';


// Initialize dependencies
const ticketService = new TicketService();
const ticketRepository = new DynamoDBTicketRepository(process.env.TICKETS_TABLE_NAME || 'Tickets');
const eventPublisher = new EventBridgePublisher(
    process.env.EVENT_BUS_NAME || 'default',
    'com.travier.booking'
);

// Initialize use case
const reserveTicketUseCase = new ReserveTicketUseCase({
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
                body: JSON.stringify({message: 'Request body is required'})
            };
        }

        const requestBody = JSON.parse(event.body) as ReserveTicketRequest;

        // Validate request
        if (!requestBody.flightId || !requestBody.passengerId || !requestBody.seatNumber ||
            !requestBody.departureTime || !requestBody.arrivalTime) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: 'Missing required fields'})
            };
        }

        // Execute use case
        const result = await reserveTicketUseCase.execute(requestBody);

        // Return success response
        return {
            statusCode: 201,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error reserving ticket:', error);

        // Return error response
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error reserving ticket',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};