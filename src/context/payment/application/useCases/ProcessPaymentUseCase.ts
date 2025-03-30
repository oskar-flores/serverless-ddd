import { PaymentService } from '../../domain/services/PaymentService';
import { PaymentRepository } from '../../domain/repository/PaymentRepository';
import { EventPublisher } from '../../../shared/infrastructure/EventPublisher';
import { Payment, PaymentMethod } from '../../domain/model/Payment';

interface ProcessPaymentUseCaseProps {
  paymentService: PaymentService;
  paymentRepository: PaymentRepository;
  eventPublisher: EventPublisher;
}

export interface ProcessPaymentRequest {
  ticketId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

export interface ProcessPaymentResponse {
  paymentId: string;
  ticketId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paymentDate?: string;
}

export class ProcessPaymentUseCase {
  private readonly paymentService: PaymentService;
  private readonly paymentRepository: PaymentRepository;
  private readonly eventPublisher: EventPublisher;

  constructor(props: ProcessPaymentUseCaseProps) {
    this.paymentService = props.paymentService;
    this.paymentRepository = props.paymentRepository;
    this.eventPublisher = props.eventPublisher;
  }

  async execute(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    try {
      // Create a new payment using the domain service
      const payment = this.paymentService.createPayment(
        request.ticketId,
        request.amount,
        request.currency,
        request.paymentMethod
      );

      // Process the payment
      this.paymentService.processPayment(payment);

      // Save the payment to the repository
      await this.paymentRepository.save(payment);

      // Publish domain events
      await this.eventPublisher.publishAll(payment.getEvents());

      // Clear events after publishing
      payment.clearEvents();

      // Return the response
      return this.mapToResponse(payment);
    } catch (error) {
      // If there's an error, create a failed payment
      const payment = this.paymentService.createPayment(
        request.ticketId,
        request.amount,
        request.currency,
        request.paymentMethod
      );

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.paymentService.failPayment(payment, errorMessage);

      // Save the failed payment
      await this.paymentRepository.save(payment);

      // Rethrow the error
      throw error;
    }
  }

  private mapToResponse(payment: Payment): ProcessPaymentResponse {
    return {
      paymentId: payment.paymentId,
      ticketId: payment.ticketId,
      amount: payment.amount.amount,
      currency: payment.amount.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      paymentDate: payment.paymentDate
    };
  }
}