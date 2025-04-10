import { MathUtils } from '../../src/stdlib/math';

describe('Math Utilities', () => {
  test('factorial computes the correct value', () => {
    expect(MathUtils.factorial(5)).toBe(120);
    expect(MathUtils.factorial(0)).toBe(1);
  });

  test('gcd computes the greatest common divisor', () => {
    expect(MathUtils.gcd(48, 18)).toBe(6);
    expect(MathUtils.gcd(7, 13)).toBe(1);
  });
});