interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money {
  readonly amount: number;
  readonly currency: string;

  constructor(props: MoneyProps) {
    if (props.amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    if (!props.currency || props.currency.trim().length !== 3) {
      throw new Error('Currency must be a valid 3-letter ISO currency code');
    }

    this.amount = props.amount;
    this.currency = props.currency.toUpperCase();
  }

  add(money: Money): Money {
    if (this.currency !== money.currency) {
      throw new Error('Cannot add money with different currencies');
    }

    return new Money({
      amount: this.amount + money.amount,
      currency: this.currency
    });
  }

  subtract(money: Money): Money {
    if (this.currency !== money.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }

    if (this.amount < money.amount) {
      throw new Error('Cannot subtract a larger amount from a smaller amount');
    }

    return new Money({
      amount: this.amount - money.amount,
      currency: this.currency
    });
  }

  equals(money: Money): boolean {
    return this.amount === money.amount && this.currency === money.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}