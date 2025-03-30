import { describe, it, expect } from 'vitest';
import {FlightTime} from "../../domain/model/FlightTime";


describe('FlightTime', () => {
  it('should create a flight time object with valid departure and arrival times', () => {
    const flightTime = new FlightTime({
      departureTime: '2023-01-01T10:00:00Z',
      arrivalTime: '2023-01-01T12:00:00Z',
    });
    
    expect(flightTime.departureTime).toBe('2023-01-01T10:00:00Z');
    expect(flightTime.arrivalTime).toBe('2023-01-01T12:00:00Z');
  });

  it('should throw an error for missing departure time', () => {
    expect(() => {
      new FlightTime({
        departureTime: '',
        arrivalTime: '2023-01-01T12:00:00Z',
      });
    }).toThrow('Invalid flight time data.');
  });

  it('should throw an error for missing arrival time', () => {
    expect(() => {
      new FlightTime({
        departureTime: '2023-01-01T10:00:00Z',
        arrivalTime: '',
      });
    }).toThrow('Invalid flight time data.');
  });

  it('should throw an error for invalid date format', () => {
    expect(() => {
      new FlightTime({
        departureTime: 'invalid-date',
        arrivalTime: '2023-01-01T12:00:00Z',
      });
    }).toThrow('Invalid date format for flight times.');
  });

  it('should throw an error when departure time is after arrival time', () => {
    expect(() => {
      new FlightTime({
        departureTime: '2023-01-01T14:00:00Z',
        arrivalTime: '2023-01-01T12:00:00Z',
      });
    }).toThrow('Departure time must be before arrival time.');
  });

  it('should throw an error when departure time is equal to arrival time', () => {
    expect(() => {
      new FlightTime({
        departureTime: '2023-01-01T12:00:00Z',
        arrivalTime: '2023-01-01T12:00:00Z',
      });
    }).toThrow('Departure time must be before arrival time.');
  });

  it('should calculate duration in minutes correctly', () => {
    const flightTime = new FlightTime({
      departureTime: '2023-01-01T10:00:00Z',
      arrivalTime: '2023-01-01T12:30:00Z',
    });
    
    expect(flightTime.getDurationInMinutes()).toBe(150); // 2.5 hours = 150 minutes
  });

  it('should calculate duration in hours correctly', () => {
    const flightTime = new FlightTime({
      departureTime: '2023-01-01T10:00:00Z',
      arrivalTime: '2023-01-01T12:30:00Z',
    });
    
    expect(flightTime.getDurationInHours()).toBe(2.5); // 150 minutes = 2.5 hours
  });
});