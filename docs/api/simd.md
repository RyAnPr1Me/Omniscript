# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [simd](#simd)

## simd

**File**: `/home/runner/work/Omniscript/Omniscript/src/runtime/simd.ts`

### Classes

#### SIMDProcessor

**Implements**: `SIMDOperations`

**Properties**:

- `useParallel: boolean` - 

**Methods**:

##### enableParallelExecution

**Signature**: `enableParallelExecution(): void`

##### add

**Signature**: `add(a: number[], b: number[]): number[]`

##### subtract

**Signature**: `subtract(a: number[], b: number[]): number[]`

##### multiply

**Signature**: `multiply(a: number[], b: number[]): number[]`

##### divide

**Signature**: `divide(a: number[], b: number[]): number[]`

##### dot

**Signature**: `dot(a: number[], b: number[]): number`

##### magnitude

**Signature**: `magnitude(a: number[]): number`

##### normalize

**Signature**: `normalize(a: number[]): number[]`

##### matrixMultiply

**Signature**: `matrixMultiply(a: number[][], b: number[][]): number[][]`

##### parallelOperation

**Signature**: `private parallelOperation(a: number[], b: number[], op: (x: number, y: number) => number): number[]`

##### parallelReduce

**Signature**: `private parallelReduce(
    a: number[], 
    b: number[], 
    op: (x: number, y: number) => number,
    reducer: (acc: number, val: number) => number,
    initial: number
  ): number`

##### processChunk

**Signature**: `private async processChunk(a: number[], b: number[], op: (x: number, y: number) => number): Promise<number[]>`

##### processUnaryChunk

**Signature**: `private async processUnaryChunk(a: number[], op: (x: number) => number): Promise<number[]>`

##### validateArrays

**Signature**: `private validateArrays(a: number[], b: number[]): void`

##### fma

**Signature**: `fma(a: number[], b: number[], c: number[]): number[]`

##### reduce

**Signature**: `reduce(a: number[], operation: 'sum' | 'min' | 'max' | 'mean'): number`

##### transform

**Signature**: `transform(a: number[], fn: (x: number) => number): number[]`

##### convolve

**Signature**: `convolve(signal: number[], kernel: number[]): number[]`

##### crossCorrelation

**Signature**: `crossCorrelation(a: number[], b: number[]): number[]`

##### mean

**Signature**: `mean(a: number[]): number`

##### variance

**Signature**: `variance(a: number[]): number`

##### standardDeviation

**Signature**: `standardDeviation(a: number[]): number`

##### covariance

**Signature**: `covariance(a: number[], b: number[]): number`

##### correlation

**Signature**: `correlation(a: number[], b: number[]): number`

##### parallelUnaryOperation

**Signature**: `private parallelUnaryOperation(a: number[], op: (x: number) => number): number[]`

### Interfaces

#### SIMDOperations

**Methods**:

##### add

**Signature**: `add(a: number[], b: number[]): number[];`

##### subtract

**Signature**: `subtract(a: number[], b: number[]): number[];`

##### multiply

**Signature**: `multiply(a: number[], b: number[]): number[];`

##### divide

**Signature**: `divide(a: number[], b: number[]): number[];`

##### dot

**Signature**: `dot(a: number[], b: number[]): number;`

##### magnitude

**Signature**: `magnitude(a: number[]): number;`

##### normalize

**Signature**: `normalize(a: number[]): number[];`

##### fma

**Signature**: `fma(a: number[], b: number[], c: number[]): number[];`

##### reduce

**Signature**: `reduce(a: number[], operation: 'sum' | 'min' | 'max' | 'mean'): number;`

##### transform

**Signature**: `transform(a: number[], fn: (x: number) => number): number[];`

##### convolve

**Signature**: `convolve(signal: number[], kernel: number[]): number[];`

##### crossCorrelation

**Signature**: `crossCorrelation(a: number[], b: number[]): number[];`

##### mean

**Signature**: `mean(a: number[]): number;`

##### variance

**Signature**: `variance(a: number[]): number;`

##### standardDeviation

**Signature**: `standardDeviation(a: number[]): number;`

##### covariance

**Signature**: `covariance(a: number[], b: number[]): number;`

##### correlation

**Signature**: `correlation(a: number[], b: number[]): number;`


