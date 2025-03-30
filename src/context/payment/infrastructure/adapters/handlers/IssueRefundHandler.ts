import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {DynamoDBPaymentRepository} from '../../repositories/DynamoDBPaymentRepository';
import {EventBridgePublisher} from '../../../../shared/infrastructure/EventBridgePublisher';
import {PaymentService} from '../../../domain/services/PaymentService';
import {IssueRefundUseCase, IssueRefundRequest} from '../../../application/useCases/IssueRefundUseCase';

// Initialize dependencies
const paymentService = new PaymentService();
const paymentRepository = new DynamoDBPaymentRepository(process.env.PAYMENTS_TABLE_NAME || 'Payments');
const eventPublisher = new EventBridgePublisher(
    process.env.EVENT_BUS_NAME || 'default',
    'com.travier.payment'
);

// Initialize use case
const issueRefundUseCase = new IssueRefundUseCase({
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
                body: JSON.stringify({message: 'Request body is required'})
            };
        }

        const requestBody = JSON.parse(event.body) as IssueRefundRequest;

        // Validate request
        if (!requestBody.paymentId || !requestBody.reason) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: 'Payment ID and reason are required'})
            };
        }

        // Execute use case
        const result = await issueRefundUseCase.execute(requestBody);

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error issuing refund:', error);

        // Handle specific errors
        if (error instanceof Error && error.message.includes('not found')) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Payment not found',
                    error: error.message
                })
            };
        }

        if (error instanceof Error && error.message.includes('Cannot refund payment')) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid payment state for refund',
                    error: error.message
                })
            };
        }

        // Return general error response
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error issuing refund',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};