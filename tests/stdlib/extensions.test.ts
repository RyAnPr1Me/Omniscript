import { WASMCompiler, WASMUtils } from "../../src/stdlib/wasm";
import { Stream } from "../../src/stdlib/reactive";

describe("Standard Library Extensions", () => {
  describe("WebAssembly Support", () => {
    test("should detect WebAssembly support", () => {
      const isSupported = WASMCompiler.isSupported();
      expect(typeof isSupported).toBe("boolean");
    });

    test("should get feature support information", () => {
      const features = WASMCompiler.getFeatureSupport();

      expect(features).toHaveProperty("basicWASM");
      expect(features).toHaveProperty("simd");
      expect(features).toHaveProperty("threads");
      expect(features).toHaveProperty("bulkMemory");
      expect(features).toHaveProperty("referenceTypes");
    });

    test("should analyze function for WASM suitability", () => {
      const functionCode = `
        function computeIntensive(n) {
          let result = 0;
          for (let i = 0; i < n; i++) {
            result += Math.sqrt(i) * Math.sin(i);
          }
          return result;
        }
      `;

      const options = WASMUtils.analyzeForWASM(functionCode);

      expect(options).toHaveProperty("optimizationLevel");
      expect(options).toHaveProperty("enableSIMD");
      expect(options).toHaveProperty("enableThreads");
      expect(options).toHaveProperty("memory");
      expect(options.optimizationLevel).toBeGreaterThanOrEqual(0);
      expect(options.optimizationLevel).toBeLessThanOrEqual(3);
    });

    test("should create WASM compiler with options", () => {
      const compiler = new WASMCompiler({
        optimizationLevel: 2,
        enableSIMD: true,
        enableThreads: false,
        memory: { initial: 1, maximum: 10 },
      });

      const stats = compiler.getStats();
      expect(stats.compiledModules).toBe(0);
      expect(stats.moduleNames).toEqual([]);
      expect(stats.options.optimizationLevel).toBe(2);
    });

    test("should clear cache", () => {
      const compiler = new WASMCompiler();
      compiler.clearCache();

      const stats = compiler.getStats();
      expect(stats.compiledModules).toBe(0);
    });
  });

  describe("Advanced Stream Processing", () => {
    test("should buffer values by count", (done) => {
      const stream = new Stream<number>();
      const buffered = stream.buffer(3);

      const results: number[][] = [];
      buffered.subscribe((buffer) => {
        results.push(buffer);
      });

      stream.next(1);
      stream.next(2);
      stream.next(3); // Should emit [1, 2, 3]
      stream.next(4);
      stream.next(5);
      stream.next(6); // Should emit [4, 5, 6]

      setTimeout(() => {
        expect(results).toHaveLength(2);
        expect(results[0]).toEqual([1, 2, 3]);
        expect(results[1]).toEqual([4, 5, 6]);
        done();
      }, 10);
    });

    test("should group values by key", (done) => {
      const stream = new Stream<{ category: string; value: number }>();
      const grouped = stream.groupBy((item) => item.category);

      const groups: Array<{ key: string; values: any[] }> = [];

      grouped.subscribe(({ key, values }) => {
        const collectedValues: any[] = [];
        values.subscribe((value) => collectedValues.push(value));
        groups.push({ key, values: collectedValues });
      });

      stream.next({ category: "A", value: 1 });
      stream.next({ category: "B", value: 2 });
      stream.next({ category: "A", value: 3 });
      stream.next({ category: "C", value: 4 });

      setTimeout(() => {
        expect(groups).toHaveLength(3);
        expect(groups.find((g) => g.key === "A")?.values).toHaveLength(2);
        expect(groups.find((g) => g.key === "B")?.values).toHaveLength(1);
        expect(groups.find((g) => g.key === "C")?.values).toHaveLength(1);
        done();
      }, 10);
    });

    test("should partition values based on predicate", (done) => {
      const stream = new Stream<number>();
      const [evens, odds] = stream.partition((x) => x % 2 === 0);

      const evenResults: number[] = [];
      const oddResults: number[] = [];

      evens.subscribe((value) => evenResults.push(value));
      odds.subscribe((value) => oddResults.push(value));

      stream.next(1);
      stream.next(2);
      stream.next(3);
      stream.next(4);
      stream.next(5);

      setTimeout(() => {
        expect(evenResults).toEqual([2, 4]);
        expect(oddResults).toEqual([1, 3, 5]);
        done();
      }, 10);
    });

    test("should reduce values to accumulator", (done) => {
      const stream = new Stream<number>();
      const reduced = stream.reduce((acc, value) => acc + value, 0);

      let result: number | undefined;
      reduced.subscribe((value) => {
        result = value;
      });

      stream.next(1);
      stream.next(2);
      stream.next(3);
      stream.complete();

      setTimeout(() => {
        expect(result).toBe(6);
        done();
      }, 10);
    });

    test("should skip values until condition is met", (done) => {
      const stream = new Stream<number>();
      const skipped = stream.skipWhile((x) => x < 5);

      const results: number[] = [];
      skipped.subscribe((value) => results.push(value));

      stream.next(1);
      stream.next(2);
      stream.next(3);
      stream.next(6); // First value >= 5
      stream.next(4); // Should be included even though < 5
      stream.next(7);

      setTimeout(() => {
        expect(results).toEqual([6, 4, 7]);
        done();
      }, 10);
    });

    test("should take values while condition is true", (done) => {
      const stream = new Stream<number>();
      const taken = stream.takeWhile((x) => x < 5);

      const results: number[] = [];
      let completed = false;

      taken.subscribe(
        (value) => results.push(value),
        undefined,
        () => {
          completed = true;
        },
      );

      stream.next(1);
      stream.next(2);
      stream.next(3);
      stream.next(6); // Should complete the stream
      stream.next(1); // Should not be emitted

      setTimeout(() => {
        expect(results).toEqual([1, 2, 3]);
        expect(completed).toBe(true);
        done();
      }, 10);
    });

    test("should create pairwise emissions", (done) => {
      const stream = new Stream<number>();
      const paired = stream.pairwise();

      const results: [number, number][] = [];
      paired.subscribe((pair) => results.push(pair));

      stream.next(1);
      stream.next(2);
      stream.next(3);
      stream.next(4);

      setTimeout(() => {
        expect(results).toEqual([
          [1, 2],
          [2, 3],
          [3, 4],
        ]);
        done();
      }, 10);
    });

    test("should start with initial values", (done) => {
      const stream = new Stream<number>();
      const started = stream.startWith(0, -1);

      const results: number[] = [];
      started.subscribe((value) => results.push(value));

      // Give time for startWith to emit initial values
      setTimeout(() => {
        stream.next(1);
        stream.next(2);

        setTimeout(() => {
          expect(results).toEqual([0, -1, 1, 2]);
          done();
        }, 20);
      }, 10);
    });

    test("should provide default value if empty", (done) => {
      const stream = new Stream<number>();
      const defaulted = stream.defaultIfEmpty(42);

      let result: number | undefined;
      defaulted.subscribe((value) => {
        result = value;
      });

      stream.complete(); // Complete without emitting values

      setTimeout(() => {
        expect(result).toBe(42);
        done();
      }, 10);
    });

    test("should delay emissions", (done) => {
      const stream = new Stream<number>();
      const delayed = stream.delay(50);

      const results: number[] = [];
      const startTime = Date.now();

      delayed.subscribe((value) => {
        results.push(value);
        if (results.length === 2) {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some timing variance
          expect(results).toEqual([1, 2]);
          done();
        }
      });

      stream.next(1);
      stream.next(2);
    });
  });
});
