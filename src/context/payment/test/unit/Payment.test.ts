import { describe, it, expect } from 'vitest';
import { Payment, PaymentMethod } from '../../domain/model/Payment';
import { DomainEvent } from 'src/context/shared/domain/events/DomainEvent';
import { Money } from '../../domain/model/Money';

describe('Payment', () => {
  const money = new Money({
    amount: 100.50,
    currency: 'USD',
  });

  const paymentProps = {
    ticketId: 'ticket-123',
    amount: money,
    paymentMethod: 'CREDIT_CARD' as PaymentMethod,
  };

  it('should create a payment with default status PENDING', () => {
    const payment = new Payment(paymentProps);

    expect(payment.paymentId).toBeDefined();
    expect(payment.ticketId).toBe('ticket-123');
    expect(payment.amount).toBe(money);
    expect(payment.paymentMethod).toBe('CREDIT_CARD');
    expect(payment.status).toBe('PENDING');
    expect(payment.paymentDate).toBeUndefined();
    expect(payment.refundDate).toBeUndefined();
    expect(payment.failureReason).toBeUndefined();
  });

  it('should create a payment with provided ID and status', () => {
    const payment = new Payment({
      ...paymentProps,
      paymentId: 'payment-789',
      status: 'COMPLETED',
      paymentDate: '2023-01-01T10:00:00Z',
    });

    expect(payment.paymentId).toBe('payment-789');
    expect(payment.status).toBe('COMPLETED');
    expect(payment.paymentDate).toBe('2023-01-01T10:00:00Z');
  });

  it('should mark a payment as completed', () => {
    const payment = new Payment(paymentProps);

    payment.markAsCompleted();

    expect(payment.status).toBe('COMPLETED');
    expect(payment.paymentDate).toBeDefined();

    const events = payment.getEvents();
    expect(events.length).toBe(1);
    const event = events[0] as DomainEvent;
    expect(event.eventName).toBe('PaymentProcessed');
  });

  it('should throw an error when completing a non-pending payment', () => {
    const payment = new Payment({
      ...paymentProps,
      status: 'COMPLETED',
    });

    expect(() => payment.markAsCompleted()).toThrow('Cannot complete payment that is in COMPLETED state');
  });

  it('should mark a payment as failed', () => {
    const payment = new Payment(paymentProps);

    payment.markAsFailed('Insufficient funds');

    expect(payment.status).toBe('FAILED');
    expect(payment.failureReason).toBe('Insufficient funds');
  });

  it('should throw an error when marking a non-pending payment as failed', () => {
    const payment = new Payment({
      ...paymentProps,
      status: 'COMPLETED',
    });

    expect(() => payment.markAsFailed('Insufficient funds')).toThrow('Cannot mark payment as failed that is in COMPLETED state');
  });

  it('should refund a payment', () => {
    const payment = new Payment({
      ...paymentProps,
      status: 'COMPLETED',
      paymentDate: '2023-01-01T10:00:00Z',
    });

    payment.refund('Customer request');

    expect(payment.status).toBe('REFUNDED');
    expect(payment.refundDate).toBeDefined();

    const events = payment.getEvents();
    expect(events.length).toBe(1);
    const event = events[0] as DomainEvent;
    expect(event.eventName).toBe('RefundIssued');
  });

  it('should throw an error when refunding a non-completed payment', () => {
    const payment = new Payment(paymentProps);

    expect(() => payment.refund('Customer request')).toThrow('Cannot refund payment that is in PENDING state');
  });
});
