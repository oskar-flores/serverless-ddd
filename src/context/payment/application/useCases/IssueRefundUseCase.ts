import { PaymentService } from '../../domain/services/PaymentService';
import { PaymentRepository } from '../../domain/repository/PaymentRepository';
import { EventPublisher } from '../../../shared/infrastructure/EventPublisher';
import { Payment } from '../../domain/model/Payment';

interface IssueRefundUseCaseProps {
  paymentService: PaymentService;
  paymentRepository: PaymentRepository;
  eventPublisher: EventPublisher;
}

export interface IssueRefundRequest {
  paymentId: string;
  reason: string;
}

export interface IssueRefundResponse {
  paymentId: string;
  ticketId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  refundDate?: string;
}

export class IssueRefundUseCase {
  private readonly paymentService: PaymentService;
  private readonly paymentRepository: PaymentRepository;
  private readonly eventPublisher: EventPublisher;

  constructor(props: IssueRefundUseCaseProps) {
    this.paymentService = props.paymentService;
    this.paymentRepository = props.paymentRepository;
    this.eventPublisher = props.eventPublisher;
  }

  async execute(request: IssueRefundRequest): Promise<IssueRefundResponse> {
    // Retrieve the payment from the repository
    const payment = await this.paymentRepository.getById(request.paymentId);
    
    if (!payment) {
      throw new Error(`Payment with ID ${request.paymentId} not found`);
    }

    // Issue a refund using the domain service
    this.paymentService.refundPayment(payment, request.reason);

    // Save the updated payment to the repository
    await this.paymentRepository.save(payment);

    // Publish domain events
    await this.eventPublisher.publishAll(payment.getEvents());

    // Clear events after publishing
    payment.clearEvents();

    // Return the response
    return this.mapToResponse(payment);
  }

  private mapToResponse(payment: Payment): IssueRefundResponse {
    return {
      paymentId: payment.paymentId,
      ticketId: payment.ticketId,
      amount: payment.amount.amount,
      currency: payment.amount.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      refundDate: payment.refundDate
    };
  }
}