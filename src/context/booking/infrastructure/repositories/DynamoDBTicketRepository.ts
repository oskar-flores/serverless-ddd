import {DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';
import {TicketRepository} from "../../domain/repositories/TicketRepository";
import {Ticket} from "../../domain/model/Ticket";
import {FlightTime} from "../../domain/model/FlightTime";


interface TicketDTO {
    ticketId: string;
    flightId: string;
    passengerId: string;
    seatNumber: string;
    bookingDate: string;
    status: string;
    departureTime: string;
    arrivalTime: string;
}

export class DynamoDBTicketRepository implements TicketRepository {
    private dynamoDB: DynamoDBClient;
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
        this.dynamoDB = new DynamoDBClient({region: process.env.AWS_REGION || 'us-east-1'});
    }

    async getById(id: string): Promise<Ticket | null> {
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: marshall({ticketId: id}),
        });

        const result = await this.dynamoDB.send(command);

        if (!result.Item) {
            return null;
        }

        return this.mapToTicket(unmarshall(result.Item) as TicketDTO);
    }

    async save(ticket: Ticket): Promise<void> {
        const item = this.mapToDTO(ticket);

        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: marshall(item),
        });

        await this.dynamoDB.send(command);
    }

    async findByFlightId(flightId: string): Promise<Ticket[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName: 'FlightIdIndex',
            KeyConditionExpression: 'flightId = :flightId',
            ExpressionAttributeValues: marshall({':flightId': flightId}),
        });

        const result = await this.dynamoDB.send(command);

        if (!result.Items || result.Items.length === 0) {
            return [];
        }

        return result.Items.map(item => this.mapToTicket(unmarshall(item) as TicketDTO));
    }

    async findByPassengerId(passengerId: string): Promise<Ticket[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName: 'PassengerIdIndex',
            KeyConditionExpression: 'passengerId = :passengerId',
            ExpressionAttributeValues: marshall({':passengerId': passengerId}),
        });

        const result = await this.dynamoDB.send(command);

        if (!result.Items || result.Items.length === 0) {
            return [];
        }

        return result.Items.map(item => this.mapToTicket(unmarshall(item) as TicketDTO));
    }

    private mapToDTO(ticket: Ticket): TicketDTO {
        return {
            ticketId: ticket.ticketId,
            flightId: ticket.flightId,
            passengerId: ticket.passengerId,
            seatNumber: ticket.seatNumber,
            bookingDate: ticket.bookingDate,
            status: ticket.status,
            departureTime: ticket.flightTime.departureTime,
            arrivalTime: ticket.flightTime.arrivalTime,
        };
    }

    private mapToTicket(dto: TicketDTO): Ticket {
        const flightTime = new FlightTime({
            departureTime: dto.departureTime,
            arrivalTime: dto.arrivalTime,
        });

        return new Ticket({
            ticketId: dto.ticketId,
            flightId: dto.flightId,
            passengerId: dto.passengerId,
            seatNumber: dto.seatNumber,
            bookingDate: dto.bookingDate,
            status: dto.status as any,
            flightTime,
        });
    }
}