import { describe, it, expect } from 'vitest';
import {Money} from '../../domain/model/Money'


describe('Money', () => {
  it('should create a money object with valid amount and currency', () => {
    const money = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    expect(money.amount).toBe(100.50);
    expect(money.currency).toBe('USD');
  });

  it('should convert currency to uppercase', () => {
    const money = new Money({
      amount: 100.50,
      currency: 'usd',
    });
    
    expect(money.currency).toBe('USD');
  });

  it('should throw an error for negative amount', () => {
    expect(() => {
      new Money({
        amount: -100.50,
        currency: 'USD',
      });
    }).toThrow('Amount cannot be negative');
  });

  it('should throw an error for invalid currency', () => {
    expect(() => {
      new Money({
        amount: 100.50,
        currency: 'US',
      });
    }).toThrow('Currency must be a valid 3-letter ISO currency code');
  });

  it('should add two money objects with the same currency', () => {
    const money1 = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    const money2 = new Money({
      amount: 50.25,
      currency: 'USD',
    });
    
    const result = money1.add(money2);
    
    expect(result.amount).toBe(150.75);
    expect(result.currency).toBe('USD');
  });

  it('should throw an error when adding money with different currencies', () => {
    const money1 = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    const money2 = new Money({
      amount: 50.25,
      currency: 'EUR',
    });
    
    expect(() => money1.add(money2)).toThrow('Cannot add money with different currencies');
  });

  it('should subtract two money objects with the same currency', () => {
    const money1 = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    const money2 = new Money({
      amount: 50.25,
      currency: 'USD',
    });
    
    const result = money1.subtract(money2);
    
    expect(result.amount).toBe(50.25);
    expect(result.currency).toBe('USD');
  });

  it('should throw an error when subtracting money with different currencies', () => {
    const money1 = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    const money2 = new Money({
      amount: 50.25,
      currency: 'EUR',
    });
    
    expect(() => money1.subtract(money2)).toThrow('Cannot subtract money with different currencies');
  });

  it('should throw an error when subtracting a larger amount from a smaller amount', () => {
    const money1 = new Money({
      amount: 50.25,
      currency: 'USD',
    });
    
    const money2 = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    expect(() => money1.subtract(money2)).toThrow('Cannot subtract a larger amount from a smaller amount');
  });

  it('should compare two money objects for equality', () => {
    const money1 = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    const money2 = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    const money3 = new Money({
      amount: 50.25,
      currency: 'USD',
    });
    
    const money4 = new Money({
      amount: 100.50,
      currency: 'EUR',
    });
    
    expect(money1.equals(money2)).toBe(true);
    expect(money1.equals(money3)).toBe(false);
    expect(money1.equals(money4)).toBe(false);
  });

  it('should convert money to string', () => {
    const money = new Money({
      amount: 100.50,
      currency: 'USD',
    });
    
    expect(money.toString()).toBe('100.5 USD');
  });
});