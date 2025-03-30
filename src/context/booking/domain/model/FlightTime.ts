/**
 * Properties required to create a FlightTime value object.
 * 
 * Reference: Chapter 4 - Value Objects in Domain-Driven Design
 */
interface FlightTimeProps {
  departureTime: string;
  arrivalTime: string;
}

/**
 * FlightTime is a Value Object that represents the departure and arrival times of a flight.
 * It demonstrates immutability, validation, and encapsulation of behavior related to flight times.
 * 
 * Reference: Chapter 4 - Value Objects in Domain-Driven Design
 */
export class FlightTime {
  readonly departureTime: string;
  readonly arrivalTime: string;

  constructor(props: FlightTimeProps) {
    if (!props.departureTime || !props.arrivalTime) {
      throw new Error('Invalid flight time data.');
    }

    // Validate that departure time is before arrival time
    const departureDate = new Date(props.departureTime);
    const arrivalDate = new Date(props.arrivalTime);

    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
      throw new Error('Invalid date format for flight times.');
    }

    if (departureDate >= arrivalDate) {
      throw new Error('Departure time must be before arrival time.');
    }

    this.departureTime = props.departureTime;
    this.arrivalTime = props.arrivalTime;
  }

  /**
   * Calculates the flight duration in minutes.
   * Demonstrates behavior encapsulation in value objects.
   * 
   * Reference: Chapter 4 - Value Objects in Domain-Driven Design
   */
  getDurationInMinutes(): number {
    const departureDate = new Date(this.departureTime);
    const arrivalDate = new Date(this.arrivalTime);

    // Calculate duration in milliseconds and convert to minutes
    const durationMs = arrivalDate.getTime() - departureDate.getTime();
    return Math.floor(durationMs / (1000 * 60));
  }

  /**
   * Calculates the flight duration in hours.
   * Demonstrates behavior encapsulation in value objects.
   * 
   * Reference: Chapter 4 - Value Objects in Domain-Driven Design
   */
  getDurationInHours(): number {
    return this.getDurationInMinutes() / 60;
  }
}
