import { Runtime } from '../../src/runtime';

describe('Runtime - Operator Overloading', () => {
  const runtime = new Runtime();

  test('demonstrates operator overloading', () => {
    console.log = jest.fn();
    runtime.operatorOverloadingExample();
    expect(console.log).toHaveBeenCalledWith("Operator overloading example executed.");
    expect(console.log).toHaveBeenCalledWith("Result of vector addition:", { x: 4, y: 6 });
  });
});

describe('Runtime - Operator Overloading Edge Cases', () => {
  const runtime = new Runtime();

  test('handles invalid operator usage gracefully', () => {
    console.log = jest.fn();
    expect(() => runtime.operatorOverloadingExample()).not.toThrow();
  });

  test('ensures operator overloading works with edge cases', () => {
    const vector1 = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
    const vector2 = { x: 1, y: 1 };
    const result = runtime.addVectors(vector1, vector2);
    expect(result).toEqual({ x: Number.MAX_SAFE_INTEGER + 1, y: Number.MAX_SAFE_INTEGER + 1 });
  });
});