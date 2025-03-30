/**
 * Domain Events are a core DDD concept for communicating between bounded contexts.
 * This file defines the base DomainEvent interface used by the event bus.
 * 
 * Reference: Chapter 5 - Domain Events and Event-Driven Architecture
 */
export interface DomainEvent {
  eventName: string;
  timestamp: string;
  aggregateId: string;
}