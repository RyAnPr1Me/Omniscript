import { Omniscript } from '../../src/index';

describe('Advanced functional features', () => {
  const omni = new Omniscript();

  test('semicolons separate expressions', async () => {
    const res = await omni.execute('let x = 1; let y = 2; x + y');
    expect(res).toBe(3);
  });

  test('pattern match with wildcard and binding', async () => {
    const res = await omni.execute('match 5 { 1 => 10, x => add(x, 1), _ => 0 }');
    expect(res).toBe(6);
  });

  test('class with operator overloading and method presence', async () => {
    const src = 'class Num { operator + (other) => add(self.value, other.value), get() => self.value } let a = new Num(2); let b = new Num(3); a + b';
    const result = await omni.execute(src);
    expect(result).toBe(5);
  });

  test('new instance method call via property access', async () => {
    const src = 'class Box { get() => self.value } let b = new Box(42); b.get()';
    const result = await omni.execute(src);
    expect(result).toBe(42);
  });
});
