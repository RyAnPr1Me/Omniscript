# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [datetime](#datetime)

## datetime

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/datetime.ts`

### Classes

#### DateTime

**Properties**:

- `date: Date` - 
- `options: DateTimeOptions` - 

**Methods**:

##### now

**Signature**: `static now(): DateTime`

##### today

**Signature**: `static today(): DateTime`

##### tomorrow

**Signature**: `static tomorrow(): DateTime`

##### yesterday

**Signature**: `static yesterday(): DateTime`

##### fromTimestamp

**Signature**: `static fromTimestamp(timestamp: number): DateTime`

##### fromISO

**Signature**: `static fromISO(isoString: string): DateTime`

##### parse

**Signature**: `static parse(dateString: string, format?: string): DateTime`

##### add

**Signature**: `add(amount: number, unit: TimeUnit): DateTime`

##### subtract

**Signature**: `subtract(amount: number, unit: TimeUnit): DateTime`

##### isBefore

**Signature**: `isBefore(other: DateTime): boolean`

##### isAfter

**Signature**: `isAfter(other: DateTime): boolean`

##### isSame

**Signature**: `isSame(other: DateTime, precision: TimeUnit = 'milliseconds'): boolean`

##### isBetween

**Signature**: `isBetween(start: DateTime, end: DateTime, inclusive: boolean = false): boolean`

##### diff

**Signature**: `diff(other: DateTime, unit: TimeUnit = 'milliseconds'): number`

##### duration

**Signature**: `duration(other: DateTime): Duration`

##### format

**Signature**: `format(pattern?: string): string`

##### toISO

**Signature**: `toISO(): string`

##### toDateString

**Signature**: `toDateString(): string`

##### toTimeString

**Signature**: `toTimeString(): string`

##### toJSON

**Signature**: `toJSON(): string`

##### toString

**Signature**: `toString(): string`

##### setYear

**Signature**: `setYear(year: number): DateTime`

##### setMonth

**Signature**: `setMonth(month: number): DateTime`

##### setDay

**Signature**: `setDay(day: number): DateTime`

##### setHour

**Signature**: `setHour(hour: number): DateTime`

##### setMinute

**Signature**: `setMinute(minute: number): DateTime`

##### setSecond

**Signature**: `setSecond(second: number): DateTime`

##### startOf

**Signature**: `startOf(unit: TimeUnit): DateTime`

##### endOf

**Signature**: `endOf(unit: TimeUnit): DateTime`

##### isLeapYear

**Signature**: `isLeapYear(): boolean`

##### daysInMonth

**Signature**: `daysInMonth(): number`

##### clone

**Signature**: `clone(): DateTime`

##### utc

**Signature**: `utc(): DateTime`

##### local

**Signature**: `local(): DateTime`

##### timezone

**Signature**: `timezone(tz: string): DateTime`

##### isValid

**Signature**: `isValid(): boolean`

##### isToday

**Signature**: `isToday(): boolean`

##### isYesterday

**Signature**: `isYesterday(): boolean`

##### isTomorrow

**Signature**: `isTomorrow(): boolean`

##### isWeekend

**Signature**: `isWeekend(): boolean`

##### isWeekday

**Signature**: `isWeekday(): boolean`

##### isLeapYear

**Signature**: `static isLeapYear(year: number): boolean`

##### daysInMonth

**Signature**: `static daysInMonth(year: number, month: number): number`

##### max

**Signature**: `static max(...dates: DateTime[]): DateTime`

##### min

**Signature**: `static min(...dates: DateTime[]): DateTime`

#### DateTimeUtils

**Methods**:

##### sleep

**Signature**: `static sleep(ms: number): Promise<void>`

##### timeout

**Signature**: `static timeout<T>(promise: Promise<T>, ms: number): Promise<T>`

##### formatDuration

**Signature**: `static formatDuration(duration: Duration): string`

##### humanizeDuration

**Signature**: `static humanizeDuration(ms: number): string`

### Interfaces

#### DateTimeOptions

**Properties**:

- `locale: string` - 
- `timezone: string` - 

#### Duration

**Properties**:

- `years: number` - 
- `months: number` - 
- `weeks: number` - 
- `days: number` - 
- `hours: number` - 
- `minutes: number` - 
- `seconds: number` - 
- `milliseconds: number` - 


