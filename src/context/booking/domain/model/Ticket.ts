import {randomUUID} from 'crypto';
import {FlightTime} from "./FlightTime";
import {DomainEvent} from "../../../shared/domain/events/DomainEvent";
import {TicketCancelledEvent, TicketCheckedInEvent, TicketReservedEvent} from "../events";


/**
 * Possible states of a ticket in its lifecycle.
 *
 * Reference: Chapter 3 - Domain Modeling with Aggregates
 */
export type TicketStatus = 'RESERVED' | 'CHECKED_IN' | 'CANCELLED';

/**
 * Properties required to create a Ticket entity.
 *
 * Reference: Chapter 3 - Domain Modeling with Aggregates
 */
interface TicketProps {
    ticketId?: string;
    flightId: string;
    passengerId: string;
    seatNumber: string;
    bookingDate: string;
    status?: TicketStatus;
    flightTime: FlightTime;
}

/**
 * Ticket is an Aggregate Root in the Booking bounded context.
 * It encapsulates the business rules for ticket reservation, check-in, and cancellation.
 * It also demonstrates the use of Domain Events for communicating state changes.
 *
 * Reference: Chapter 3 - Domain Modeling with Aggregates
 * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
 */
export class Ticket {
    readonly ticketId: string;
    readonly flightId: string;
    readonly passengerId: string;
    readonly seatNumber: string;
    readonly bookingDate: string;
    readonly flightTime: FlightTime;
    private _status: TicketStatus;
    private _events: DomainEvent[] = [];

    constructor(props: TicketProps) {
        this.ticketId = props.ticketId || randomUUID();
        this.flightId = props.flightId;
        this.passengerId = props.passengerId;
        this.seatNumber = props.seatNumber;
        this.bookingDate = props.bookingDate;
        this._status = props.status || 'RESERVED';
        this.flightTime = props.flightTime;

        // If this is a new ticket (no ticketId provided), emit a TicketReserved event
        if (!props.ticketId) {
            this.addEvent(this.createTicketReservedEvent());
        }
    }

    get status(): TicketStatus {
        return this._status;
    }

    /**
     * Checks in a ticket, changing its status and emitting a TicketCheckedIn event.
     * Demonstrates business rule enforcement within the aggregate.
     *
     * Reference: Chapter 3 - Domain Modeling with Aggregates
     * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
     */
    checkIn(): void {
        if (this._status !== 'RESERVED') {
            throw new Error('Cannot check in, as the ticket is not in a "Reserved" state');
        }
        this._status = 'CHECKED_IN';
        this.addEvent(this.createTicketCheckedInEvent());
    }

    /**
     * Cancels a ticket, changing its status and emitting a TicketCancelled event.
     * Demonstrates business rule enforcement within the aggregate.
     *
     * Reference: Chapter 3 - Domain Modeling with Aggregates
     * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
     */
    cancel(): void {
        if (this._status === 'CHECKED_IN') {
            throw new Error('Cannot cancel, as the ticket is already checked in');
        }
        this._status = 'CANCELLED';
        this.addEvent(this.createTicketCancelledEvent());
    }

    /**
     * Returns all domain events that have been recorded but not yet published.
     * Part of the implementation of the Domain Events pattern.
     *
     * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
     */
    getEvents(): DomainEvent[] {
        return [...this._events];
    }

    /**
     * Clears all recorded events after they have been published.
     * Part of the implementation of the Domain Events pattern.
     *
     * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
     */
    clearEvents(): void {
        this._events = [];
    }

    private addEvent(event: DomainEvent): void {
        this._events.push(event);
    }

    private createTicketReservedEvent(): TicketReservedEvent {
        return {
            eventName: 'TicketReserved',
            timestamp: new Date().toISOString(),
            aggregateId: this.ticketId,
            ticketId: this.ticketId,
            flightId: this.flightId,
            passengerId: this.passengerId,
            seatNumber: this.seatNumber,
            bookingDate: this.bookingDate
        };
    }

    private createTicketCheckedInEvent(): TicketCheckedInEvent {
        return {
            eventName: 'TicketCheckedIn',
            timestamp: new Date().toISOString(),
            aggregateId: this.ticketId,
            ticketId: this.ticketId
        };
    }

    private createTicketCancelledEvent(): TicketCancelledEvent {
        return {
            eventName: 'TicketCancelled',
            timestamp: new Date().toISOString(),
            aggregateId: this.ticketId,
            ticketId: this.ticketId
        };
    }
}
