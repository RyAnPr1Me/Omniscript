import { MathUtils } from "../../src/stdlib/math";

describe("Math Utilities", () => {
  describe("Basic Functions", () => {
    test("factorial computes the correct value", () => {
      expect(MathUtils.factorial(5)).toBe(120);
      expect(MathUtils.factorial(0)).toBe(1);
      expect(MathUtils.factorial(1)).toBe(1);
      expect(MathUtils.factorial(10)).toBe(3628800);
    });

    test("gcd computes the greatest common divisor", () => {
      expect(MathUtils.gcd(48, 18)).toBe(6);
      expect(MathUtils.gcd(7, 13)).toBe(1);
      expect(MathUtils.gcd(-48, 18)).toBe(6);
    });

    test("should calculate mean correctly", () => {
      expect(MathUtils.mean([1, 2, 3, 4, 5])).toBe(3);
      expect(MathUtils.mean([10, 20, 30])).toBe(20);
    });

    test("should calculate median correctly", () => {
      expect(MathUtils.median([1, 2, 3, 4, 5])).toBe(3);
      expect(MathUtils.median([1, 2, 3, 4])).toBe(2.5);
      expect(MathUtils.median([5, 1, 3, 2, 4])).toBe(3);
    });
  });

  describe("Advanced Statistics", () => {
    test("should calculate variance and standard deviation", () => {
      const numbers = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(MathUtils.variance(numbers)).toBeCloseTo(4);
      expect(MathUtils.std(numbers)).toBeCloseTo(2);
    });

    test("should calculate range correctly", () => {
      expect(MathUtils.range([1, 5, 3, 9, 2])).toBe(8);
      expect(MathUtils.range([10])).toBe(0);
    });

    test("should calculate mode correctly", () => {
      expect(MathUtils.mode([1, 2, 2, 3, 4])).toBe(2);
      expect(MathUtils.mode([1, 1, 2, 2, 3])).toEqual([1, 2]);
    });
  });

  describe("Number Theory", () => {
    test("should check prime numbers", () => {
      expect(MathUtils.isPrime(2)).toBe(true);
      expect(MathUtils.isPrime(17)).toBe(true);
      expect(MathUtils.isPrime(4)).toBe(false);
      expect(MathUtils.isPrime(1)).toBe(false);
    });

    test("should generate prime numbers", () => {
      const first5Primes = MathUtils.primes(5);
      expect(first5Primes).toEqual([2, 3, 5, 7, 11]);
    });

    test("should calculate fibonacci numbers", () => {
      expect(MathUtils.fibonacci(0)).toBe(0);
      expect(MathUtils.fibonacci(1)).toBe(1);
      expect(MathUtils.fibonacci(10)).toBe(55);
    });

    test("should generate fibonacci sequence", () => {
      expect(MathUtils.fibonacciSequence(8)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
    });

    test("should calculate LCM", () => {
      expect(MathUtils.lcm(12, 8)).toBe(24);
      expect(MathUtils.lcm(5, 7)).toBe(35);
    });
  });

  describe("Linear Algebra", () => {
    test("should calculate dot product", () => {
      expect(MathUtils.dotProduct([1, 2, 3], [4, 5, 6])).toBe(32);
      expect(() => MathUtils.dotProduct([1, 2], [1, 2, 3])).toThrow();
    });

    test("should calculate vector magnitude", () => {
      expect(MathUtils.vectorMagnitude([3, 4])).toBe(5);
      expect(MathUtils.vectorMagnitude([0, 0, 0])).toBe(0);
    });

    test("should normalize vectors", () => {
      const normalized = MathUtils.normalize([3, 4]);
      expect(normalized[0]).toBeCloseTo(0.6);
      expect(normalized[1]).toBeCloseTo(0.8);
      expect(MathUtils.vectorMagnitude(normalized)).toBeCloseTo(1);
    });

    test("should calculate cross product", () => {
      const result = MathUtils.crossProduct([1, 0, 0], [0, 1, 0]);
      expect(result).toEqual([0, 0, 1]);
      expect(() => MathUtils.crossProduct([1, 2], [3, 4])).toThrow();
    });
  });

  describe("Matrix Operations", () => {
    test("should add matrices", () => {
      const a = [
        [1, 2],
        [3, 4],
      ];
      const b = [
        [5, 6],
        [7, 8],
      ];
      const result = MathUtils.matrixAdd(a, b);
      expect(result).toEqual([
        [6, 8],
        [10, 12],
      ]);
    });

    test("should multiply matrices", () => {
      const a = [
        [1, 2],
        [3, 4],
      ];
      const b = [
        [5, 6],
        [7, 8],
      ];
      const result = MathUtils.matrixMultiply(a, b);
      expect(result).toEqual([
        [19, 22],
        [43, 50],
      ]);
    });

    test("should transpose matrices", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const transposed = MathUtils.matrixTranspose(matrix);
      expect(transposed).toEqual([
        [1, 4],
        [2, 5],
        [3, 6],
      ]);
    });

    test("should calculate 2x2 determinant", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      expect(MathUtils.matrixDeterminant2x2(matrix)).toBe(-2);
    });
  });

  describe("Random Number Generation", () => {
    test("should generate random integers in range", () => {
      for (let i = 0; i < 50; i++) {
        const rand = MathUtils.randomInt(1, 10);
        expect(rand).toBeGreaterThanOrEqual(1);
        expect(rand).toBeLessThanOrEqual(10);
        expect(Number.isInteger(rand)).toBe(true);
      }
    });

    test("should randomly choose from array", () => {
      const arr = ["a", "b", "c", "d", "e"];
      for (let i = 0; i < 20; i++) {
        const choice = MathUtils.randomChoice(arr);
        expect(arr).toContain(choice);
      }
    });

    test("should shuffle array without modifying original", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = MathUtils.shuffle(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
      expect(original).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });
  });

  describe("Statistical Distributions", () => {
    test("should calculate normal distribution", () => {
      // Test standard normal distribution at mean
      expect(MathUtils.normalDistribution(0, 0, 1)).toBeCloseTo(0.3989, 3);

      // Test with different parameters
      expect(MathUtils.normalDistribution(5, 5, 2)).toBeCloseTo(0.1995, 3);
    });

    test("should calculate uniform distribution", () => {
      expect(MathUtils.uniformDistribution(0.5, 0, 1)).toBe(1);
      expect(MathUtils.uniformDistribution(-1, 0, 1)).toBe(0);
      expect(MathUtils.uniformDistribution(2, 0, 1)).toBe(0);
    });

    test("should calculate exponential distribution", () => {
      expect(MathUtils.exponentialDistribution(0, 1)).toBe(1);
      expect(MathUtils.exponentialDistribution(-1, 1)).toBe(0);
      expect(MathUtils.exponentialDistribution(1, 1)).toBeCloseTo(0.3679, 3);
    });
  });

  describe("Numerical Methods", () => {
    test("should calculate derivatives", () => {
      const f = (x: number) => x * x; // f(x) = x^2, f'(x) = 2x
      const derivative = MathUtils.derivative(f, 3);
      expect(derivative).toBeCloseTo(6, 2); // f'(3) = 6
    });

    test("should calculate integrals", () => {
      const f = (x: number) => x; // f(x) = x, integral from 0 to 2 = 2
      const integral = MathUtils.integral(f, 0, 2);
      expect(integral).toBeCloseTo(2, 1);
    });

    test("should find roots using Newton-Raphson", () => {
      const f = (x: number) => x * x - 4; // x^2 - 4 = 0, roots at ±2
      const root = MathUtils.newtonRaphson(f, 1.5);
      expect(root).toBeCloseTo(2, 3);
    });
  });

  describe("Computational Geometry", () => {
    test("should calculate 2D distance", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(MathUtils.distance2D(p1, p2)).toBe(5);
    });

    test("should calculate 3D distance", () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 1, z: 1 };
      expect(MathUtils.distance3D(p1, p2)).toBeCloseTo(1.732, 3);
    });

    test("should determine point in polygon", () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];

      expect(MathUtils.pointInPolygon({ x: 1, y: 1 }, triangle)).toBe(true);
      expect(MathUtils.pointInPolygon({ x: 3, y: 3 }, triangle)).toBe(false);
    });

    test("should compute convex hull", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
        { x: 1, y: 0.5 }, // Interior point
        { x: 0, y: 2 },
      ];

      const hull = MathUtils.convexHull(points);
      expect(hull).toHaveLength(3); // Triangle hull
    });
  });

  describe("Financial Mathematics", () => {
    test("should calculate present value", () => {
      const pv = MathUtils.presentValue(1000, 0.05, 1);
      expect(pv).toBeCloseTo(952.38, 2);
    });

    test("should calculate future value", () => {
      const fv = MathUtils.futureValue(1000, 0.05, 1);
      expect(fv).toBe(1050);
    });

    test("should calculate compound interest", () => {
      const ci = MathUtils.compoundInterest(1000, 0.05, 1, 12); // Monthly compounding
      expect(ci).toBeCloseTo(1051.16, 2);
    });

    test("should calculate annuity payment", () => {
      const payment = MathUtils.annuityPayment(100000, 0.05, 30);
      expect(payment).toBeCloseTo(6505.14, 2);
    });
  });

  describe("Utility Functions", () => {
    test("should clamp values correctly", () => {
      expect(MathUtils.clamp(5, 0, 10)).toBe(5);
      expect(MathUtils.clamp(-5, 0, 10)).toBe(0);
      expect(MathUtils.clamp(15, 0, 10)).toBe(10);
    });

    test("should check number properties", () => {
      expect(MathUtils.isEven(4)).toBe(true);
      expect(MathUtils.isOdd(3)).toBe(true);
      expect(MathUtils.isPowerOfTwo(8)).toBe(true);
      expect(MathUtils.isPowerOfTwo(7)).toBe(false);
      expect(MathUtils.nextPowerOfTwo(7)).toBe(8);
    });

    test("should handle approximate equality", () => {
      expect(MathUtils.approxEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(MathUtils.approxEqual(1, 2)).toBe(false);
    });

    test("should round to decimals", () => {
      expect(MathUtils.roundTo(3.14159, 2)).toBe(3.14);
      expect(MathUtils.formatNumber(3.14159, 3)).toBe("3.142");
    });
  });

  describe("Complex Numbers", () => {
    test("should add complex numbers", () => {
      const a = { real: 1, imag: 2 };
      const b = { real: 3, imag: 4 };
      const result = MathUtils.complexAdd(a, b);
      expect(result).toEqual({ real: 4, imag: 6 });
    });

    test("should multiply complex numbers", () => {
      const a = { real: 1, imag: 2 };
      const b = { real: 3, imag: 4 };
      const result = MathUtils.complexMultiply(a, b);
      expect(result).toEqual({ real: -5, imag: 10 });
    });

    test("should calculate complex magnitude", () => {
      const complex = { real: 3, imag: 4 };
      expect(MathUtils.complexMagnitude(complex)).toBe(5);
    });
  });
});
