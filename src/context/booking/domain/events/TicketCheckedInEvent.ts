import {DomainEvent} from "../../../shared/domain/events/DomainEvent";


/**
 * Event emitted when a ticket is checked in.
 * 
 * Reference: Chapter 6 - Implementing Domain Events in the Booking Context
 */
export interface TicketCheckedInEvent extends DomainEvent {
  ticketId: string;
}