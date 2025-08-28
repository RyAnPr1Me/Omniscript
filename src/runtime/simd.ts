import { debug } from '../debug';

export interface SIMDOperations {
  add(a: number[], b: number[]): number[];
  subtract(a: number[], b: number[]): number[];
  multiply(a: number[], b: number[]): number[];
  divide(a: number[], b: number[]): number[];
  dot(a: number[], b: number[]): number;
  magnitude(a: number[]): number;
  normalize(a: number[]): number[];
}

export class SIMDProcessor implements SIMDOperations {
  private useParallel: boolean = false;

  constructor(useParallel: boolean = false) {
    this.useParallel = useParallel;
    debug.info('SIMD', `SIMD processor initialized with parallel execution: ${useParallel}`);
  }

  enableParallelExecution(): void {
    this.useParallel = true;
    debug.info('SIMD', 'Parallel execution enabled for SIMD operations');
  }

  add(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug('SIMD', `Performing vector addition on arrays of length ${a.length}`);
    
    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => x + y);
    }
    
    return a.map((x, i) => x + b[i]);
  }

  subtract(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug('SIMD', `Performing vector subtraction on arrays of length ${a.length}`);
    
    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => x - y);
    }
    
    return a.map((x, i) => x - b[i]);
  }

  multiply(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug('SIMD', `Performing vector multiplication on arrays of length ${a.length}`);
    
    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => x * y);
    }
    
    return a.map((x, i) => x * b[i]);
  }

  divide(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug('SIMD', `Performing vector division on arrays of length ${a.length}`);
    
    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => y !== 0 ? x / y : x / y);
    }
    
    return a.map((x, i) => b[i] !== 0 ? x / b[i] : x / b[i]);
  }

  dot(a: number[], b: number[]): number {
    this.validateArrays(a, b);
    debug.debug('SIMD', `Computing dot product of arrays of length ${a.length}`);
    
    if (this.useParallel && a.length > 1000) {
      return this.parallelReduce(a, b, (x, y) => x * y, (acc, val) => acc + val, 0);
    }
    
    return a.reduce((sum, x, i) => sum + x * b[i], 0);
  }

  magnitude(a: number[]): number {
    debug.debug('SIMD', `Computing magnitude of array of length ${a.length}`);
    
    if (this.useParallel && a.length > 1000) {
      const squares = this.parallelUnaryOperation(a, x => x * x);
      return Math.sqrt(squares.reduce((sum, x) => sum + x, 0));
    }
    
    return Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  }

  normalize(a: number[]): number[] {
    debug.debug('SIMD', `Normalizing array of length ${a.length}`);
    const mag = this.magnitude(a);
    
    if (mag === 0) return a.slice(); // Return copy if zero magnitude
    
    if (this.useParallel && a.length > 1000) {
      return this.parallelUnaryOperation(a, x => x / mag);
    }
    
    return a.map(x => x / mag);
  }

  // Matrix operations
  matrixMultiply(a: number[][], b: number[][]): number[][] {
    if (a[0].length !== b.length) {
      throw new Error('Matrix dimensions do not match for multiplication');
    }

    debug.debug('SIMD', `Performing matrix multiplication ${a.length}x${a[0].length} * ${b.length}x${b[0].length}`);
    
    const result: number[][] = [];
    
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    
    return result;
  }

  // Parallel operation helpers
  private parallelOperation(a: number[], b: number[], op: (x: number, y: number) => number): number[] {
    const chunkSize = Math.ceil(a.length / 4); // Use 4 chunks for demonstration
    const results: number[] = [];

    for (let i = 0; i < a.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, a.length);
      const chunkA = a.slice(i, end);
      const chunkB = b.slice(i, end);
      const chunkResult = chunkA.map((x, idx) => op(x, chunkB[idx]));
      results.push(...chunkResult);
    }

    return results;
  }

  private parallelUnaryOperation(a: number[], op: (x: number) => number): number[] {
    const chunkSize = Math.ceil(a.length / 4);
    const results: number[] = [];

    for (let i = 0; i < a.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, a.length);
      const chunkA = a.slice(i, end);
      const chunkResult = chunkA.map(op);
      results.push(...chunkResult);
    }

    return results;
  }

  private parallelReduce(
    a: number[], 
    b: number[], 
    op: (x: number, y: number) => number,
    reducer: (acc: number, val: number) => number,
    initial: number
  ): number {
    const chunkSize = Math.ceil(a.length / 4);
    const partialResults: number[] = [];

    for (let i = 0; i < a.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, a.length);
      const chunkA = a.slice(i, end);
      const chunkB = b.slice(i, end);
      
      const chunkResult = chunkA.reduce((sum, x, idx) => {
        return reducer(sum, op(x, chunkB[idx]));
      }, initial);
      
      partialResults.push(chunkResult);
    }

    return partialResults.reduce(reducer, initial);
  }

  private async processChunk(a: number[], b: number[], op: (x: number, y: number) => number): Promise<number[]> {
    // Simulate async processing
    return new Promise(resolve => {
      setImmediate(() => {
        resolve(a.map((x, i) => op(x, b[i])));
      });
    });
  }

  private async processUnaryChunk(a: number[], op: (x: number) => number): Promise<number[]> {
    return new Promise(resolve => {
      setImmediate(() => {
        resolve(a.map(op));
      });
    });
  }

  private validateArrays(a: number[], b: number[]): void {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      throw new Error('Both arguments must be arrays');
    }
    if (a.length !== b.length) {
      throw new Error('Arrays must have the same length');
    }
  }
}

// Export a default instance
export const simd = new SIMDProcessor();