import {Ticket} from "../model/Ticket";
import {FlightTime} from "../model/FlightTime";


export class TicketService {
    createTicket(
        flightId: string,
        passengerId: string,
        seatNumber: string,
        bookingDate: string,
        departureTime: string,
        arrivalTime: string
    ): Ticket {
        const flightTime = new FlightTime({departureTime, arrivalTime});
        return new Ticket({
            flightId,
            passengerId,
            seatNumber,
            bookingDate,
            status: 'RESERVED',
            flightTime,
        });
    }

    checkInTicket(ticket: Ticket): void {
        ticket.checkIn();
    }

    cancelTicket(ticket: Ticket): void {
        ticket.cancel();
    }
}