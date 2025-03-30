import {DomainEvent} from "../domain/events/DomainEvent";


/**
 * Interface for publishing domain events, following the Dependency Inversion Principle.
 * This allows for different implementations of event publishing mechanisms.
 * 
 * Reference: Chapter 5 - Domain Events and Event-Driven Architecture
 * Reference: Chapter 8 - Infrastructure Concerns and Dependency Inversion
 */
export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}
