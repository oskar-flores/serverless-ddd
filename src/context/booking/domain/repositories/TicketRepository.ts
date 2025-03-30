import {Ticket} from "../model/Ticket";


export interface TicketRepository {
    getById(id: string): Promise<Ticket | null>;

    save(ticket: Ticket): Promise<void>;

    findByFlightId(flightId: string): Promise<Ticket[]>;

    findByPassengerId(passengerId: string): Promise<Ticket[]>;
}