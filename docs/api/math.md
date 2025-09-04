# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [math](#math)

## math

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/math.ts`

### Classes

#### MathUtils

**Properties**:

- `PI: number` - 
- `E: number` - 
- `GOLDEN_RATIO: number` - 
- `SQRT_2: number` - 
- `SQRT_3: number` - 

**Methods**:

##### sum

**Signature**: `static sum(numbers: number[]): number`

##### mean

**Signature**: `static mean(numbers: number[]): number`

##### median

**Signature**: `static median(numbers: number[]): number`

##### mode

**Signature**: `static mode(numbers: number[]): number | number[]`

##### std

**Signature**: `static std(numbers: number[]): number`

##### variance

**Signature**: `static variance(numbers: number[]): number`

##### min

**Signature**: `static min(numbers: number[]): number`

##### max

**Signature**: `static max(numbers: number[]): number`

##### range

**Signature**: `static range(numbers: number[]): number`

##### factorial

**Signature**: `static factorial(n: number): number`

##### fibonacci

**Signature**: `static fibonacci(n: number): number`

##### fibonacciSequence

**Signature**: `static fibonacciSequence(n: number): number[]`

##### gcd

**Signature**: `static gcd(a: number, b: number): number`

##### lcm

**Signature**: `static lcm(a: number, b: number): number`

##### isPrime

**Signature**: `static isPrime(n: number): boolean`

##### primes

**Signature**: `static primes(n: number): number[]`

##### random

**Signature**: `static random(min: number = 0, max: number = 1): number`

##### randomInt

**Signature**: `static randomInt(min: number, max: number): number`

##### randomChoice

**Signature**: `static randomChoice<T>(array: T[]): T`

##### shuffle

**Signature**: `static shuffle<T>(array: T[]): T[]`

##### degToRad

**Signature**: `static degToRad(degrees: number): number`

##### radToDeg

**Signature**: `static radToDeg(radians: number): number`

##### sinDeg

**Signature**: `static sinDeg(degrees: number): number`

##### cosDeg

**Signature**: `static cosDeg(degrees: number): number`

##### tanDeg

**Signature**: `static tanDeg(degrees: number): number`

##### dotProduct

**Signature**: `static dotProduct(a: number[], b: number[]): number`

##### vectorMagnitude

**Signature**: `static vectorMagnitude(vector: number[]): number`

##### normalize

**Signature**: `static normalize(vector: number[]): number[]`

##### crossProduct

**Signature**: `static crossProduct(a: number[], b: number[]): number[]`

##### matrixAdd

**Signature**: `static matrixAdd(a: number[][], b: number[][]): number[][]`

##### matrixMultiply

**Signature**: `static matrixMultiply(a: number[][], b: number[][]): number[][]`

##### matrixTranspose

**Signature**: `static matrixTranspose(matrix: number[][]): number[][]`

##### matrixDeterminant2x2

**Signature**: `static matrixDeterminant2x2(matrix: number[][]): number`

##### linearInterpolation

**Signature**: `static linearInterpolation(x1: number, y1: number, x2: number, y2: number, x: number): number`

##### clamp

**Signature**: `static clamp(value: number, min: number, max: number): number`

##### lerp

**Signature**: `static lerp(a: number, b: number, t: number): number`

##### isEven

**Signature**: `static isEven(n: number): boolean`

##### isOdd

**Signature**: `static isOdd(n: number): boolean`

##### isPowerOfTwo

**Signature**: `static isPowerOfTwo(n: number): boolean`

##### nextPowerOfTwo

**Signature**: `static nextPowerOfTwo(n: number): number`

##### approxEqual

**Signature**: `static approxEqual(a: number, b: number, epsilon: number = 1e-10): boolean`

##### roundTo

**Signature**: `static roundTo(value: number, decimals: number): number`

##### formatNumber

**Signature**: `static formatNumber(value: number, decimals: number = 2): string`

##### complexAdd

**Signature**: `static complexAdd(a:`

##### complexMultiply

**Signature**: `static complexMultiply(a:`

##### complexMagnitude

**Signature**: `static complexMagnitude(complex:`

##### normalDistribution

**Signature**: `static normalDistribution(x: number, mean: number = 0, stdDev: number = 1): number`

##### uniformDistribution

**Signature**: `static uniformDistribution(x: number, min: number = 0, max: number = 1): number`

##### exponentialDistribution

**Signature**: `static exponentialDistribution(x: number, lambda: number = 1): number`

##### derivative

**Signature**: `static derivative(fn: (x: number) => number, x: number, h: number = 1e-7): number`

##### integral

**Signature**: `static integral(fn: (x: number) => number, a: number, b: number, n: number = 1000): number`

##### newtonRaphson

**Signature**: `static newtonRaphson(fn: (x: number) => number, x0: number, maxIterations: number = 100, tolerance: number = 1e-10): number`

##### distance2D

**Signature**: `static distance2D(p1:`

##### distance3D

**Signature**: `static distance3D(p1:`

##### pointInPolygon

**Signature**: `static pointInPolygon(point:`

##### convexHull

**Signature**: `static convexHull(points:`

##### cross

**Signature**: `private static cross(o:`

##### presentValue

**Signature**: `static presentValue(futureValue: number, rate: number, periods: number): number`

##### futureValue

**Signature**: `static futureValue(presentValue: number, rate: number, periods: number): number`

##### compoundInterest

**Signature**: `static compoundInterest(principal: number, rate: number, periods: number, compoundingFrequency: number = 1): number`

##### annuityPayment

**Signature**: `static annuityPayment(principal: number, rate: number, periods: number): number`

##### gamma

**Signature**: `static gamma(z: number): number`

##### nextPrime

**Signature**: `static nextPrime(n: number): number`

##### primeFactors

**Signature**: `static primeFactors(n: number): number[]`

##### gcdMultiple

**Signature**: `static gcdMultiple(...numbers: number[]): number`

##### lcmMultiple

**Signature**: `static lcmMultiple(...numbers: number[]): number`

##### sinh

**Signature**: `static sinh(x: number): number`

##### cosh

**Signature**: `static cosh(x: number): number`

##### tanh

**Signature**: `static tanh(x: number): number`

##### asinh

**Signature**: `static asinh(x: number): number`

##### acosh

**Signature**: `static acosh(x: number): number`

##### atanh

**Signature**: `static atanh(x: number): number`

##### modPow

**Signature**: `static modPow(base: number, exponent: number, modulus: number): number`

##### isPerfectSquare

**Signature**: `static isPerfectSquare(n: number): boolean`

##### permutations

**Signature**: `static permutations(n: number, r: number): number`

##### combinations

**Signature**: `static combinations(n: number, r: number): number`

##### floorTo

**Signature**: `static floorTo(value: number, decimals: number): number`

##### ceilTo

**Signature**: `static ceilTo(value: number, decimals: number): number`

##### truncateTo

**Signature**: `static truncateTo(value: number, decimals: number): number`

##### percentile

**Signature**: `static percentile(numbers: number[], percentile: number): number`

##### quartiles

**Signature**: `static quartiles(numbers: number[]):`

##### iqr

**Signature**: `static iqr(numbers: number[]): number`

##### zScore

**Signature**: `static zScore(value: number, mean: number, standardDeviation: number): number`

##### correlation

**Signature**: `static correlation(x: number[], y: number[]): number`

##### randomGaussian

**Signature**: `static randomGaussian(mean: number = 0, standardDeviation: number = 1): number`

##### sample

**Signature**: `static sample<T>(array: T[], count: number): T[]`

##### inverseLerp

**Signature**: `static inverseLerp(a: number, b: number, value: number): number`

##### map

**Signature**: `static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number`

##### smoothstep

**Signature**: `static smoothstep(edge0: number, edge1: number, x: number): number`


