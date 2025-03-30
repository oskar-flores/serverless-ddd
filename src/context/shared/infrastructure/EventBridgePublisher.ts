import {EventBridgeClient, PutEventsCommand} from '@aws-sdk/client-eventbridge';
import {EventPublisher} from './EventPublisher';
import {DomainEvent} from "../domain/events/DomainEvent";


/**
 * AWS EventBridge implementation of the EventPublisher interface.
 * This is an example of the Adapter pattern, adapting the AWS EventBridge API
 * to our domain-specific EventPublisher interface.
 *
 * Reference: Chapter 8 - Infrastructure Concerns and Dependency Inversion
 * Reference: Chapter 9 - Cloud Integration Patterns
 */
export class EventBridgePublisher implements EventPublisher {
    private eventBridge: EventBridgeClient;
    private readonly eventBusName: string;
    private readonly source: string;

    constructor(eventBusName: string, source: string) {
        this.eventBusName = eventBusName;
        this.source = source;
        this.eventBridge = new EventBridgeClient({region: process.env.AWS_REGION || 'us-east-1'});
    }

    async publish(event: DomainEvent): Promise<void> {
        const command = new PutEventsCommand({
            Entries: [
                {
                    EventBusName: this.eventBusName,
                    Source: this.source,
                    DetailType: event.eventName,
                    Detail: JSON.stringify(event),
                    Time: new Date(),
                },
            ],
        });

        await this.eventBridge.send(command);
    }

    async publishAll(events: DomainEvent[]): Promise<void> {
        if (events.length === 0) {
            return;
        }

        const entries = events.map(event => ({
            EventBusName: this.eventBusName,
            Source: this.source,
            DetailType: event.eventName,
            Detail: JSON.stringify(event),
            Time: new Date(),
        }));

        const command = new PutEventsCommand({
            Entries: entries,
        });

        await this.eventBridge.send(command);
    }
}
