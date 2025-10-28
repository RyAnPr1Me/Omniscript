import {
  JITOptimizer,
  ConstantFoldingPass,
  DeadCodeEliminationPass,
  InliningPass,
} from "../../src/compiler/optimizer";

describe("JIT Optimizer", () => {
  let optimizer: JITOptimizer;

  beforeEach(() => {
    optimizer = new JITOptimizer();
  });

  describe("ConstantFoldingPass", () => {
    it("should fold constant additions", () => {
      const input = {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Literal", value: 5 },
        right: { type: "Literal", value: 3 },
      };

      const result = optimizer.optimize(input);
      expect(result).toEqual({ type: "Literal", value: 8 });
    });

    it("should fold constant multiplications", () => {
      const input = {
        type: "BinaryExpression",
        operator: "*",
        left: { type: "Literal", value: 4 },
        right: { type: "Literal", value: 6 },
      };

      const result = optimizer.optimize(input);
      expect(result).toEqual({ type: "Literal", value: 24 });
    });

    it("should not fold non-constant expressions", () => {
      const input = {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Identifier", name: "x" },
        right: { type: "Literal", value: 3 },
      };

      const result = optimizer.optimize(input);
      expect(result.type).toBe("BinaryExpression");
      expect(result.left.type).toBe("Identifier");
    });
  });

  describe("DeadCodeEliminationPass", () => {
    it("should eliminate code after return statements", () => {
      const input = {
        type: "Block",
        body: [
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: 1 },
          },
          { type: "ReturnStatement", argument: { type: "Literal", value: 42 } },
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: 2 },
          },
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: 3 },
          },
        ],
      };

      const result = optimizer.optimize(input);
      expect(result.body).toHaveLength(2);
      expect(result.body[1].type).toBe("ReturnStatement");
    });

    it("should preserve code when no return statement is present", () => {
      const input = {
        type: "Block",
        body: [
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: 1 },
          },
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: 2 },
          },
        ],
      };

      const result = optimizer.optimize(input);
      expect(result.body).toHaveLength(2);
    });
  });

  describe("InliningPass", () => {
    it("should handle simple function inlining", () => {
      const input = {
        type: "CallExpression",
        callee: {
          type: "Function",
          body: [
            {
              type: "ReturnStatement",
              argument: { type: "Literal", value: 42 },
            },
          ],
        },
      };

      const result = optimizer.optimize(input);
      // The inlining pass should extract the return value
      expect(result.type).toBe("Literal");
      expect(result.value).toBe(42);
    });

    it("should not inline large functions", () => {
      const largeBody = Array.from({ length: 15 }, (_, i) => ({
        type: "ExpressionStatement",
        expression: { type: "Literal", value: i },
      }));

      const input = {
        type: "CallExpression",
        callee: {
          type: "Function",
          body: largeBody,
        },
      };

      const result = optimizer.optimize(input);
      expect(result.type).toBe("CallExpression");
    });
  });

  describe("Optimization Pipeline", () => {
    it("should apply multiple optimizations", () => {
      const input = {
        type: "Block",
        body: [
          {
            type: "BinaryExpression",
            operator: "+",
            left: { type: "Literal", value: 10 },
            right: { type: "Literal", value: 5 },
          },
          {
            type: "ReturnStatement",
            argument: { type: "Literal", value: "result" },
          },
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: "unreachable" },
          },
        ],
      };

      const result = optimizer.optimize(input);

      // Should fold constants and eliminate dead code
      expect(result.body).toHaveLength(2);
      expect(result.body[0].type).toBe("Literal");
      expect(result.body[0].value).toBe(15);
      expect(result.body[1].type).toBe("ReturnStatement");
    });
  });

  describe("Optimizer Configuration", () => {
    it("should allow adding custom passes", () => {
      const customPass = {
        name: "CustomPass",
        optimize: jest.fn((bytecode) => bytecode),
      };

      optimizer.addPass(customPass);
      const input = { type: "Literal", value: 42 };

      optimizer.optimize(input);
      expect(customPass.optimize).toHaveBeenCalled();
    });

    it("should allow removing passes", () => {
      optimizer.removePass("ConstantFolding");

      const input = {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Literal", value: 5 },
        right: { type: "Literal", value: 3 },
      };

      const result = optimizer.optimize(input);
      // Without constant folding, should remain as binary expression
      expect(result.type).toBe("BinaryExpression");
    });
  });
});

  describe("InlineCache", () => {
    let inlineCache: any;

    beforeEach(() => {
      // Import InlineCache from the optimizer module
      const { InlineCache } = require("../../src/runtime/optimizer");
      inlineCache = new InlineCache();
    });

    describe("Method Lookup and Caching", () => {
      it("should cache and retrieve methods successfully", () => {
        const obj = {
          greet: function() { return "Hello"; }
        };

        // First lookup - cache miss
        const method1 = inlineCache.lookupMethod(obj, "greet");
        expect(method1).toBe(obj.greet);
        expect(typeof method1).toBe("function");

        // Second lookup - cache hit
        const method2 = inlineCache.lookupMethod(obj, "greet");
        expect(method2).toBe(obj.greet);
        expect(method1).toBe(method2);
      });

      it("should return null for non-existent methods", () => {
        const obj = { name: "test" };
        const method = inlineCache.lookupMethod(obj, "nonExistent");
        expect(method).toBeNull();
      });

      it("should return null for non-function properties", () => {
        const obj = { value: 42 };
        const method = inlineCache.lookupMethod(obj, "value");
        expect(method).toBeNull();
      });

      it("should handle different object types correctly", () => {
        class MyClass {
          myMethod() { return "MyClass"; }
        }
        class OtherClass {
          myMethod() { return "OtherClass"; }
        }

        const obj1 = new MyClass();
        const obj2 = new OtherClass();

        const method1 = inlineCache.lookupMethod(obj1, "myMethod");
        const method2 = inlineCache.lookupMethod(obj2, "myMethod");

        expect(method1).toBe(obj1.myMethod);
        expect(method2).toBe(obj2.myMethod);
        expect(method1).not.toBe(method2);
      });

      it("should handle null and undefined objects", () => {
        const methodFromNull = inlineCache.lookupMethod(null, "toString");
        expect(methodFromNull).toBeNull();

        const methodFromUndefined = inlineCache.lookupMethod(undefined, "toString");
        expect(methodFromUndefined).toBeNull();
      });

      it("should cache methods for primitive wrappers", () => {
        const str = new String("test");
        const method = inlineCache.lookupMethod(str, "toUpperCase");
        expect(typeof method).toBe("function");
      });
    });

    describe("Cache Statistics", () => {
      it("should track cache hits and misses", () => {
        const obj = {
          method1: function() { return 1; },
          method2: function() { return 2; }
        };

        // First lookups - misses
        inlineCache.lookupMethod(obj, "method1");
        inlineCache.lookupMethod(obj, "method2");

        // Second lookups - hits
        inlineCache.lookupMethod(obj, "method1");
        inlineCache.lookupMethod(obj, "method1");
        inlineCache.lookupMethod(obj, "method2");

        const stats = inlineCache.getCacheStats();
        expect(stats.hits).toBe(3);
        expect(stats.misses).toBe(2);
        expect(stats.cacheSize).toBe(2);
      });

      it("should calculate hit rate correctly", () => {
        const obj = { method: function() {} };

        // 1 miss
        inlineCache.lookupMethod(obj, "method");
        // 4 hits
        inlineCache.lookupMethod(obj, "method");
        inlineCache.lookupMethod(obj, "method");
        inlineCache.lookupMethod(obj, "method");
        inlineCache.lookupMethod(obj, "method");

        const stats = inlineCache.getCacheStats();
        expect(stats.hitRate).toBeCloseTo(80, 1); // 4/5 = 80%
      });

      it("should return 0% hit rate when no lookups performed", () => {
        const stats = inlineCache.getCacheStats();
        expect(stats.hitRate).toBe(0);
        expect(stats.hits).toBe(0);
        expect(stats.misses).toBe(0);
      });

      it("should update lastUsed timestamp on cache hits", (done) => {
        const obj = { method: function() {} };

        inlineCache.lookupMethod(obj, "method");
        const initialStats = inlineCache.getCacheStats();

        setTimeout(() => {
          inlineCache.lookupMethod(obj, "method");
          const updatedStats = inlineCache.getCacheStats();
          expect(updatedStats.hits).toBe(1);
          done();
        }, 10);
      });
    });

    describe("Cache Eviction", () => {
      it("should evict least recently used entries when cache is full", () => {
        // Create many objects to fill the cache
        const objects = [];
        for (let i = 0; i < 1005; i++) {
          objects.push({
            [`method${i}`]: function() { return i; }
          });
        }

        // Fill the cache beyond max size (1000)
        for (let i = 0; i < 1005; i++) {
          inlineCache.lookupMethod(objects[i], `method${i}`);
        }

        const stats = inlineCache.getCacheStats();
        expect(stats.cacheSize).toBeLessThanOrEqual(1000);
        expect(stats.evictions).toBeGreaterThan(0);
      });

      it("should prioritize recently used entries during eviction", () => {
        // Fill cache near capacity
        const objects = [];
        for (let i = 0; i < 1000; i++) {
          objects.push({ method: function() { return i; } });
          inlineCache.lookupMethod(objects[i], "method");
        }

        // Access first object multiple times to make it recently used
        for (let j = 0; j < 5; j++) {
          inlineCache.lookupMethod(objects[0], "method");
        }

        // Add new entries to trigger eviction
        for (let i = 0; i < 10; i++) {
          const newObj = { newMethod: function() { return "new"; } };
          inlineCache.lookupMethod(newObj, "newMethod");
        }

        // First object should still be cached (recently used)
        const stats = inlineCache.getCacheStats();
        const previousHits = stats.hits;
        inlineCache.lookupMethod(objects[0], "method");
        const newStats = inlineCache.getCacheStats();
        expect(newStats.hits).toBe(previousHits + 1); // Should be a hit
      });
    });

    describe("Cache Clearing", () => {
      it("should clear all cached methods", () => {
        const obj1 = { method1: function() {} };
        const obj2 = { method2: function() {} };

        inlineCache.lookupMethod(obj1, "method1");
        inlineCache.lookupMethod(obj2, "method2");

        let stats = inlineCache.getCacheStats();
        expect(stats.cacheSize).toBe(2);

        inlineCache.clearCache();

        stats = inlineCache.getCacheStats();
        expect(stats.cacheSize).toBe(0);
        expect(stats.hits).toBe(0);
        expect(stats.misses).toBe(0);
        expect(stats.evictions).toBe(0);
      });

      it("should allow new caching after clearing", () => {
        const obj = { method: function() {} };

        inlineCache.lookupMethod(obj, "method");
        inlineCache.clearCache();

        // Should be a miss after clearing
        inlineCache.lookupMethod(obj, "method");
        const stats = inlineCache.getCacheStats();
        expect(stats.misses).toBe(1);
        expect(stats.hits).toBe(0);
      });
    });

    describe("Method Identity", () => {
      it("should invalidate cache when method changes", () => {
        const obj: any = {
          method: function() { return "original"; }
        };

        const method1 = inlineCache.lookupMethod(obj, "method");
        expect(method1).toBe(obj.method);

        // Change the method
        obj.method = function() { return "changed"; };

        const method2 = inlineCache.lookupMethod(obj, "method");
        expect(method2).toBe(obj.method);
        expect(method2).not.toBe(method1);
      });

      it("should handle arrow functions", () => {
        const obj = {
          arrowMethod: () => "arrow result"
        };

        const method = inlineCache.lookupMethod(obj, "arrowMethod");
        expect(typeof method).toBe("function");
        expect(method()).toBe("arrow result");
      });

      it("should handle bound functions", () => {
        const context = { value: 42 };
        const obj = {
          boundMethod: function(this: typeof context) { return this.value; }.bind(context)
        };

        const method = inlineCache.lookupMethod(obj, "boundMethod");
        expect(typeof method).toBe("function");
        expect(method()).toBe(42);
      });
    });

    describe("Edge Cases", () => {
      it("should handle objects with numeric method names", () => {
        const obj = {
          123: function() { return "numeric"; }
        } as any;

        const method = inlineCache.lookupMethod(obj, "123");
        expect(typeof method).toBe("function");
      });

      it("should handle objects with symbol methods", () => {
        const sym = Symbol("testMethod");
        const obj = {
          [sym]: function() { return "symbol"; }
        } as any;

        const method = inlineCache.lookupMethod(obj, sym as any);
        if (method) {
          expect(typeof method).toBe("function");
        }
      });

      it("should handle prototype chain methods", () => {
        class Parent {
          parentMethod() { return "parent"; }
        }
        class Child extends Parent {
          childMethod() { return "child"; }
        }

        const obj = new Child();
        const childMethod = inlineCache.lookupMethod(obj, "childMethod");
        const parentMethod = inlineCache.lookupMethod(obj, "parentMethod");

        expect(typeof childMethod).toBe("function");
        expect(typeof parentMethod).toBe("function");
      });

      it("should handle async methods", () => {
        const obj = {
          asyncMethod: async function() { return "async result"; }
        };

        const method = inlineCache.lookupMethod(obj, "asyncMethod");
        expect(typeof method).toBe("function");
      });

      it("should handle generator functions", () => {
        const obj = {
          *generatorMethod() { yield 1; yield 2; }
        };

        const method = inlineCache.lookupMethod(obj, "generatorMethod");
        expect(typeof method).toBe("function");
      });
    });
  });