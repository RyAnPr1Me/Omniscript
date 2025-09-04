import { Omniscript } from "../../src/index";

describe("Advanced functional features", () => {
  const omni = new Omniscript();

  test("semicolons separate expressions", async () => {
    const res = await omni.execute("var x = 1; var y = 2; x + y");
    expect(res).toBe(3);
  });

  test("pattern match with wildcard and binding", async () => {
    const res = await omni.execute(
      "match 5 { 1 => 10, x => add(x, 1), _ => 0 }",
    );
    expect(res).toBe(6);
  });

  test("object with operator overloading and method presence", async () => {
    const src =
      "object Num { operator + (other) => add(self.value, other.value), get() => self.value } var a = new Num(2); var b = new Num(3); a + b";
    const result = await omni.execute(src);
    expect(result).toBe(5);
  });

  test("new instance method call via property access", async () => {
    const src =
      "object Box { get() => self.value } var b = new Box(42); b.get()";
    const result = await omni.execute(src);
    expect(result).toBe(42);
  });

  test("higher-order function: passing function as argument", async () => {
    const src =
      "var apply = (f, x) => f(x); var double = (n) => n * 2; apply(double, 5)";
    const result = await omni.execute(src);
    expect(result).toBe(10);
  });

  test("lambda/arrow function usage", async () => {
    const src = "var add = (a, b) => a + b; add(3, 4)";
    const result = await omni.execute(src);
    expect(result).toBe(7);
  });

  test("chained method calls", async () => {
    const src =
      "object Chain { next(val) => val + 1 } var c = new Chain(); c.next(5)";
    const result = await omni.execute(src);
    expect(result).toBe(6);
  });

  test("object inheritance and method override", async () => {
    const src =
      "object Base { get() => 1 } object Derived extends Base { get() => 2 } var d = new Derived(); d.get()";
    const result = await omni.execute(src);
    expect(result).toBe(2);
  });

  test("error handling: try/catch/finally", async () => {
    const src = "try { throw 99 } catch e { e } finally { 0 }";
    const result = await omni.execute(src);
    expect(result).toBe(99);
  });

  test("pattern match with no match falls to default", async () => {
    const src = "match 42 { 1 => 10, 2 => 20, _ => 99 }";
    const result = await omni.execute(src);
    expect(result).toBe(99);
  });
});
