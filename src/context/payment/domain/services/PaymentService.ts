import { Payment, PaymentMethod} from '../model/Payment';
import { Money } from '../model/Money';

export class PaymentService {
  createPayment(
    ticketId: string,
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod
  ): Payment {
    const moneyAmount = new Money({ amount, currency });
    
    return new Payment({
      ticketId,
      amount: moneyAmount,
      paymentMethod
    });
  }

  processPayment(payment: Payment): void {
    // In a real implementation, this would integrate with a payment gateway
    // For now, we'll just mark the payment as completed
    payment.markAsCompleted();
  }

  refundPayment(payment: Payment, reason: string): void {
    // In a real implementation, this would integrate with a payment gateway
    // For now, we'll just mark the payment as refunded
    payment.refund(reason);
  }

  failPayment(payment: Payment, reason: string): void {
    payment.markAsFailed(reason);
  }
}