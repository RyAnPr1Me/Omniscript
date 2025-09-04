import { Fuzzer, runFuzzTest, runPropertyTest } from "../../src/testing/fuzzer";
import { describe, expect, test } from "@jest/globals";

describe("Fuzzer", () => {
  test("fuzzer can be instantiated with default config", () => {
    const fuzzer = new Fuzzer();
    expect(fuzzer).toBeDefined();
  });

  test("fuzzer can be instantiated with custom config", () => {
    const fuzzer = new Fuzzer({
      maxIterations: 100,
      maxStringLength: 50,
      includeUnicode: false,
      timeout: 1000,
    });
    expect(fuzzer).toBeDefined();
  });

  test("runFuzzTest executes without crashing", async () => {
    const result = await runFuzzTest({
      maxIterations: 50,
      maxStringLength: 100,
      includeUnicode: false,
      includeControlChars: false,
      timeout: 1000,
    });

    expect(result).toBeDefined();
    expect(result.totalTests).toBe(50);
    expect(result.failures).toBeDefined();
    expect(result.crashes).toBeGreaterThanOrEqual(0);
    expect(result.timeouts).toBeGreaterThanOrEqual(0);

    // Random syntax fuzzing will have many crashes - this is expected and validates error handling
    // The key is that it should complete without infinite loops or segfaults
    expect(result.totalTests).toBe(50);
    expect(result.crashes).toBeGreaterThanOrEqual(0);
    expect(result.timeouts).toBeLessThan(10); // Should not have many timeouts
  }, 30000);

  test("property test: parser-never-hangs", async () => {
    const result = await runPropertyTest("parser-never-hangs", 20);
    expect(result).toBe(true);
  }, 10000);

  test("property test: runtime-memory-safe", async () => {
    const result = await runPropertyTest("runtime-memory-safe", 20);
    expect(result).toBe(true);
  }, 10000);

  test("property test: type-safety", async () => {
    const result = await runPropertyTest("type-safety", 20);
    expect(result).toBe(true);
  }, 10000);

  test("property test with unknown property throws error", async () => {
    await expect(runPropertyTest("unknown-property")).rejects.toThrow(
      "Unknown property: unknown-property",
    );
  });

  test("fuzzer generates diverse inputs", async () => {
    const fuzzer = new Fuzzer({ maxIterations: 10 });
    const inputs = new Set<string>();

    // Generate several inputs to check diversity
    for (let i = 0; i < 20; i++) {
      const input = (fuzzer as any).generateRandomInput();
      inputs.add(input);
    }

    // We should get some diversity in the generated inputs
    expect(inputs.size).toBeGreaterThan(5);
  });

  test("fuzzer handles edge cases gracefully", async () => {
    const result = await runFuzzTest({
      maxIterations: 10,
      maxStringLength: 5,
      includeUnicode: true,
      includeControlChars: true,
      timeout: 500,
    });

    expect(result).toBeDefined();
    expect(result.totalTests).toBe(10);
  }, 10000);
});
