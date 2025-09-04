import { Runtime } from "../../src/runtime";

describe("Runtime - Operator Overloading", () => {
  const runtime = new Runtime();

  test("executes operator overloading example and logs results", () => {
    console.log = jest.fn();
    runtime.operatorOverloadingExample();
    expect(console.log).toHaveBeenCalledWith(
      "Operator overloading example executed.",
    );
    expect(console.log).toHaveBeenCalledWith("Result of vector addition:", {
      x: 4,
      y: 6,
    });
  });
});

describe("Runtime - Operator Overloading Edge Cases", () => {
  const runtime = new Runtime();

  test("does not throw errors for invalid operator usage", () => {
    console.log = jest.fn();
    expect(() => runtime.operatorOverloadingExample()).not.toThrow();
  });

  test("handles edge cases for vector addition correctly", () => {
    const vector1 = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
    const vector2 = { x: 1, y: 1 };
    const result = runtime.addVectors(vector1, vector2);
    expect(result).toEqual({
      x: Number.MAX_SAFE_INTEGER + 1,
      y: Number.MAX_SAFE_INTEGER + 1,
    });
  });
});
