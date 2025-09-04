import { SIMDProcessor } from "../../src/runtime/simd";

describe("Advanced SIMD Operations", () => {
  let simd: SIMDProcessor;

  beforeEach(() => {
    simd = new SIMDProcessor(true); // Enable parallel execution
  });

  test("fused multiply-add (FMA) operation", () => {
    const a = [1, 2, 3, 4];
    const b = [2, 3, 4, 5];
    const c = [1, 1, 1, 1];
    const result = simd.fma(a, b, c);
    expect(result).toEqual([3, 7, 13, 21]); // a*b + c = [1*2+1, 2*3+1, 3*4+1, 4*5+1]
  });

  test("statistical operations", () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(simd.mean(data)).toBe(5.5);
    expect(simd.variance(data)).toBeCloseTo(8.25, 5);
    expect(simd.standardDeviation(data)).toBeCloseTo(2.8722813232690143, 5);
  });

  test("covariance and correlation", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];

    const covariance = simd.covariance(x, y);
    const correlation = simd.correlation(x, y);

    expect(covariance).toBeCloseTo(4, 5);
    expect(correlation).toBeCloseTo(1, 5); // Perfect positive correlation
  });

  test("convolution operation", () => {
    const signal = [1, 2, 3, 4, 5];
    const kernel = [1, 0, -1];
    const result = simd.convolve(signal, kernel);

    expect(result).toEqual([-2, -2, -2]); // Convolution result
  });

  test("cross-correlation operation", () => {
    const a = [1, 2, 3];
    const b = [3, 2, 1];
    const result = simd.crossCorrelation(a, b);

    expect(result.length).toBeGreaterThan(0);
    expect(result).toEqual(expect.arrayContaining([expect.any(Number)]));
  });

  test("reduce operations", () => {
    const data = [1, 5, 3, 9, 2];

    expect(simd.reduce(data, "sum")).toBe(20);
    expect(simd.reduce(data, "min")).toBe(1);
    expect(simd.reduce(data, "max")).toBe(9);
    expect(simd.reduce(data, "mean")).toBe(4);
  });

  test("transform operation with custom function", () => {
    const data = [1, 2, 3, 4, 5];
    const result = simd.transform(data, (x) => x * x);

    expect(result).toEqual([1, 4, 9, 16, 25]);
  });
});
