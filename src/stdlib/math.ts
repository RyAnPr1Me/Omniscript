export class Math {
  static readonly PI = Math.PI;
  static readonly E = Math.E;

  static sum(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
  }

  static mean(numbers: number[]): number {
    return this.sum(numbers) / numbers.length;
  }

  static std(numbers: number[]): number {
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }

  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
