import { Runtime } from '../../src/runtime';
import { SIMDProcessor } from '../../src/runtime/simd';

describe('Runtime - SIMD Operations', () => {
  let runtime: Runtime;
  let simdProcessor: SIMDProcessor;

  beforeEach(() => {
    runtime = new Runtime();
    simdProcessor = new SIMDProcessor();
  });

  describe('Vector Operations', () => {
    it('should perform vector addition', () => {
      const a = [1, 2, 3, 4];
      const b = [5, 6, 7, 8];
      const result = runtime.simdAdd(a, b);
      
      expect(result).toEqual([6, 8, 10, 12]);
    });

    it('should perform vector subtraction', () => {
      const a = [10, 8, 6, 4];
      const b = [5, 3, 1, 2];
      const result = runtime.simdSubtract(a, b);
      
      expect(result).toEqual([5, 5, 5, 2]);
    });

    it('should perform vector multiplication', () => {
      const a = [2, 3, 4, 5];
      const b = [3, 4, 5, 6];
      const result = runtime.simdMultiply(a, b);
      
      expect(result).toEqual([6, 12, 20, 30]);
    });

    it('should perform vector division', () => {
      const a = [12, 15, 20, 30];
      const b = [3, 5, 4, 6];
      const result = runtime.simdDivide(a, b);
      
      expect(result).toEqual([4, 3, 5, 5]);
    });

    it('should handle division by zero', () => {
      const a = [10, 20];
      const b = [2, 0];
      const result = runtime.simdDivide(a, b);
      
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(Infinity);
    });

    it('should throw error for mismatched array lengths', () => {
      const a = [1, 2, 3];
      const b = [4, 5];
      
      expect(() => runtime.simdAdd(a, b)).toThrow('Arrays must have the same length');
    });
  });

  describe('Dot Product and Magnitude', () => {
    it('should compute dot product', () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];
      const result = runtime.simdDot(a, b);
      
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    });

    it('should compute vector magnitude', () => {
      const a = [3, 4]; // 3-4-5 triangle
      const result = runtime.simdMagnitude(a);
      
      expect(result).toBe(5);
    });

    it('should compute magnitude for zero vector', () => {
      const a = [0, 0, 0];
      const result = runtime.simdMagnitude(a);
      
      expect(result).toBe(0);
    });
  });

  describe('Normalization', () => {
    it('should normalize a vector', () => {
      const a = [3, 4]; // magnitude = 5
      const result = runtime.simdNormalize(a);
      
      expect(result[0]).toBeCloseTo(0.6);
      expect(result[1]).toBeCloseTo(0.8);
      
      // Verify normalized vector has magnitude 1
      const magnitude = runtime.simdMagnitude(result);
      expect(magnitude).toBeCloseTo(1);
    });

    it('should handle zero vector normalization', () => {
      const a = [0, 0];
      const result = runtime.simdNormalize(a);
      
      expect(result).toEqual([0, 0]);
    });
  });

  describe('Matrix Operations', () => {
    it('should multiply matrices', () => {
      const a = [
        [1, 2],
        [3, 4]
      ];
      const b = [
        [5, 6],
        [7, 8]
      ];
      
      const result = runtime.matrixMultiply(a, b);
      
      expect(result).toEqual([
        [19, 22], // [1*5 + 2*7, 1*6 + 2*8]
        [43, 50]  // [3*5 + 4*7, 3*6 + 4*8]
      ]);
    });

    it('should handle non-square matrices', () => {
      const a = [
        [1, 2, 3]
      ];
      const b = [
        [4],
        [5],
        [6]
      ];
      
      const result = runtime.matrixMultiply(a, b);
      
      expect(result).toEqual([
        [32] // 1*4 + 2*5 + 3*6 = 32
      ]);
    });

    it('should throw error for incompatible matrix dimensions', () => {
      const a = [[1, 2]];
      const b = [[3], [4], [5]]; // 3x1 matrix, incompatible with 1x2
      
      expect(() => runtime.matrixMultiply(a, b)).toThrow('Matrix dimensions do not match');
    });
  });

  describe('Parallel Execution', () => {
    it('should enable parallel execution', () => {
      runtime.enableParallelExecution(true);
      
      // Test with larger arrays that would trigger parallel processing
      const largeA = Array.from({ length: 2000 }, (_, i) => i);
      const largeB = Array.from({ length: 2000 }, (_, i) => i + 1);
      
      const result = runtime.simdAdd(largeA, largeB);
      
      expect(result).toHaveLength(2000);
      expect(result[0]).toBe(1); // 0 + 1
      expect(result[999]).toBe(1999); // 999 + 1000
    });

    it('should handle parallel dot product for large arrays', () => {
      runtime.enableParallelExecution();
      
      const largeA = Array.from({ length: 2000 }, () => 2);
      const largeB = Array.from({ length: 2000 }, () => 3);
      
      const result = runtime.simdDot(largeA, largeB);
      
      expect(result).toBe(12000); // 2000 * (2 * 3) = 12000
    });
  });

  describe('SIMD Processor Direct Usage', () => {
    it('should enable parallel execution on processor', () => {
      simdProcessor.enableParallelExecution();
      
      const a = [1, 2, 3, 4];
      const b = [5, 6, 7, 8];
      const result = simdProcessor.add(a, b);
      
      expect(result).toEqual([6, 8, 10, 12]);
    });

    it('should validate input arrays', () => {
      expect(() => simdProcessor.add([], null as any)).toThrow('Both arguments must be arrays');
      expect(() => simdProcessor.add([1], 'not an array' as any)).toThrow('Both arguments must be arrays');
    });
  });
});