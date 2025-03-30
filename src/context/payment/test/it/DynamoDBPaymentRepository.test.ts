import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { Money } from '../../domain/model/Money';
import { Payment } from '../../domain/model/Payment';
import {DynamoDBPaymentRepository} from '../../infrastructure/repositories/DynamoDBPaymentRepository'

describe('DynamoDBPaymentRepository Integration Tests', () => {
  let container: StartedTestContainer;
  let dynamoDBClient: DynamoDBClient;
  let repository: DynamoDBPaymentRepository;
  const tableName = 'TestPayments';

  // Test data
  const money = new Money({
    amount: 100.50,
    currency: 'USD',
  });

  const payment = new Payment({
    paymentId: 'test-payment-123',
    ticketId: 'test-ticket-456',
    amount: money,
    paymentMethod: 'CREDIT_CARD',
    status: 'PENDING',
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
    repository = new DynamoDBPaymentRepository(tableName);
    // Override the dynamoDB client to use our test client
    (repository as any).dynamoDB = dynamoDBClient;

    // Create the test table
    await dynamoDBClient.send(new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'paymentId', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'paymentId', AttributeType: 'S' },
        { AttributeName: 'ticketId', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'TicketIdIndex',
          KeySchema: [
            { AttributeName: 'ticketId', KeyType: 'HASH' },
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

  it('should save and retrieve a payment', async () => {
    // Save the payment
    await repository.save(payment);

    // Retrieve the payment
    const retrievedPayment = await repository.getById(payment.paymentId);

    // Verify the retrieved payment matches the original
    expect(retrievedPayment).not.toBeNull();
    expect(retrievedPayment?.paymentId).toBe(payment.paymentId);
    expect(retrievedPayment?.ticketId).toBe(payment.ticketId);
    expect(retrievedPayment?.amount.amount).toBe(payment.amount.amount);
    expect(retrievedPayment?.amount.currency).toBe(payment.amount.currency);
    expect(retrievedPayment?.paymentMethod).toBe(payment.paymentMethod);
    expect(retrievedPayment?.status).toBe(payment.status);
  });

  it('should find payments by ticket ID', async () => {
    // Create another payment with the same ticket ID
    const anotherPayment = new Payment({
      paymentId: 'test-payment-456',
      ticketId: payment.ticketId, // Same ticket ID
      amount: new Money({ amount: 50.25, currency: 'USD' }),
      paymentMethod: 'PAYPAL',
      status: 'COMPLETED',
      paymentDate: new Date().toISOString(),
    });

    // Save the second payment
    await repository.save(anotherPayment);

    // Find payments by ticket ID
    const payments = await repository.findByTicketId(payment.ticketId);

    // Verify we found both payments
    expect(payments.length).toBe(2);
    expect(payments.some(p => p.paymentId === payment.paymentId)).toBe(true);
    expect(payments.some(p => p.paymentId === anotherPayment.paymentId)).toBe(true);
  });

  it('should update an existing payment', async () => {
    // Mark the payment as completed
    const completedPayment = new Payment({
      paymentId: payment.paymentId,
      ticketId: payment.ticketId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: 'COMPLETED',
      paymentDate: new Date().toISOString(),
    });

    // Save the updated payment
    await repository.save(completedPayment);

    // Retrieve the payment
    const retrievedPayment = await repository.getById(payment.paymentId);

    // Verify the payment was updated
    expect(retrievedPayment?.status).toBe('COMPLETED');
    expect(retrievedPayment?.paymentDate).toBeDefined();
  });

  it('should return null for non-existent payment ID', async () => {
    const nonExistentPayment = await repository.getById('non-existent-id');
    expect(nonExistentPayment).toBeNull();
  });

  it('should return empty array for non-existent ticket ID', async () => {
    const payments = await repository.findByTicketId('non-existent-ticket-id');
    expect(payments).toEqual([]);
  });
});