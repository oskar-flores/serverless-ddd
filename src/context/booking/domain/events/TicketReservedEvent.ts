import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

/**
 * Event emitted when a ticket is reserved.
 * 
 * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
 */
export interface TicketReservedEvent extends DomainEvent {
  ticketId: string;
  flightId: string;
  passengerId: string;
  seatNumber: string;
  bookingDate: string;
}
