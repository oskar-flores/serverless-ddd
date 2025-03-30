import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {GenericContainer, StartedTestContainer} from 'testcontainers';
import {DynamoDBClient, CreateTableCommand, DeleteTableCommand} from '@aws-sdk/client-dynamodb';
import {DynamoDBTicketRepository} from "../../infrastructure/repositories/DynamoDBTicketRepository";
import {Ticket} from "../../domain/model/Ticket";
import {FlightTime} from "../../domain/model/FlightTime";

describe('DynamoDBTicketRepository Integration Tests', () => {
    let container: StartedTestContainer;
    let dynamoDBClient: DynamoDBClient;
    let repository: DynamoDBTicketRepository;
    const tableName = 'TestTickets';

    // Test data
    const flightTime = new FlightTime({
        departureTime: '2023-01-01T10:00:00Z',
        arrivalTime: '2023-01-01T12:00:00Z',
    });

    const ticket = new Ticket({
        ticketId: 'test-ticket-123',
        flightId: 'test-flight-456',
        passengerId: 'test-passenger-789',
        seatNumber: '15B',
        bookingDate: '2023-01-01T08:00:00Z',
        status: 'RESERVED',
        flightTime,
    });

    beforeAll(async () => {
        // Start DynamoDB local container
        container = await new GenericContainer('amazon/dynamodb-local:latest')
            .withExposedPorts(8000)
            .start();

        const port = container.getMappedPort(8000);
        const host = container.getHost();

        // Create DynamoDB client that points to the container
        dynamoDBClient = new DynamoDBClient({
            endpoint: `http://${host}:${port}`,
            region: 'local',
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test',
            },
        });

        // Create the repository with the test table name
        repository = new DynamoDBTicketRepository(tableName);
        // Override the dynamoDB client to use our test client
        (repository as any).dynamoDB = dynamoDBClient;

        // Create the test table
        await dynamoDBClient.send(new CreateTableCommand({
            TableName: tableName,
            KeySchema: [
                {AttributeName: 'ticketId', KeyType: 'HASH'},
            ],
            AttributeDefinitions: [
                {AttributeName: 'ticketId', AttributeType: 'S'},
                {AttributeName: 'flightId', AttributeType: 'S'},
                {AttributeName: 'passengerId', AttributeType: 'S'},
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'FlightIdIndex',
                    KeySchema: [
                        {AttributeName: 'flightId', KeyType: 'HASH'},
                    ],
                    Projection: {
                        ProjectionType: 'ALL',
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5,
                    },
                },
                {
                    IndexName: 'PassengerIdIndex',
                    KeySchema: [
                        {AttributeName: 'passengerId', KeyType: 'HASH'},
                    ],
                    Projection: {
                        ProjectionType: 'ALL',
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5,
                    },
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            },
        }));
    }, 60000); // Increase timeout for container startup

    afterAll(async () => {
        // Clean up: delete the table and stop the container
        try {
            await dynamoDBClient.send(new DeleteTableCommand({
                TableName: tableName,
            }));
        } catch (error) {
            console.error('Error deleting table:', error);
        }

        if (container) {
            await container.stop();
        }
    });

    it('should save and retrieve a ticket', async () => {
        // Save the ticket
        await repository.save(ticket);

        // Retrieve the ticket
        const retrievedTicket = await repository.getById(ticket.ticketId);

        // Verify the retrieved ticket matches the original
        expect(retrievedTicket).not.toBeNull();
        expect(retrievedTicket?.ticketId).toBe(ticket.ticketId);
        expect(retrievedTicket?.flightId).toBe(ticket.flightId);
        expect(retrievedTicket?.passengerId).toBe(ticket.passengerId);
        expect(retrievedTicket?.seatNumber).toBe(ticket.seatNumber);
        expect(retrievedTicket?.bookingDate).toBe(ticket.bookingDate);
        expect(retrievedTicket?.status).toBe(ticket.status);
        expect(retrievedTicket?.flightTime.departureTime).toBe(ticket.flightTime.departureTime);
        expect(retrievedTicket?.flightTime.arrivalTime).toBe(ticket.flightTime.arrivalTime);
    });

    it('should find tickets by flight ID', async () => {
        // Create another ticket with the same flight ID
        const anotherTicket = new Ticket({
            ticketId: 'test-ticket-456',
            flightId: ticket.flightId, // Same flight ID
            passengerId: 'test-passenger-012',
            seatNumber: '16C',
            bookingDate: '2023-01-01T08:30:00Z',
            status: 'RESERVED',
            flightTime,
        });

        // Save the second ticket
        await repository.save(anotherTicket);

        // Find tickets by flight ID
        const tickets = await repository.findByFlightId(ticket.flightId);

        // Verify we found both tickets
        expect(tickets.length).toBe(2);
        expect(tickets.some(t => t.ticketId === ticket.ticketId)).toBe(true);
        expect(tickets.some(t => t.ticketId === anotherTicket.ticketId)).toBe(true);
    });

    it('should find tickets by passenger ID', async () => {
        // Find tickets by passenger ID
        const tickets = await repository.findByPassengerId(ticket.passengerId);

        // Verify we found the ticket
        expect(tickets.length).toBe(1);
        expect(tickets[0]?.ticketId).toBe(ticket.ticketId);
    });

    it('should return null for non-existent ticket ID', async () => {
        const nonExistentTicket = await repository.getById('non-existent-id');
        expect(nonExistentTicket).toBeNull();
    });

    it('should return empty array for non-existent flight ID', async () => {
        const tickets = await repository.findByFlightId('non-existent-flight-id');
        expect(tickets).toEqual([]);
    });

    it('should return empty array for non-existent passenger ID', async () => {
        const tickets = await repository.findByPassengerId('non-existent-passenger-id');
        expect(tickets).toEqual([]);
    });
});