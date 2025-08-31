import { Omniscript } from '../../src/index';

describe('Enhanced Functional Programming Features', () => {
  const omni = new Omniscript();

  describe('Immutability and Def bindings', () => {
    test('def bindings work', async () => {
      const result = await omni.execute('def x = 42; x');
      expect(result).toBe(42);
    });

    test('def with expressions', async () => {
      const result = await omni.execute('def add = fn(a, b) => a + b; add(3, 4)');
      expect(result).toBe(7);
    });
  });

  describe('Monadic types', () => {
    test('Maybe type - just value', async () => {
      const result = await omni.execute('just(42)');
      expect(result.__tag).toBe('maybe');
      expect(result.value).toBe(42);
    });

    test('Maybe type - nothing value', async () => {
      const result = await omni.execute('nothing()');
      expect(result.__tag).toBe('maybe');
      expect(result.value).toBe(null);
    });

    test('Either type - left value', async () => {
      const result = await omni.execute('left("error")');
      expect(result.__tag).toBe('either');
      expect(result.isLeft).toBe(true);
      expect(result.value).toBe('error');
    });

    test('Either type - right value', async () => {
      const result = await omni.execute('right(42)');
      expect(result.__tag).toBe('either');
      expect(result.isLeft).toBe(false);
      expect(result.value).toBe(42);
    });
  });

  describe('Enhanced list operations', () => {
    test('head function', async () => {
      const result = await omni.execute('head([1, 2, 3])');
      expect(result).toBe(1);
    });

    test('tail function', async () => {
      const result = await omni.execute('tail([1, 2, 3])');
      expect(result).toEqual([2, 3]);
    });

    test('cons function', async () => {
      const result = await omni.execute('cons(0, [1, 2, 3])');
      expect(result).toEqual([0, 1, 2, 3]);
    });

    test('reverse function', async () => {
      const result = await omni.execute('reverse([1, 2, 3, 4])');
      expect(result).toEqual([4, 3, 2, 1]);
    });

    test('take function', async () => {
      const result = await omni.execute('take(2, [1, 2, 3, 4])');
      expect(result).toEqual([1, 2]);
    });

    test('drop function', async () => {
      const result = await omni.execute('drop(2, [1, 2, 3, 4])');
      expect(result).toEqual([3, 4]);
    });

    test('zip function', async () => {
      const result = await omni.execute('zip([1, 2, 3], ["a", "b", "c"])');
      expect(result).toEqual([[1, "a"], [2, "b"], [3, "c"]]);
    });

    test('sortBy function', async () => {
      const result = await omni.execute('sortBy(fn(x) => -x, [3, 1, 4, 1, 5])');
      expect(result).toEqual([5, 4, 3, 1, 1]);
    });
  });

  describe('Function composition and utilities', () => {
    test('identity function', async () => {
      const result = await omni.execute('identity(42)');
      expect(result).toBe(42);
    });

    test('constant function', async () => {
      const result = await omni.execute('constant(42)("anything")');
      expect(result).toBe(42);
    });

    test('flip function', async () => {
      const result = await omni.execute('var sub = fn(a, b) => a - b; flip(sub)(3, 10)');
      expect(result).toBe(7); // 10 - 3 = 7
    });

    test('pipe function composition', async () => {
      const result = await omni.execute('var addOne = fn(x) => x + 1; var double = fn(x) => x * 2; pipe(addOne, double)(5)');
      expect(result).toBe(12); // (5 + 1) * 2 = 12
    });

    test('compose vs pipe', async () => {
      const result1 = await omni.execute('var addOne = fn(x) => x + 1; var double = fn(x) => x * 2; compose(double, addOne)(5)');
      const result2 = await omni.execute('var addOne = fn(x) => x + 1; var double = fn(x) => x * 2; pipe(addOne, double)(5)');
      expect(result1).toBe(result2); // Both should give 12
    });
  });

  describe('Complex functional patterns', () => {
    test('function composition chain', async () => {
      const result = await omni.execute(`
        var addOne = fn(x) => x + 1;
        var double = fn(x) => x * 2;
        var square = fn(x) => x * x;
        range(3) |> map(compose(square, compose(double, addOne)))
      `);
      expect(result).toEqual([4, 16, 36]); // [(0+1)*2]^2, [(1+1)*2]^2, [(2+1)*2]^2
    });

    test('functional data processing pipeline', async () => {
      const result = await omni.execute(`
        range(5) |> filter(fn(x) => x % 2) |> map(fn(x) => x * x)
      `);
      expect(result).toEqual([1, 9]); // 1^2, 3^2
    });

    test('nested function application', async () => {
      const result = await omni.execute(`
        var apply = fn(f, x) => f(x);
        var double = fn(x) => x * 2;
        var addTen = fn(x) => x + 10;
        apply(compose(addTen, double), 5)
      `);
      expect(result).toBe(20); // (5 * 2) + 10 = 20
    });
  });

  describe('Error handling and edge cases', () => {
    test('head on empty array', async () => {
      const result = await omni.execute('head([])');
      expect(result).toBe(null);
    });

    test('tail on empty array', async () => {
      const result = await omni.execute('tail([])');
      expect(result).toEqual([]);
    });

    test('take more than available', async () => {
      const result = await omni.execute('take(5, [1, 2])');
      expect(result).toEqual([1, 2]);
    });

    test('drop more than available', async () => {
      const result = await omni.execute('drop(5, [1, 2])');
      expect(result).toEqual([]);
    });
  });
});