export class DateTime {
  private date: Date;

  constructor(input?: string | number | Date) {
    this.date = input ? new Date(input) : new Date();
  }

  format(pattern: string): string {
    return this.date.toLocaleString(undefined, { dateStyle: 'full' });
  }

  add(amount: number, unit: 'days' | 'hours' | 'minutes'): DateTime {
    const newDate = new Date(this.date);
    switch (unit) {
      case 'days': newDate.setDate(newDate.getDate() + amount); break;
      case 'hours': newDate.setHours(newDate.getHours() + amount); break;
      case 'minutes': newDate.setMinutes(newDate.getMinutes() + amount); break;
    }
    return new DateTime(newDate);
  }

  static now(): DateTime {
    return new DateTime();
  }
}
