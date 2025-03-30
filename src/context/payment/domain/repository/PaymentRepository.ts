import {Payment} from "../model/Payment";

export interface PaymentRepository {
    getById(id: string): Promise<Payment | null>;

    save(payment: Payment): Promise<void>;

    findByTicketId(ticketId: string): Promise<Payment[]>;
}