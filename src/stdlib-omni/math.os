// Math utilities library implemented in Omniscript
// This replaces the TypeScript-based src/stdlib/math.ts

class MathUtils {
  static readonly PI:: number = 3.141592653589793;
  static readonly E:: number = 2.718281828459045;
  static readonly GOLDEN_RATIO:: number = 1.618033988749895;
  static readonly SQRT_2:: number = 1.4142135623730951;
  static readonly SQRT_3:: number = 1.7320508075688772;

  // Basic statistical functions
  static sum(numbers:: number[]):: number {
    return numbers.reduce((a, b) => a + b, 0);
  }

  static mean(numbers:: number[]):: number {
    return this.sum(numbers) / numbers.length;
  }

  static median(numbers:: number[]):: number {
    def sorted = [...numbers].sort((a, b) => a - b);
    def mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static mode(numbers:: number[]):: number | number[] {
    def frequency:: Map<number, number> = new Map();
    var maxCount = 0;
    
    for (def num of numbers) {
      def count = (frequency.get(num) || 0) + 1;
      frequency.set(num, count);
      maxCount = Math.max(maxCount, count);
    }
    
    def modes = Array.from(frequency.entries())
      .filter(([_, count]) => count === maxCount)
      .map(([num, _]) => num);
    
    return modes.length === 1 ? modes[0] : modes;
  }

  static std(numbers:: number[]):: number {
    def avg = this.mean(numbers);
    def squareDiffs = numbers.map(n => (n - avg) ** 2);
    return Math.sqrt(this.mean(squareDiffs));
  }

  static variance(numbers:: number[]):: number {
    def avg = this.mean(numbers);
    def squareDiffs = numbers.map(n => (n - avg) ** 2);
    return this.mean(squareDiffs);
  }

  static min(numbers:: number[]):: number {
    return Math.min(...numbers);
  }

  static max(numbers:: number[]):: number {
    return Math.max(...numbers);
  }

  static range(numbers:: number[]):: number {
    return this.max(numbers) - this.min(numbers);
  }

  // Advanced mathematical functions
  static factorial(n:: number):: number {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers");
    if (n === 0 || n === 1) return 1;
    
    // Use iterative approach for better performance
    var result = 1;
    for (var i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static fibonacci(n:: number):: number {
    if (n < 0) throw new Error("Fibonacci is not defined for negative numbers");
    if (n <= 1) return n;
    
    var a = 0, b = 1;
    for (var i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  static fibonacciSequence(n:: number):: number[] {
    def sequence = [0, 1];
    for (var i = 2; i < n; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence.slice(0, n);
  }

  static gcd(a:: number, b:: number):: number {
    return b === 0 ? Math.abs(a) : this.gcd(b, a % b);
  }

  static lcm(a:: number, b:: number):: number {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  static isPrime(n:: number):: boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (var i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  static primes(n:: number):: number[] {
    def primes:: number[] = [];
    for (var i = 2; primes.length < n; i++) {
      if (this.isPrime(i)) {
        primes.push(i);
      }
    }
    return primes;
  }

  // Random number generation
  static random(min:: number = 0, max:: number = 1):: number {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min:: number, max:: number):: number {
    return Math.floor(this.random(min, max + 1));
  }

  static randomChoice<T>(array:: T[]):: T {
    return array[this.randomInt(0, array.length - 1)];
  }

  static shuffle<T>(array:: T[]):: T[] {
    def shuffled = [...array];
    for (var i = shuffled.length - 1; i > 0; i--) {
      def j = this.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Trigonometric functions (degrees)
  static degToRad(degrees:: number):: number {
    return degrees * (this.PI / 180);
  }

  static radToDeg(radians:: number):: number {
    return radians * (180 / this.PI);
  }

  static sinDeg(degrees:: number):: number {
    return Math.sin(this.degToRad(degrees));
  }

  static cosDeg(degrees:: number):: number {
    return Math.cos(this.degToRad(degrees));
  }

  static tanDeg(degrees:: number):: number {
    return Math.tan(this.degToRad(degrees));
  }

  // Linear algebra utilities
  static dotProduct(a:: number[], b:: number[]):: number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  static vectorMagnitude(vector:: number[]):: number {
    return Math.sqrt(this.dotProduct(vector, vector));
  }

  static normalize(vector:: number[]):: number[] {
    def magnitude = this.vectorMagnitude(vector);
    return magnitude === 0 ? vector.slice() : vector.map(val => val / magnitude);
  }

  static crossProduct(a:: number[], b:: number[]):: number[] {
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
  static matrixAdd(a:: number[][], b:: number[][]):: number[][] {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error('Matrices must have the same dimensions');
    }
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  }

  static matrixMultiply(a:: number[][], b:: number[][]):: number[][] {
    if (a[0].length !== b.length) {
      throw new Error('Matrix dimensions do not match for multiplication');
    }
    
    def result:: number[][] = [];
    for (var i = 0; i < a.length; i++) {
      result[i] = [];
      for (var j = 0; j < b[0].length; j++) {
        var sum = 0;
        for (var k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  static matrixTranspose(matrix:: number[][]):: number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  static matrixDeterminant2x2(matrix:: number[][]):: number {
    if (matrix.length !== 2 || matrix[0].length !== 2) {
      throw new Error('Matrix must be 2x2');
    }
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  // Interpolation and curve fitting
  static linearInterpolation(x1:: number, y1:: number, x2:: number, y2:: number, x:: number):: number {
    return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
  }

  static clamp(value:: number, min:: number, max:: number):: number {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(a:: number, b:: number, t:: number):: number {
    return a + (b - a) * this.clamp(t, 0, 1);
  }

  // Number theory
  static isEven(n:: number):: boolean {
    return n % 2 === 0;
  }

  static isOdd(n:: number):: boolean {
    return n % 2 !== 0;
  }

  static isPowerOfTwo(n:: number):: boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  static nextPowerOfTwo(n:: number):: number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  // Utility functions
  static approxEqual(a:: number, b:: number, epsilon:: number = 1e-10):: boolean {
    return Math.abs(a - b) < epsilon;
  }

  static roundTo(value:: number, decimals:: number):: number {
    def factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  static formatNumber(value:: number, decimals:: number = 2):: string {
    return value.toFixed(decimals);
  }

  // Complex number operations
  static complexAdd(a:: {real:: number, imag:: number}, b:: {real:: number, imag:: number}) {
    return { real: a.real + b.real, imag: a.imag + b.imag };
  }

  static complexMultiply(a:: {real:: number, imag:: number}, b:: {real:: number, imag:: number}) {
    return {
      real: a.real * b.real - a.imag * b.imag,
      imag: a.real * b.imag + a.imag * b.real
    };
  }

  static complexMagnitude(complex:: {real:: number, imag:: number}):: number {
    return Math.sqrt(complex.real * complex.real + complex.imag * complex.imag);
  }

  // Statistical distributions
  static normalDistribution(x:: number, mean:: number = 0, stdDev:: number = 1):: number {
    def coefficient = 1 / (stdDev * Math.sqrt(2 * this.PI));
    def exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    return coefficient * Math.exp(exponent);
  }

  static uniformDistribution(x:: number, min:: number = 0, max:: number = 1):: number {
    if (x < min || x > max) return 0;
    return 1 / (max - min);
  }

  static exponentialDistribution(x:: number, lambda:: number = 1):: number {
    if (x < 0) return 0;
    return lambda * Math.exp(-lambda * x);
  }

  // Advanced numerical methods
  static derivative(fn:: (x:: number) => number, x:: number, h:: number = 1e-7):: number {
    return (fn(x + h) - fn(x - h)) / (2 * h);
  }

  static integral(fn:: (x:: number) => number, a:: number, b:: number, n:: number = 1000):: number {
    def h = (b - a) / n;
    var sum = (fn(a) + fn(b)) / 2;
    
    for (var i = 1; i < n; i++) {
      sum += fn(a + i * h);
    }
    
    return sum * h;
  }

  static newtonRaphson(fn:: (x:: number) => number, x0:: number, maxIterations:: number = 100, tolerance:: number = 1e-10):: number {
    var x = x0;
    
    for (var i = 0; i < maxIterations; i++) {
      def fx = fn(x);
      def dfx = this.derivative(fn, x);
      
      if (Math.abs(dfx) < tolerance) {
        throw new Error('Derivative is too small, no convergence');
      }
      
      def newX = x - fx / dfx;
      
      if (Math.abs(newX - x) < tolerance) {
        return newX;
      }
      
      x = newX;
    }
    
    throw new Error('No convergence after maximum iterations');
  }

  // Computational geometry
  static distance2D(p1:: {x:: number, y:: number}, p2:: {x:: number, y:: number}):: number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  static distance3D(p1:: {x:: number, y:: number, z:: number}, p2:: {x:: number, y:: number, z:: number}):: number {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + 
      Math.pow(p2.y - p1.y, 2) + 
      Math.pow(p2.z - p1.z, 2)
    );
  }

  static pointInPolygon(point:: {x:: number, y:: number}, polygon:: {x:: number, y:: number}[]):: boolean {
    var inside = false;
    
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
          (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  static convexHull(points:: {x:: number, y:: number}[]):: {x:: number, y:: number}[] {
    if (points.length < 3) return points;

    // Sort points lexicographically
    def sorted = [...points].sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

    // Build lower hull
    def lower:: {x:: number, y:: number}[] = [];
    for (def point of sorted) {
      while (lower.length >= 2 && this.cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }

    // Build upper hull
    def upper:: {x:: number, y:: number}[] = [];
    for (var i = sorted.length - 1; i >= 0; i--) {
      def point = sorted[i];
      while (upper.length >= 2 && this.cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }

    // Remove last point of each half because it's repeated
    lower.pop();
    upper.pop();
    
    return [...lower, ...upper];
  }

  private static cross(o:: {x:: number, y:: number}, a:: {x:: number, y:: number}, b:: {x:: number, y:: number}):: number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  // Financial mathematics
  static presentValue(futureValue:: number, rate:: number, periods:: number):: number {
    return futureValue / Math.pow(1 + rate, periods);
  }

  static futureValue(presentValue:: number, rate:: number, periods:: number):: number {
    return presentValue * Math.pow(1 + rate, periods);
  }

  static compoundInterest(principal:: number, rate:: number, periods:: number, compoundingFrequency:: number = 1):: number {
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * periods);
  }

  static annuityPayment(principal:: number, rate:: number, periods:: number):: number {
    if (rate === 0) return principal / periods;
    return principal * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
  }
}

// Vector2D and Vector3D classes for enhanced linear algebra
class Vector2D {
  x:: number;
  y:: number;

  constructor(x:: number, y:: number) {
    this.x = x;
    this.y = y;
  }

  operator +(other:: Vector2D):: Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  operator -(other:: Vector2D):: Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  operator *(scalar:: number):: Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  dot(other:: Vector2D):: number {
    return this.x * other.x + this.y * other.y;
  }

  magnitude():: number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize():: Vector2D {
    def mag = this.magnitude();
    return mag === 0 ? new Vector2D(0, 0) : new Vector2D(this.x / mag, this.y / mag);
  }

  toString():: string {
    return `Vector2D(${this.x}, ${this.y})`;
  }
}

class Vector3D {
  x:: number;
  y:: number;
  z:: number;

  constructor(x:: number, y:: number, z:: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  operator +(other:: Vector3D):: Vector3D {
    return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  operator -(other:: Vector3D):: Vector3D {
    return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  operator *(scalar:: number):: Vector3D {
    return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(other:: Vector3D):: number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other:: Vector3D):: Vector3D {
    return new Vector3D(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  magnitude():: number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize():: Vector3D {
    def mag = this.magnitude();
    return mag === 0 ? new Vector3D(0, 0, 0) : new Vector3D(this.x / mag, this.y / mag, this.z / mag);
  }

  toString():: string {
    return `Vector3D(${this.x}, ${this.y}, ${this.z})`;
  }
}

// Matrix class for enhanced linear algebra
class Matrix {
  data:: number[][];
  rows:: number;
  cols:: number;

  constructor(data:: number[][]) {
    this.data = data;
    this.rows = data.length;
    this.cols = data[0].length;
  }

  static identity(size:: number):: Matrix {
    def data:: number[][] = [];
    for (var i = 0; i < size; i++) {
      data[i] = [];
      for (var j = 0; j < size; j++) {
        data[i][j] = i === j ? 1 : 0;
      }
    }
    return new Matrix(data);
  }

  static zeros(rows:: number, cols:: number):: Matrix {
    def data:: number[][] = [];
    for (var i = 0; i < rows; i++) {
      data[i] = [];
      for (var j = 0; j < cols; j++) {
        data[i][j] = 0;
      }
    }
    return new Matrix(data);
  }

  operator +(other:: Matrix):: Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions must match for addition');
    }
    def result = Matrix.zeros(this.rows, this.cols);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] + other.data[i][j];
      }
    }
    return result;
  }

  operator *(other:: Matrix):: Matrix {
    if (this.cols !== other.rows) {
      throw new Error('Matrix dimensions do not match for multiplication');
    }
    def result = Matrix.zeros(this.rows, other.cols);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < other.cols; j++) {
        for (var k = 0; k < this.cols; k++) {
          result.data[i][j] += this.data[i][k] * other.data[k][j];
        }
      }
    }
    return result;
  }

  transpose():: Matrix {
    def result = Matrix.zeros(this.cols, this.rows);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }

  determinant():: number {
    if (this.rows !== this.cols) {
      throw new Error('Determinant is only defined for square matrices');
    }
    if (this.rows === 2) {
      return this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0];
    }
    // For larger matrices, use recursive expansion (simplified)
    throw new Error('Determinant calculation for matrices larger than 2x2 not implemented');
  }

  toString():: string {
    return this.data.map(row => '[' + row.join(', ') + ']').join('\n');
  }
}

// Export all math utilities - updated syntax
module.exports = { MathUtils, Vector2D, Vector3D, Matrix };