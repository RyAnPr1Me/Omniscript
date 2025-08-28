export class MathUtils {
  static readonly PI: number = 3.141592653589793;
  static readonly E: number = 2.718281828459045;
  static readonly GOLDEN_RATIO: number = 1.618033988749895;
  static readonly SQRT_2: number = 1.4142135623730951;
  static readonly SQRT_3: number = 1.7320508075688772;

  // Basic statistical functions
  static sum(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
  }

  static mean(numbers: number[]): number {
    return this.sum(numbers) / numbers.length;
  }

  static median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static mode(numbers: number[]): number | number[] {
    const frequency: Map<number, number> = new Map();
    let maxCount = 0;
    
    for (const num of numbers) {
      const count = (frequency.get(num) || 0) + 1;
      frequency.set(num, count);
      maxCount = Math.max(maxCount, count);
    }
    
    const modes = Array.from(frequency.entries())
      .filter(([_, count]) => count === maxCount)
      .map(([num, _]) => num);
    
    return modes.length === 1 ? modes[0] : modes;
  }

  static std(numbers: number[]): number {
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map(n => (n - avg) ** 2);
    return Math.sqrt(this.mean(squareDiffs));
  }

  static variance(numbers: number[]): number {
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map(n => (n - avg) ** 2);
    return this.mean(squareDiffs);
  }

  static min(numbers: number[]): number {
    return Math.min(...numbers);
  }

  static max(numbers: number[]): number {
    return Math.max(...numbers);
  }

  static range(numbers: number[]): number {
    return this.max(numbers) - this.min(numbers);
  }

  // Advanced mathematical functions
  static factorial(n: number): number {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers");
    if (n === 0 || n === 1) return 1;
    
    // Use iterative approach for better performance
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static fibonacci(n: number): number {
    if (n < 0) throw new Error("Fibonacci is not defined for negative numbers");
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  static fibonacciSequence(n: number): number[] {
    const sequence = [0, 1];
    for (let i = 2; i < n; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence.slice(0, n);
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? Math.abs(a) : this.gcd(b, a % b);
  }

  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  static isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  static primes(n: number): number[] {
    const primes: number[] = [];
    for (let i = 2; primes.length < n; i++) {
      if (this.isPrime(i)) {
        primes.push(i);
      }
    }
    return primes;
  }

  // Random number generation
  static random(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1));
  }

  static randomChoice<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Trigonometric functions (degrees)
  static degToRad(degrees: number): number {
    return degrees * (this.PI / 180);
  }

  static radToDeg(radians: number): number {
    return radians * (180 / this.PI);
  }

  static sinDeg(degrees: number): number {
    return Math.sin(this.degToRad(degrees));
  }

  static cosDeg(degrees: number): number {
    return Math.cos(this.degToRad(degrees));
  }

  static tanDeg(degrees: number): number {
    return Math.tan(this.degToRad(degrees));
  }

  // Linear algebra utilities
  static dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  static vectorMagnitude(vector: number[]): number {
    return Math.sqrt(this.dotProduct(vector, vector));
  }

  static normalize(vector: number[]): number[] {
    const magnitude = this.vectorMagnitude(vector);
    return magnitude === 0 ? vector.slice() : vector.map(val => val / magnitude);
  }

  static crossProduct(a: number[], b: number[]): number[] {
    if (a.length !== 3 || b.length !== 3) {
      throw new Error('Cross product is only defined for 3D vectors');
    }
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  // Matrix operations
  static matrixAdd(a: number[][], b: number[][]): number[][] {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error('Matrices must have the same dimensions');
    }
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  }

  static matrixMultiply(a: number[][], b: number[][]): number[][] {
    if (a[0].length !== b.length) {
      throw new Error('Matrix dimensions do not match for multiplication');
    }
    
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

  static matrixTranspose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  static matrixDeterminant2x2(matrix: number[][]): number {
    if (matrix.length !== 2 || matrix[0].length !== 2) {
      throw new Error('Matrix must be 2x2');
    }
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  // Interpolation and curve fitting
  static linearInterpolation(x1: number, y1: number, x2: number, y2: number, x: number): number {
    return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * this.clamp(t, 0, 1);
  }

  // Number theory
  static isEven(n: number): boolean {
    return n % 2 === 0;
  }

  static isOdd(n: number): boolean {
    return n % 2 !== 0;
  }

  static isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  static nextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  // Utility functions
  static approxEqual(a: number, b: number, epsilon: number = 1e-10): boolean {
    return Math.abs(a - b) < epsilon;
  }

  static roundTo(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  static formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  // Complex number operations
  static complexAdd(a: {real: number, imag: number}, b: {real: number, imag: number}) {
    return { real: a.real + b.real, imag: a.imag + b.imag };
  }

  static complexMultiply(a: {real: number, imag: number}, b: {real: number, imag: number}) {
    return {
      real: a.real * b.real - a.imag * b.imag,
      imag: a.real * b.imag + a.imag * b.real
    };
  }

  static complexMagnitude(complex: {real: number, imag: number}): number {
    return Math.sqrt(complex.real * complex.real + complex.imag * complex.imag);
  }
}
