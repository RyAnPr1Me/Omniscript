import { debug } from "../debug";

export type TimeUnit =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "years";
export type DateFormat = "ISO" | "US" | "EU" | "SHORT" | "LONG" | "CUSTOM";

export interface DateTimeOptions {
  locale?: string;
  timezone?: string;
}

export interface Duration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export class DateTime {
  private date: Date;
  private options: DateTimeOptions;

  constructor(input?: string | number | Date, options: DateTimeOptions = {}) {
    this.date = input ? new Date(input) : new Date();
    this.options = {
      locale: options.locale || "en-US",
      timezone:
        options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (isNaN(this.date.getTime())) {
      throw new Error("Invalid date input");
    }
  }

  // Static factory methods
  static now(): DateTime {
    return new DateTime();
  }

  static today(): DateTime {
    const now = new Date();
    return new DateTime(
      new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    );
  }

  static tomorrow(): DateTime {
    return DateTime.today().add(1, "days");
  }

  static yesterday(): DateTime {
    return DateTime.today().subtract(1, "days");
  }

  static fromTimestamp(timestamp: number): DateTime {
    return new DateTime(timestamp);
  }

  static fromISO(isoString: string): DateTime {
    return new DateTime(isoString);
  }

  static parse(dateString: string, format?: string): DateTime {
    // Basic parsing - in a real implementation, you'd want a full date parser
    if (format) {
      debug.warn("DateTime", "Custom format parsing not fully implemented");
    }
    return new DateTime(dateString);
  }

  // Arithmetic operations
  add(amount: number, unit: TimeUnit): DateTime {
    const newDate = new Date(this.date);

    switch (unit) {
      case "milliseconds":
        newDate.setMilliseconds(newDate.getMilliseconds() + amount);
        break;
      case "seconds":
        newDate.setSeconds(newDate.getSeconds() + amount);
        break;
      case "minutes":
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
      case "hours":
        newDate.setHours(newDate.getHours() + amount);
        break;
      case "days":
        newDate.setDate(newDate.getDate() + amount);
        break;
      case "weeks":
        newDate.setDate(newDate.getDate() + amount * 7);
        break;
      case "months":
        newDate.setMonth(newDate.getMonth() + amount);
        break;
      case "years":
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
    }

    return new DateTime(newDate, this.options);
  }

  subtract(amount: number, unit: TimeUnit): DateTime {
    return this.add(-amount, unit);
  }

  // Comparison methods
  isBefore(other: DateTime): boolean {
    return this.date.getTime() < other.date.getTime();
  }

  isAfter(other: DateTime): boolean {
    return this.date.getTime() > other.date.getTime();
  }

  isSame(other: DateTime, precision: TimeUnit = "milliseconds"): boolean {
    switch (precision) {
      case "years":
        return this.year === other.year;
      case "months":
        return this.year === other.year && this.month === other.month;
      case "days":
        return this.toDateString() === other.toDateString();
      case "hours":
        return (
          this.toDateString() === other.toDateString() &&
          this.hour === other.hour
        );
      case "minutes":
        return this.isSame(other, "hours") && this.minute === other.minute;
      case "seconds":
        return this.isSame(other, "minutes") && this.second === other.second;
      default:
        return this.date.getTime() === other.date.getTime();
    }
  }

  isBetween(
    start: DateTime,
    end: DateTime,
    inclusive: boolean = false,
  ): boolean {
    const time = this.date.getTime();
    const startTime = start.date.getTime();
    const endTime = end.date.getTime();

    if (inclusive) {
      return time >= startTime && time <= endTime;
    } else {
      return time > startTime && time < endTime;
    }
  }

  // Duration calculations
  diff(other: DateTime, unit: TimeUnit = "milliseconds"): number {
    const diff = this.date.getTime() - other.date.getTime();

    switch (unit) {
      case "milliseconds":
        return diff;
      case "seconds":
        return Math.floor(diff / 1000);
      case "minutes":
        return Math.floor(diff / (1000 * 60));
      case "hours":
        return Math.floor(diff / (1000 * 60 * 60));
      case "days":
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      case "weeks":
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
      case "months":
        // Approximate month calculation
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
      case "years":
        // Approximate year calculation
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      default:
        return diff;
    }
  }

  duration(other: DateTime): Duration {
    const diff = Math.abs(this.date.getTime() - other.date.getTime());

    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44),
    );
    const weeks = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24 * 7),
    );
    const days = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24),
    );
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const milliseconds = diff % 1000;

    return {
      years,
      months,
      weeks,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    };
  }

  // Formatting methods
  format(pattern?: string): string {
    if (!pattern) {
      return this.date.toLocaleString(this.options.locale, {
        timeZone: this.options.timezone,
      });
    }

    // Basic format patterns - in a real implementation, you'd want full format support
    const replacements: Record<string, string> = {
      YYYY: this.year.toString(),
      YY: this.year.toString().slice(-2),
      MM: (this.month + 1).toString().padStart(2, "0"),
      M: (this.month + 1).toString(),
      DD: this.day.toString().padStart(2, "0"),
      D: this.day.toString(),
      HH: this.hour.toString().padStart(2, "0"),
      H: this.hour.toString(),
      mm: this.minute.toString().padStart(2, "0"),
      m: this.minute.toString(),
      ss: this.second.toString().padStart(2, "0"),
      s: this.second.toString(),
      SSS: this.millisecond.toString().padStart(3, "0"),
    };

    let formatted = pattern;
    for (const [token, value] of Object.entries(replacements)) {
      formatted = formatted.replace(new RegExp(token, "g"), value);
    }

    return formatted;
  }

  toISO(): string {
    return this.date.toISOString();
  }

  toDateString(): string {
    return this.date.toDateString();
  }

  toTimeString(): string {
    return this.date.toTimeString();
  }

  toJSON(): string {
    return this.date.toJSON();
  }

  toString(): string {
    return this.date.toString();
  }

  // Getters for date components
  get year(): number {
    return this.date.getFullYear();
  }

  get month(): number {
    return this.date.getMonth();
  }

  get day(): number {
    return this.date.getDate();
  }

  get hour(): number {
    return this.date.getHours();
  }

  get minute(): number {
    return this.date.getMinutes();
  }

  get second(): number {
    return this.date.getSeconds();
  }

  get millisecond(): number {
    return this.date.getMilliseconds();
  }

  get dayOfWeek(): number {
    return this.date.getDay();
  }

  get dayOfYear(): number {
    const start = new Date(this.year, 0, 0);
    const diff = this.date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  get weekOfYear(): number {
    const firstDayOfYear = new Date(this.year, 0, 1);
    const daysDifference = Math.floor(
      (this.date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.ceil((daysDifference + firstDayOfYear.getDay() + 1) / 7);
  }

  get timestamp(): number {
    return this.date.getTime();
  }

  get unix(): number {
    return Math.floor(this.date.getTime() / 1000);
  }

  // Setters for date components
  setYear(year: number): DateTime {
    const newDate = new Date(this.date);
    newDate.setFullYear(year);
    return new DateTime(newDate, this.options);
  }

  setMonth(month: number): DateTime {
    const newDate = new Date(this.date);
    newDate.setMonth(month);
    return new DateTime(newDate, this.options);
  }

  setDay(day: number): DateTime {
    const newDate = new Date(this.date);
    newDate.setDate(day);
    return new DateTime(newDate, this.options);
  }

  setHour(hour: number): DateTime {
    const newDate = new Date(this.date);
    newDate.setHours(hour);
    return new DateTime(newDate, this.options);
  }

  setMinute(minute: number): DateTime {
    const newDate = new Date(this.date);
    newDate.setMinutes(minute);
    return new DateTime(newDate, this.options);
  }

  setSecond(second: number): DateTime {
    const newDate = new Date(this.date);
    newDate.setSeconds(second);
    return new DateTime(newDate, this.options);
  }

  // Utility methods
  startOf(unit: TimeUnit): DateTime {
    const newDate = new Date(this.date);

    switch (unit) {
      case "years":
        newDate.setMonth(0, 1);
        newDate.setHours(0, 0, 0, 0);
        break;
      case "months":
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
        break;
      case "weeks": {
        const dayOfWeek = newDate.getDay();
        newDate.setDate(newDate.getDate() - dayOfWeek);
        newDate.setHours(0, 0, 0, 0);
        break;
      }
      case "days":
        newDate.setHours(0, 0, 0, 0);
        break;
      case "hours":
        newDate.setMinutes(0, 0, 0);
        break;
      case "minutes":
        newDate.setSeconds(0, 0);
        break;
      case "seconds":
        newDate.setMilliseconds(0);
        break;
    }

    return new DateTime(newDate, this.options);
  }

  endOf(unit: TimeUnit): DateTime {
    const start = this.startOf(unit);
    return start.add(1, unit).subtract(1, "milliseconds");
  }

  isLeapYear(): boolean {
    const year = this.year;
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  daysInMonth(): number {
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  clone(): DateTime {
    return new DateTime(this.date, this.options);
  }

  // Timezone methods
  utc(): DateTime {
    return new DateTime(this.date, { ...this.options, timezone: "UTC" });
  }

  local(): DateTime {
    return new DateTime(this.date, {
      ...this.options,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  timezone(tz: string): DateTime {
    return new DateTime(this.date, { ...this.options, timezone: tz });
  }

  // Validation methods
  isValid(): boolean {
    return !isNaN(this.date.getTime());
  }

  isToday(): boolean {
    return this.isSame(DateTime.today(), "days");
  }

  isYesterday(): boolean {
    return this.isSame(DateTime.yesterday(), "days");
  }

  isTomorrow(): boolean {
    return this.isSame(DateTime.tomorrow(), "days");
  }

  isWeekend(): boolean {
    const dayOfWeek = this.dayOfWeek;
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  isWeekday(): boolean {
    return !this.isWeekend();
  }

  // Static utility methods
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  static daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  static max(...dates: DateTime[]): DateTime {
    const maxDate = dates.reduce((max, current) =>
      current.isAfter(max) ? current : max,
    );
    return maxDate;
  }

  static min(...dates: DateTime[]): DateTime {
    const minDate = dates.reduce((min, current) =>
      current.isBefore(min) ? current : min,
    );
    return minDate;
  }
}

// Utility functions for working with durations
export class DateTimeUtils {
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Operation timed out")), ms);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  static formatDuration(duration: Duration): string {
    const parts: string[] = [];

    if (duration.years > 0) parts.push(`${duration.years}y`);
    if (duration.months > 0) parts.push(`${duration.months}mo`);
    if (duration.weeks > 0) parts.push(`${duration.weeks}w`);
    if (duration.days > 0) parts.push(`${duration.days}d`);
    if (duration.hours > 0) parts.push(`${duration.hours}h`);
    if (duration.minutes > 0) parts.push(`${duration.minutes}m`);
    if (duration.seconds > 0) parts.push(`${duration.seconds}s`);
    if (duration.milliseconds > 0) parts.push(`${duration.milliseconds}ms`);

    return parts.join(" ") || "0ms";
  }

  static humanizeDuration(ms: number): string {
    const duration = {
      years: 0,
      months: 0,
      weeks: 0,
      days: Math.floor(ms / (1000 * 60 * 60 * 24)),
      hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((ms % (1000 * 60)) / 1000),
      milliseconds: ms % 1000,
    };

    return this.formatDuration(duration);
  }
}
