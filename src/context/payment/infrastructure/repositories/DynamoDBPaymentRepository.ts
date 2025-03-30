import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {PaymentRepository} from "../../domain/repository/PaymentRepository";
import {Payment, PaymentMethod, PaymentStatus} from "../../domain/model/Payment";
import {Money} from "../../domain/model/Money";


interface PaymentDTO {
  paymentId: string;
  ticketId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paymentDate?: string;
  refundDate?: string;
  failureReason?: string;
}

export class DynamoDBPaymentRepository implements PaymentRepository {
  private dynamoDB: DynamoDBClient;
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
  }

  async getById(id: string): Promise<Payment | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ paymentId: id }),
    });

    const result = await this.dynamoDB.send(command);
    
    if (!result.Item) {
      return null;
    }

    return this.mapToPayment(unmarshall(result.Item) as PaymentDTO);
  }

  async save(payment: Payment): Promise<void> {
    const item = this.mapToDTO(payment);
    
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(item),
    });

    await this.dynamoDB.send(command);
  }

  async findByTicketId(ticketId: string): Promise<Payment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'TicketIdIndex',
      KeyConditionExpression: 'ticketId = :ticketId',
      ExpressionAttributeValues: marshall({ ':ticketId': ticketId }),
    });

    const result = await this.dynamoDB.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map(item => this.mapToPayment(unmarshall(item) as PaymentDTO));
  }

  private mapToDTO(payment: Payment): PaymentDTO {
    return {
      paymentId: payment.paymentId,
      ticketId: payment.ticketId,
      amount: payment.amount.amount,
      currency: payment.amount.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      paymentDate: payment.paymentDate,
      refundDate: payment.refundDate,
      failureReason: payment.failureReason,
    };
  }

  private mapToPayment(dto: PaymentDTO): Payment {
    const money = new Money({
      amount: dto.amount,
      currency: dto.currency,
    });

    return new Payment({
      paymentId: dto.paymentId,
      ticketId: dto.ticketId,
      amount: money,
      paymentMethod: dto.paymentMethod as PaymentMethod,
      status: dto.status as PaymentStatus,
      paymentDate: dto.paymentDate,
      refundDate: dto.refundDate,
      failureReason: dto.failureReason,
    });
  }
}