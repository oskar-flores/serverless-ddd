import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

/**
 * Event emitted when a ticket is cancelled.
 * 
 * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
 */
export interface TicketCancelledEvent extends DomainEvent {
  ticketId: string;
}