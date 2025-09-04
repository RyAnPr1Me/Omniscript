// @jest-environment node
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="jest" />
import { Omniscript } from "../../src/index";

describe("Functional language subset", () => {
  const omni = new Omniscript();

  test("lambda and application", async () => {
    const result = await omni.execute("fn(x)=>x + 1 (5)");
    expect(result).toBe(6);
  });

  test("var binding and nested lambdas", async () => {
    const src =
      "var inc = fn(n)=> n + 1; var add = fn(a)=> fn(b)=> a + b; add(2)(inc(3))";
    const result = await omni.execute(src);
    expect(result).toBe(6);
  });

  test("if expression", async () => {
    const src = "var x = 5; if x then 1 else 2";
    const result = await omni.execute(src);
    expect(result).toBe(1);
  });

  test("pipeline simple", async () => {
    const result = await omni.execute("5 |> fn(x)=> x * 2");
    expect(result).toBe(10);
  });

  test("map/filter/reduce pipeline", async () => {
    const src =
      "range(10) |> map(fn(x)=> x * 2) |> filter(fn(x)=> x % 4) |> reduce(0, fn(acc, v)=> add(acc, v))";
    const result = await omni.execute(src);
    expect(typeof result).toBe("number");
  });
});
