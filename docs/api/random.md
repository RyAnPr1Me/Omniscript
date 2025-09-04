# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [random](#random)

## random

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/random.ts`

### Classes

#### RandomUtils

**Properties**:

- `seed: number | null` - 

**Methods**:

##### setSeed

Set seed for reproducible random numbers

**Signature**: `static setSeed(seed: number): void`

##### getRandom

Get seeded random number or use Math.random

**Signature**: `private static getRandom(): number`

##### int

Generate random integer between min and max (inclusive)

**Signature**: `static int(min: number, max: number): number`

##### float

Generate random float between min and max

**Signature**: `static float(min: number = 0, max: number = 1): number`

##### boolean

Generate random boolean

**Signature**: `static boolean(probability: number = 0.5): boolean`

##### choice

Pick random element from array

**Signature**: `static choice<T>(array: T[]): T`

##### choices

Pick multiple random elements from array (with replacement)

**Signature**: `static choices<T>(array: T[], count: number): T[]`

##### sample

Sample random elements from array (without replacement)

**Signature**: `static sample<T>(array: T[], count: number): T[]`

##### weightedChoice

Weighted random selection

**Signature**: `static weightedChoice<T>(items: WeightedItem<T>[]): T`

##### shuffle

Shuffle array using Fisher-Yates algorithm

**Signature**: `static shuffle<T>(array: T[]): T[]`

##### string

Generate random string

**Signature**: `static string(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string`

##### alphanumeric

Generate random alphanumeric string

**Signature**: `static alphanumeric(length: number): string`

##### alpha

Generate random alphabetic string

**Signature**: `static alpha(length: number): string`

##### numeric

Generate random numeric string

**Signature**: `static numeric(length: number): string`

##### hex

Generate random hex string

**Signature**: `static hex(length: number): string`

##### uuid

Generate UUID v4

**Signature**: `static uuid(): string`

##### color

Generate random color in hex format

**Signature**: `static color(): string`

##### rgb

Generate random RGB color

**Signature**: `static rgb():`

##### hsl

Generate random HSL color

**Signature**: `static hsl():`

##### bytes

Generate random bytes

**Signature**: `static bytes(length: number): Uint8Array`

##### normal

Generate random normal distribution (Box-Muller)

**Signature**: `static normal(mean: number = 0, standardDeviation: number = 1): number`

##### exponential

Generate random exponential distribution

**Signature**: `static exponential(lambda: number = 1): number`

##### uniform

Generate random uniform distribution

**Signature**: `static uniform(min: number = 0, max: number = 1): number`

##### poisson

Generate random poisson distribution

**Signature**: `static poisson(lambda: number): number`

##### date

Generate random date between two dates

**Signature**: `static date(start: Date, end: Date): Date`

##### time

Generate random time (hours, minutes, seconds)

**Signature**: `static time():`

##### coordinate

Generate random coordinate within bounds

**Signature**: `static coordinate(bounds:`

##### unitCircle

Generate random point on unit circle

**Signature**: `static unitCircle():`

##### unitSphere

Generate random point in unit sphere

**Signature**: `static unitSphere():`

##### walk

Generate random walk data

**Signature**: `static walk(steps: number, stepSize: number = 1): number[]`

##### matrix

Generate random matrix

**Signature**: `static matrix(rows: number, cols: number, min: number = 0, max: number = 1): number[][]`

##### password

Generate random password

**Signature**: `static password(length: number = 12, options:`

##### firstName

Generate random name (first name)

**Signature**: `static firstName(): string`

##### lastName

Generate random last name

**Signature**: `static lastName(): string`

##### fullName

Generate random full name

**Signature**: `static fullName(): string`

##### email

Generate random email

**Signature**: `static email(): string`

##### phoneNumber

Generate random phone number

**Signature**: `static phoneNumber(format: string = '(###) ###-####'): string`

##### resetSeed

Reset seed (return to Math.random)

**Signature**: `static resetSeed(): void`

### Interfaces

#### RandomOptions

**Properties**:

- `seed: number` - 

#### WeightedItem

**Properties**:

- `item: T` - 
- `weight: number` - 


