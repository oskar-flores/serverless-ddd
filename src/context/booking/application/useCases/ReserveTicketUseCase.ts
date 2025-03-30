import { TicketService } from '../../domain/services/TicketService';
import { TicketRepository } from '../../domain/repositories/TicketRepository';
import { EventPublisher } from '../../../shared/infrastructure/EventPublisher';
import { Ticket } from '../../domain/model/Ticket';

interface ReserveTicketUseCaseProps {
  ticketService: TicketService;
  ticketRepository: TicketRepository;
  eventPublisher: EventPublisher;
}

export interface ReserveTicketRequest {
  flightId: string;
  passengerId: string;
  seatNumber: string;
  departureTime: string;
  arrivalTime: string;
}

export interface ReserveTicketResponse {
  ticketId: string;
  flightId: string;
  passengerId: string;
  seatNumber: string;
  status: string;
}

export class ReserveTicketUseCase {
  private readonly ticketService: TicketService;
  private readonly ticketRepository: TicketRepository;
  private readonly eventPublisher: EventPublisher;

  constructor(props: ReserveTicketUseCaseProps) {
    this.ticketService = props.ticketService;
    this.ticketRepository = props.ticketRepository;
    this.eventPublisher = props.eventPublisher;
  }

  async execute(request: ReserveTicketRequest): Promise<ReserveTicketResponse> {
    // Get current date for booking
    const bookingDate = new Date().toISOString();

    // Create a new ticket using the domain service
    const ticket = this.ticketService.createTicket(
      request.flightId,
      request.passengerId,
      request.seatNumber,
      bookingDate,
      request.departureTime,
      request.arrivalTime
    );

    // Save the ticket to the repository
    await this.ticketRepository.save(ticket);

    // Publish domain events
    await this.eventPublisher.publishAll(ticket.getEvents());

    // Clear events after publishing
    ticket.clearEvents();

    // Return the response
    return this.mapToResponse(ticket);
  }

  private mapToResponse(ticket: Ticket): ReserveTicketResponse {
    return {
      ticketId: ticket.ticketId,
      flightId: ticket.flightId,
      passengerId: ticket.passengerId,
      seatNumber: ticket.seatNumber,
      status: ticket.status
    };
  }
}