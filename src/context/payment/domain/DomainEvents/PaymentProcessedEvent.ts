import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

/**
 * Event emitted when a payment is successfully processed.
 * 
 * Reference: Chapter 7 - Implementing Domain Events in the Payment Context
 */
export interface PaymentProcessedEvent extends DomainEvent {
  paymentId: string;
  ticketId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
}