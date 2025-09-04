// DateTime utilities library implemented in Omniscript
// This replaces the TypeScript-based src/stdlib/datetime.ts

type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
type DateFormat = 'ISO' | 'US' | 'EU' | 'SHORT' | 'LONG' | 'CUSTOM';

interface DateTimeOptions {
  locale?: string;
  timezone?: string;
}

interface Duration {
  years:: number;
  months:: number;
  weeks:: number;
  days:: number;
  hours:: number;
  minutes:: number;
  seconds:: number;
  milliseconds:: number;
}

class DateTime {
  private date:: Date;
  private options:: DateTimeOptions;

  constructor(input?: string | number | Date, options:: DateTimeOptions = {}) {
    this.date = input ? new Date(input) : new Date();
    this.options = {
      locale: options.locale || 'en-US',
      timezone: options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    if (isNaN(this.date.getTime())) {
      throw new Error('Invalid date input');
    }
  }

  // Static factory methods
  static now():: DateTime {
    return new DateTime();
  }

  static today():: DateTime {
    def now = new Date();
    return new DateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  static tomorrow():: DateTime {
    return DateTime.today().add(1, 'days');
  }

  static yesterday():: DateTime {
    return DateTime.today().subtract(1, 'days');
  }

  static fromTimestamp(timestamp:: number):: DateTime {
    return new DateTime(timestamp);
  }

  static fromISO(isoString:: string):: DateTime {
    return new DateTime(isoString);
  }

  static parse(dateString:: string, format?: string):: DateTime {
    // Basic parsing - in a real implementation, you'd want a full date parser
    if (format) {
      console.warn('Custom format parsing not fully implemented');
    }
    return new DateTime(dateString);
  }

  // Arithmetic operations
  add(amount:: number, unit:: TimeUnit):: DateTime {
    def newDate = new Date(this.date);

    match unit {
      'milliseconds' => newDate.setMilliseconds(newDate.getMilliseconds() + amount),
      'seconds' => newDate.setSeconds(newDate.getSeconds() + amount),
      'minutes' => newDate.setMinutes(newDate.getMinutes() + amount),
      'hours' => newDate.setHours(newDate.getHours() + amount),
      'days' => newDate.setDate(newDate.getDate() + amount),
      'weeks' => newDate.setDate(newDate.getDate() + (amount * 7)),
      'months' => newDate.setMonth(newDate.getMonth() + amount),
      'years' => newDate.setFullYear(newDate.getFullYear() + amount),
      _ => throw new Error(`Unknown time unit: ${unit}`)
    };

    return new DateTime(newDate, this.options);
  }

  subtract(amount:: number, unit:: TimeUnit):: DateTime {
    return this.add(-amount, unit);
  }

  // Comparison methods
  isBefore(other:: DateTime):: boolean {
    return this.date.getTime() < other.date.getTime();
  }

  isAfter(other:: DateTime):: boolean {
    return this.date.getTime() > other.date.getTime();
  }

  isSame(other:: DateTime, precision:: TimeUnit = 'milliseconds'):: boolean {
    match precision {
      'years' => this.year === other.year,
      'months' => this.year === other.year && this.month === other.month,
      'days' => this.toDateString() === other.toDateString(),
      'hours' => this.toDateString() === other.toDateString() && this.hour === other.hour,
      'minutes' => this.isSame(other, 'hours') && this.minute === other.minute,
      'seconds' => this.isSame(other, 'minutes') && this.second === other.second,
      _ => this.date.getTime() === other.date.getTime()
    }
  }

  isBetween(start:: DateTime, end:: DateTime, inclusive:: boolean = false):: boolean {
    def time = this.date.getTime();
    def startTime = start.date.getTime();
    def endTime = end.date.getTime();

    if (inclusive) {
      return time >= startTime && time <= endTime;
    } else {
      return time > startTime && time < endTime;
    }
  }

  // Duration calculations
  diff(other:: DateTime, unit:: TimeUnit = 'milliseconds'):: number {
    def diff = this.date.getTime() - other.date.getTime();

    match unit {
      'milliseconds' => diff,
      'seconds' => Math.floor(diff / 1000),
      'minutes' => Math.floor(diff / (1000 * 60)),
      'hours' => Math.floor(diff / (1000 * 60 * 60)),
      'days' => Math.floor(diff / (1000 * 60 * 60 * 24)),
      'weeks' => Math.floor(diff / (1000 * 60 * 60 * 24 * 7)),
      'months' => Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44)), // Approximate
      'years' => Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)), // Approximate
      _ => diff
    }
  }

  duration(other:: DateTime):: Duration {
    def diff = Math.abs(this.date.getTime() - other.date.getTime());

    def years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    def months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    def weeks = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24 * 7));
    def days = Math.floor((diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
    def hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    def minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    def seconds = Math.floor((diff % (1000 * 60)) / 1000);
    def milliseconds = diff % 1000;

    return { years, months, weeks, days, hours, minutes, seconds, milliseconds };
  }

  // Formatting methods
  format(pattern?: string):: string {
    if (!pattern) {
      return this.date.toLocaleString(this.options.locale, {
        timeZone: this.options.timezone
      });
    }

    // Basic format patterns - in a real implementation, you'd want full format support
    def replacements:: Record<string, string> = {
      'YYYY': this.year.toString(),
      'YY': this.year.toString().slice(-2),
      'MM': (this.month + 1).toString().padStart(2, '0'),
      'M': (this.month + 1).toString(),
      'DD': this.day.toString().padStart(2, '0'),
      'D': this.day.toString(),
      'HH': this.hour.toString().padStart(2, '0'),
      'H': this.hour.toString(),
      'mm': this.minute.toString().padStart(2, '0'),
      'm': this.minute.toString(),
      'ss': this.second.toString().padStart(2, '0'),
      's': this.second.toString(),
      'SSS': this.millisecond.toString().padStart(3, '0')
    };

    var formatted = pattern;
    for (def [token, value] of Object.entries(replacements)) {
      formatted = formatted.replace(new RegExp(token, 'g'), value);
    }

    return formatted;
  }

  toISO():: string {
    return this.date.toISOString();
  }

  toISOString():: string {
    return this.date.toISOString();
  }

  toDateString():: string {
    return this.date.toDateString();
  }

  toTimeString():: string {
    return this.date.toTimeString();
  }

  toJSON():: string {
    return this.date.toJSON();
  }

  toString():: string {
    return this.date.toString();
  }

  // Getters for date components
  get year():: number {
    return this.date.getFullYear();
  }

  get month():: number {
    return this.date.getMonth();
  }

  get day():: number {
    return this.date.getDate();
  }

  get hour():: number {
    return this.date.getHours();
  }

  get minute():: number {
    return this.date.getMinutes();
  }

  get second():: number {
    return this.date.getSeconds();
  }

  get millisecond():: number {
    return this.date.getMilliseconds();
  }

  get dayOfWeek():: number {
    return this.date.getDay();
  }

  get dayOfYear():: number {
    def start = new Date(this.year, 0, 0);
    def diff = this.date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  get weekOfYear():: number {
    def firstDayOfYear = new Date(this.year, 0, 1);
    def daysDifference = Math.floor((this.date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((daysDifference + firstDayOfYear.getDay() + 1) / 7);
  }

  get timestamp():: number {
    return this.date.getTime();
  }

  get unix():: number {
    return Math.floor(this.date.getTime() / 1000);
  }

  // Setters for date components
  setYear(year:: number):: DateTime {
    def newDate = new Date(this.date);
    newDate.setFullYear(year);
    return new DateTime(newDate, this.options);
  }

  setMonth(month:: number):: DateTime {
    def newDate = new Date(this.date);
    newDate.setMonth(month);
    return new DateTime(newDate, this.options);
  }

  setDay(day:: number):: DateTime {
    def newDate = new Date(this.date);
    newDate.setDate(day);
    return new DateTime(newDate, this.options);
  }

  setHour(hour:: number):: DateTime {
    def newDate = new Date(this.date);
    newDate.setHours(hour);
    return new DateTime(newDate, this.options);
  }

  setMinute(minute:: number):: DateTime {
    def newDate = new Date(this.date);
    newDate.setMinutes(minute);
    return new DateTime(newDate, this.options);
  }

  setSecond(second:: number):: DateTime {
    def newDate = new Date(this.date);
    newDate.setSeconds(second);
    return new DateTime(newDate, this.options);
  }

  // Utility methods
  startOf(unit:: TimeUnit):: DateTime {
    def newDate = new Date(this.date);

    match unit {
      'years' => {
        newDate.setMonth(0, 1);
        newDate.setHours(0, 0, 0, 0);
      },
      'months' => {
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
      },
      'weeks' => {
        def dayOfWeek = newDate.getDay();
        newDate.setDate(newDate.getDate() - dayOfWeek);
        newDate.setHours(0, 0, 0, 0);
      },
      'days' => newDate.setHours(0, 0, 0, 0),
      'hours' => newDate.setMinutes(0, 0, 0),
      'minutes' => newDate.setSeconds(0, 0),
      'seconds' => newDate.setMilliseconds(0),
      _ => {} // No-op for milliseconds
    };

    return new DateTime(newDate, this.options);
  }

  endOf(unit:: TimeUnit):: DateTime {
    def start = this.startOf(unit);
    return start.add(1, unit).subtract(1, 'milliseconds');
  }

  isLeapYear():: boolean {
    def year = this.year;
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  daysInMonth():: number {
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  clone():: DateTime {
    return new DateTime(this.date, this.options);
  }

  // Timezone methods
  utc():: DateTime {
    return new DateTime(this.date, { ...this.options, timezone: 'UTC' });
  }

  local():: DateTime {
    return new DateTime(this.date, {
      ...this.options,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  timezone(tz:: string):: DateTime {
    return new DateTime(this.date, { ...this.options, timezone: tz });
  }

  // Validation methods
  isValid():: boolean {
    return !isNaN(this.date.getTime());
  }

  isToday():: boolean {
    return this.isSame(DateTime.today(), 'days');
  }

  isYesterday():: boolean {
    return this.isSame(DateTime.yesterday(), 'days');
  }

  isTomorrow():: boolean {
    return this.isSame(DateTime.tomorrow(), 'days');
  }

  isWeekend():: boolean {
    def dayOfWeek = this.dayOfWeek;
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  isWeekday():: boolean {
    return !this.isWeekend();
  }

  // Static utility methods
  static isLeapYear(year:: number):: boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  static daysInMonth(year:: number, month:: number):: number {
    return new Date(year, month + 1, 0).getDate();
  }

  static max(...dates:: DateTime[]):: DateTime {
    def maxDate = dates.reduce((max, current) =>
    current.isAfter(max) ? current : max
  );
  return maxDate;
}

static min(...dates:: DateTime[]):: DateTime {
  def minDate = dates.reduce((min, current) =>
  current.isBefore(min) ? current : min
);
return minDate;
}
}

// Utility functions for working with durations
class DateTimeUtils {
  static async sleep(ms:: number):: Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async timeout<T>(promise:: Promise<T>, ms:: number):: Promise<T> {
    def timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  static formatDuration(duration:: Duration):: string {
    def parts:: string[] = [];

    if (duration.years > 0) parts.push(`${duration.years}y`);
    if (duration.months > 0) parts.push(`${duration.months}mo`);
    if (duration.weeks > 0) parts.push(`${duration.weeks}w`);
    if (duration.days > 0) parts.push(`${duration.days}d`);
    if (duration.hours > 0) parts.push(`${duration.hours}h`);
    if (duration.minutes > 0) parts.push(`${duration.minutes}m`);
    if (duration.seconds > 0) parts.push(`${duration.seconds}s`);
    if (duration.milliseconds > 0) parts.push(`${duration.milliseconds}ms`);

    return parts.join(' ') || '0ms';
  }

  static humanizeDuration(ms:: number):: string {
    def duration = {
      years: 0,
      months: 0,
      weeks: 0,
      days: Math.floor(ms / (1000 * 60 * 60 * 24)),
      hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((ms % (1000 * 60)) / 1000),
      milliseconds: ms % 1000
    };

    return this.formatDuration(duration);
  }

  // Additional utility methods
  static elapsed(start:: DateTime, end?: DateTime):: string {
    def endTime = end || DateTime.now();
    def duration = endTime.duration(start);
    return this.formatDuration(duration);
  }

  static benchmark<T>(fn:: () => T, label?: string):: T {
    def start = DateTime.now();
    def result = fn();
    def end = DateTime.now();
    def elapsed = this.elapsed(start, end);

    if (label) {
      console.log(`${label}: ${elapsed}`);
    } else {
      console.log(`Execution time: ${elapsed}`);
    }

    return result;
  }

  static async benchmarkAsync<T>(fn:: () => Promise<T>, label?: string):: Promise<T> {
    def start = DateTime.now();
    def result = await fn();
    def end = DateTime.now();
    def elapsed = this.elapsed(start, end);

    if (label) {
      console.log(`${label}: ${elapsed}`);
    } else {
      console.log(`Async execution time: ${elapsed}`);
    }

    return result;
  }

  // Date range utilities
  static dateRange(start:: DateTime, end:: DateTime, step:: number = 1, unit:: TimeUnit = 'days'):: DateTime[] {
    def dates:: DateTime[] = [];
    var current = start.clone();

    while (current.isBefore(end) || current.isSame(end)) {
      dates.push(current.clone());
      current = current.add(step, unit);
    }

    return dates;
  }

  static businessDays(start:: DateTime, end:: DateTime):: DateTime[] {
    def allDays = this.dateRange(start, end);
    return allDays.filter(date => date.isWeekday());
  }

  static weekends(start:: DateTime, end:: DateTime):: DateTime[] {
    def allDays = this.dateRange(start, end);
    return allDays.filter(date => date.isWeekend());
  }

  // Calendar utilities
  static getCalendarMonth(year:: number, month:: number):: DateTime[][] {
    def firstDay = new DateTime(new Date(year, month, 1));
    def lastDay = new DateTime(new Date(year, month + 1, 0));
    def startOfWeek = firstDay.startOf('weeks');
    def endOfWeek = lastDay.endOf('weeks');

    def allDays = this.dateRange(startOfWeek, endOfWeek);
    def weeks:: DateTime[][] = [];

    for (var i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return weeks;
  }

  static isHoliday(date:: DateTime, holidays:: DateTime[] = []):: boolean {
    return holidays.some(holiday => date.isSame(holiday, 'days'));
  }
}

// Timezone helper class
class Timezone {
  static readonly UTC = 'UTC';
  static readonly EST = 'America/New_York';
  static readonly PST = 'America/Los_Angeles';
  static readonly GMT = 'Europe/London';
  static readonly JST = 'Asia/Tokyo';
  static readonly AEST = 'Australia/Sydney';

  static convert(date:: DateTime, fromTz:: string, toTz:: string):: DateTime {
    // This is a simplified conversion - in reality you'd need proper timezone data
    def utcTime = date.timezone(fromTz).utc();
    return utcTime.timezone(toTz);
  }

  static getOffset(timezone:: string, date?: DateTime):: number {
    def testDate = date || DateTime.now();
    def formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });
    def parts = formatter.formatToParts(testDate.date);
    def offsetPart = parts.find(part => part.type === 'timeZoneName');

    if (offsetPart) {
      def offsetStr = offsetPart.value;
      // Parse offset string like "GMT+5" or "GMT-5"
      def match = offsetStr.match(/GMT([+-])(\d+)/);
      if (match) {
        def sign = match[1] === '+' ? 1 : -1;
        def hours = parseInt(match[2]);
        return sign * hours * 60; // Return offset in minutes
      }
    }

    return 0; // Default to UTC
  }
}

// Export all classes and types - updated syntax
module.exports = { DateTime, DateTimeUtils, Timezone };
module.exports.TimeUnit = TimeUnit;
module.exports.DateFormat = DateFormat;
module.exports.DateTimeOptions = DateTimeOptions;
module.exports.Duration = Duration;
