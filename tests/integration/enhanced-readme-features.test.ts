import { Omniscript } from '../../src/index';

describe('Enhanced README Features', () => {
  const omni = new Omniscript();

  test('pattern matching with guards works correctly', async () => {
    const src = 'let value = 5; match value { 0 => "zero", n if n > 0 => "positive", n if n < 0 => "negative", _ => "unknown" }';
    const result = await omni.execute(src);
    expect(result).toBe('positive');
  });

  test('pattern matching with guards for negative numbers', async () => {
    const src = 'let value = -3; match value { 0 => "zero", n if n > 0 => "positive", n if n < 0 => "negative", _ => "unknown" }';
    const result = await omni.execute(src);
    expect(result).toBe('negative');
  });

  test('pattern matching with guards for zero', async () => {
    const src = 'let value = 0; match value { 0 => "zero", n if n > 0 => "positive", n if n < 0 => "negative", _ => "unknown" }';
    const result = await omni.execute(src);
    expect(result).toBe('zero');
  });

  test('class decorators are parsed and stored', async () => {
    const src = '@component class UserList { get() => "working" }';
    const result = await omni.execute(src);
    expect(result.__decorators).toEqual(['component']);
    expect(result.__component).toBe(true);
  });

  test('method decorators are parsed and stored', async () => {
    const src = 'class UserList { @state getUsers() => "users", @computed getActiveUsers() => "active" }';
    const result = await omni.execute(src);
    expect(result.methods.getUsers.__state).toBe(true);
    expect(result.methods.getActiveUsers.__computed).toBe(true);
  });

  test('import statements work for stdlib', async () => {
    const src = 'import { HTTP, Database } from "stdlib"; HTTP';
    const result = await omni.execute(src);
    expect(result).toBeDefined();
    expect(typeof result.Server).toBe('function');
  });

  test('database ORM mock objects are available', async () => {
    const src = 'db.users';
    const result = await omni.execute(src);
    expect(result).toBeDefined();
    expect(typeof result.findAll).toBe('function');
  });

  test('string literals work in pattern matching', async () => {
    const src = 'match "hello" { "world" => "no", "hello" => "yes", _ => "unknown" }';
    const result = await omni.execute(src);
    expect(result).toBe('yes');
  });

  test('comparison operators work correctly', async () => {
    expect(await omni.execute('5 > 3')).toBe(true);
    expect(await omni.execute('5 < 3')).toBe(false);
    expect(await omni.execute('5 >= 5')).toBe(true);
    expect(await omni.execute('5 <= 4')).toBe(false);
    expect(await omni.execute('5 == 5')).toBe(true);
    expect(await omni.execute('5 != 3')).toBe(true);
  });

  test('operator overloading with improved math', async () => {
    const src = 'class Num { operator + (other) => add(self.value, other.value) } let a = new Num(2); let b = new Num(3); a + b';
    const result = await omni.execute(src);
    // Should work now with proper add function
    expect(typeof result).toBe('number');
  });
});