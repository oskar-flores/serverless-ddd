import {describe, it, expect} from 'vitest';
import {FlightTime} from "../../domain/model/FlightTime";
import {Ticket} from "../../domain/model/Ticket";


describe('Ticket', () => {
    const flightTime = new FlightTime({
        departureTime: '2023-01-01T10:00:00Z',
        arrivalTime: '2023-01-01T12:00:00Z',
    });

    const ticketProps = {
        flightId: 'flight-123',
        passengerId: 'passenger-456',
        seatNumber: '12A',
        bookingDate: '2023-01-01T08:00:00Z',
        flightTime,
    };

    it('should create a ticket with default status RESERVED', () => {
        const ticket = new Ticket(ticketProps);

        expect(ticket.ticketId).toBeDefined();
        expect(ticket.flightId).toBe('flight-123');
        expect(ticket.passengerId).toBe('passenger-456');
        expect(ticket.seatNumber).toBe('12A');
        expect(ticket.bookingDate).toBe('2023-01-01T08:00:00Z');
        expect(ticket.status).toBe('RESERVED');
        expect(ticket.flightTime).toBe(flightTime);

        const events = ticket.getEvents();
        expect(events.length).toBe(1);
        expect(events[0]?.eventName).toBe('TicketReserved');
    });

    it('should create a ticket with provided ID and status', () => {
        const ticket = new Ticket({
            ...ticketProps,
            ticketId: 'ticket-789',
            status: 'CHECKED_IN',
        });

        expect(ticket.ticketId).toBe('ticket-789');
        expect(ticket.status).toBe('CHECKED_IN');

        const events = ticket.getEvents();
        expect(events.length).toBe(0);
    });

    it('should check in a ticket', () => {
        const ticket = new Ticket(ticketProps);
        ticket.clearEvents(); // Clear the TicketReserved event

        ticket.checkIn();

        expect(ticket.status).toBe('CHECKED_IN');

        const events = ticket.getEvents();
        expect(events.length).toBe(1);
        expect(events[0]?.eventName).toBe('TicketCheckedIn');
    });

    it('should throw an error when checking in a non-reserved ticket', () => {
        const ticket = new Ticket({
            ...ticketProps,
            status: 'CHECKED_IN',
        });

        expect(() => ticket.checkIn()).toThrow('Cannot check in, as the ticket is not in a "Reserved" state');
    });

    it('should cancel a ticket', () => {
        const ticket = new Ticket(ticketProps);
        ticket.clearEvents(); // Clear the TicketReserved event

        ticket.cancel();

        expect(ticket.status).toBe('CANCELLED');

        const events = ticket.getEvents();
        expect(events.length).toBe(1);
        expect(events[0]?.eventName).toBe('TicketCancelled');
    });

    it('should throw an error when cancelling a checked-in ticket', () => {
        const ticket = new Ticket({
            ...ticketProps,
            status: 'CHECKED_IN',
        });

        expect(() => ticket.cancel()).toThrow('Cannot cancel, as the ticket is already checked in');
    });
});