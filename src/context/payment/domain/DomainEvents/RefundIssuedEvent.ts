import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

/**
 * Event emitted when a refund is issued for a payment.
 * 
 * Reference: Chapter 7 - Implementing Domain Events in the Payment Context
 */
export interface RefundIssuedEvent extends DomainEvent {
  paymentId: string;
  ticketId: string;
  amount: number;
  currency: string;
  refundDate: string;
  reason: string;
}