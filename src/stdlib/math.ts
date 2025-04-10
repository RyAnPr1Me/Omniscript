export class MathUtils {
  static readonly PI: number = 3.141592653589793;
  static readonly E: number = 2.718281828459045;

  static sum(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
  }

  static mean(numbers: number[]): number {
    return this.sum(numbers) / numbers.length;
  }

  static std(numbers: number[]): number {
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map(n => (n - avg) ** 2);
    return Math.sqrt(this.mean(squareDiffs));
  }

  static random(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min;
  }

  static factorial(n: number): number {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers");
    return n === 0 ? 1 : n * this.factorial(n - 1);
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
