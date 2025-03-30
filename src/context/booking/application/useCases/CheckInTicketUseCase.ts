import { TicketService } from '../../domain/services/TicketService';
import { TicketRepository } from '../../domain/repositories/TicketRepository';
import { EventPublisher } from '../../../shared/infrastructure/EventPublisher';
import { Ticket } from '../../domain/model/Ticket';

interface CheckInTicketUseCaseProps {
    ticketService: TicketService;
    ticketRepository: TicketRepository;
    eventPublisher: EventPublisher;
}

export interface CheckInTicketRequest {
    ticketId: string;
}

export interface CheckInTicketResponse {
    ticketId: string;
    flightId: string;
    passengerId: string;
    seatNumber: string;
    status: string;
}

export class CheckInTicketUseCase {
    private readonly ticketService: TicketService;
    private readonly ticketRepository: TicketRepository;
    private readonly eventPublisher: EventPublisher;

    constructor(props: CheckInTicketUseCaseProps) {
        this.ticketService = props.ticketService;
        this.ticketRepository = props.ticketRepository;
        this.eventPublisher = props.eventPublisher;
    }

    async execute(request: CheckInTicketRequest): Promise<CheckInTicketResponse> {
        // Retrieve the ticket from the repository
        const ticket = await this.ticketRepository.getById(request.ticketId);

        if (!ticket) {
            throw new Error(`Ticket with ID ${request.ticketId} not found`);
        }

        // Check in the ticket using the domain service
        this.ticketService.checkInTicket(ticket);

        // Save the updated ticket to the repository
        await this.ticketRepository.save(ticket);

        // Publish domain events
        await this.eventPublisher.publishAll(ticket.getEvents());

        // Clear events after publishing
        ticket.clearEvents();

        // Return the response
        return this.mapToResponse(ticket);
    }

    private mapToResponse(ticket: Ticket): CheckInTicketResponse {
        return {
            ticketId: ticket.ticketId,
            flightId: ticket.flightId,
            passengerId: ticket.passengerId,
            seatNumber: ticket.seatNumber,
            status: ticket.status
        };
    }
}