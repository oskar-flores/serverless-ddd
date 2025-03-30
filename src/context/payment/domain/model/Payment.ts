import { randomUUID } from 'crypto';
import { PaymentProcessedEvent, RefundIssuedEvent } from '../DomainEvents';
import {Money} from "./Money";
import {DomainEvent} from "../../../shared/domain/events/DomainEvent";

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';

interface PaymentProps {
  paymentId?: string;
  ticketId: string;
  amount: Money;
  paymentMethod: PaymentMethod;
  status?: PaymentStatus;
  paymentDate?: string;
  refundDate?: string;
  failureReason?: string;
}

export class Payment {
  readonly paymentId: string;
  readonly ticketId: string;
  readonly amount: Money;
  readonly paymentMethod: PaymentMethod;
  private _status: PaymentStatus;
  private _paymentDate?: string;
  private _refundDate?: string;
  private _failureReason?: string;
  private _events: DomainEvent[] = [];

  constructor(props: PaymentProps) {
    this.paymentId = props.paymentId || randomUUID();
    this.ticketId = props.ticketId;
    this.amount = props.amount;
    this.paymentMethod = props.paymentMethod;
    this._status = props.status || 'PENDING';
    this._paymentDate = props.paymentDate;
    this._refundDate = props.refundDate;
    this._failureReason = props.failureReason;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get paymentDate(): string | undefined {
    return this._paymentDate;
  }

  get refundDate(): string | undefined {
    return this._refundDate;
  }

  get failureReason(): string | undefined {
    return this._failureReason;
  }

  markAsCompleted(): void {
    if (this._status !== 'PENDING') {
      throw new Error(`Cannot complete payment that is in ${this._status} state`);
    }

    this._status = 'COMPLETED';
    this._paymentDate = new Date().toISOString();

    this.addEvent(this.createPaymentProcessedEvent());
  }

  markAsFailed(reason: string): void {
    if (this._status !== 'PENDING') {
      throw new Error(`Cannot mark payment as failed that is in ${this._status} state`);
    }

    this._status = 'FAILED';
    this._failureReason = reason;
  }

  refund(reason: string): void {
    if (this._status !== 'COMPLETED') {
      throw new Error(`Cannot refund payment that is in ${this._status} state`);
    }

    this._status = 'REFUNDED';
    this._refundDate = new Date().toISOString();

    this.addEvent(this.createRefundIssuedEvent(reason));
  }

  getEvents(): DomainEvent[] {
    return [...this._events];
  }

  clearEvents(): void {
    this._events = [];
  }

  private addEvent(event: DomainEvent): void {
    this._events.push(event);
  }

  private createPaymentProcessedEvent(): PaymentProcessedEvent {
    return {
      eventName: 'PaymentProcessed',
      timestamp: new Date().toISOString(),
      aggregateId: this.paymentId,
      paymentId: this.paymentId,
      ticketId: this.ticketId,
      amount: this.amount.amount,
      currency: this.amount.currency,
      paymentMethod: this.paymentMethod,
      paymentDate: this._paymentDate!
    };
  }

  private createRefundIssuedEvent(reason: string): RefundIssuedEvent {
    return {
      eventName: 'RefundIssued',
      timestamp: new Date().toISOString(),
      aggregateId: this.paymentId,
      paymentId: this.paymentId,
      ticketId: this.ticketId,
      amount: this.amount.amount,
      currency: this.amount.currency,
      refundDate: this._refundDate!,
      reason
    };
  }
}
