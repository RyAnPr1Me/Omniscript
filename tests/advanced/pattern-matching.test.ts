import { describe, expect, test } from "@jest/globals";
import {
  PatternMatcher,
  PatternBuilder,
  MatchCompiler,
  Pattern,
  MatchCase,
} from "../../src/pattern-matching";

describe("Advanced Pattern Matching", () => {
  const matcher = new PatternMatcher();

  test("matches literal patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.literal(42),
        action: "forty-two",
      },
      {
        pattern: PatternBuilder.wildcard(),
        action: "other",
      },
    ];

    expect(matcher.match(42, cases)).toBe("forty-two");
    expect(matcher.match(99, cases)).toBe("other");
  });

  test("matches identifier patterns with binding", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.identifier("x"),
        action: (bindings: any) => `value is ${bindings.x}`,
      },
    ];

    const result = matcher.match(123, cases);
    expect(result).toBe("value is 123");
  });

  test("matches array patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.array([
          PatternBuilder.literal(1),
          PatternBuilder.identifier("second"),
          PatternBuilder.literal(3),
        ]),
        action: (bindings: any) => `second element is ${bindings.second}`,
      },
      {
        pattern: PatternBuilder.wildcard(),
        action: "no match",
      },
    ];

    expect(matcher.match([1, 2, 3], cases)).toBe("second element is 2");
    expect(matcher.match([1, 2, 3, 4], cases)).toBe("no match");
  });

  test("matches object patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.object({
          name: PatternBuilder.identifier("n"),
          age: PatternBuilder.literal(25),
        }),
        action: (bindings: any) => `name is ${bindings.n}`,
      },
      {
        pattern: PatternBuilder.wildcard(),
        action: "no match",
      },
    ];

    const person = { name: "Alice", age: 25, city: "NYC" };
    expect(matcher.match(person, cases)).toBe("name is Alice");

    const youngPerson = { name: "Bob", age: 20 };
    expect(matcher.match(youngPerson, cases)).toBe("no match");
  });

  test("matches constructor patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.some(PatternBuilder.identifier("value")),
        action: (bindings: any) => `some ${bindings.value}`,
      },
      {
        pattern: PatternBuilder.none(),
        action: "none",
      },
    ];

    const someValue = {
      constructor: { name: "Some" },
      __class: "Some",
      field0: 42,
    };
    const noneValue = { constructor: { name: "None" }, __class: "None" };

    expect(matcher.match(someValue, cases)).toBe("some 42");
    expect(matcher.match(noneValue, cases)).toBe("none");
  });

  test("handles guard patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.identifier("x"),
        guard: (bindings: any) => bindings.x > 0,
        action: "positive",
      },
      {
        pattern: PatternBuilder.identifier("x"),
        guard: (bindings: any) => bindings.x < 0,
        action: "negative",
      },
      {
        pattern: PatternBuilder.wildcard(),
        action: "zero",
      },
    ];

    expect(matcher.match(5, cases)).toBe("positive");
    expect(matcher.match(-3, cases)).toBe("negative");
    expect(matcher.match(0, cases)).toBe("zero");
  });

  test("throws error for non-exhaustive patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.literal(42),
        action: "forty-two",
      },
    ];

    expect(() => matcher.match(99, cases)).toThrow(
      "Non-exhaustive pattern match",
    );
  });
});

describe("Pattern Builder", () => {
  test("creates literal patterns", () => {
    const pattern = PatternBuilder.literal(42);
    expect(pattern.type).toBe("literal");
    expect(pattern.value).toBe(42);
  });

  test("creates identifier patterns", () => {
    const pattern = PatternBuilder.identifier("x");
    expect(pattern.type).toBe("identifier");
    expect(pattern.name).toBe("x");
  });

  test("creates wildcard patterns", () => {
    const pattern = PatternBuilder.wildcard();
    expect(pattern.type).toBe("wildcard");
  });

  test("creates array patterns", () => {
    const inner = [PatternBuilder.literal(1), PatternBuilder.wildcard()];
    const pattern = PatternBuilder.array(inner);
    expect(pattern.type).toBe("array");
    expect(pattern.patterns).toBe(inner);
  });

  test("creates object patterns", () => {
    const props = { name: PatternBuilder.literal("test") };
    const pattern = PatternBuilder.object(props);
    expect(pattern.type).toBe("object");
    expect(pattern.properties).toBe(props);
  });

  test("creates guard patterns", () => {
    const inner = PatternBuilder.literal(5);
    const condition = (x: any) => x > 0;
    const pattern = PatternBuilder.guard(inner, condition);
    expect(pattern.type).toBe("guard");
    expect(pattern.patterns).toContain(inner);
    expect(pattern.condition).toBe(condition);
  });

  test("creates convenience patterns", () => {
    const somePattern = PatternBuilder.some(PatternBuilder.literal(42));
    expect(somePattern.type).toBe("constructor");
    expect(somePattern.name).toBe("Some");

    const nonePattern = PatternBuilder.none();
    expect(nonePattern.type).toBe("constructor");
    expect(nonePattern.name).toBe("None");

    const consPattern = PatternBuilder.cons(
      PatternBuilder.literal(1),
      PatternBuilder.literal(2),
    );
    expect(consPattern.type).toBe("constructor");
    expect(consPattern.name).toBe("Cons");

    const nilPattern = PatternBuilder.nil();
    expect(nilPattern.type).toBe("constructor");
    expect(nilPattern.name).toBe("Nil");
  });
});

describe("Exhaustiveness Analysis", () => {
  const matcher = new PatternMatcher();

  test("detects exhaustive boolean patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.literal(true),
        action: "true",
      },
      {
        pattern: PatternBuilder.literal(false),
        action: "false",
      },
    ];

    const analysis = matcher.analyzeExhaustiveness(cases, "boolean");
    expect(analysis.isExhaustive).toBe(true);
    expect(analysis.missingPatterns).toHaveLength(0);
  });

  test("detects non-exhaustive boolean patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.literal(true),
        action: "true",
      },
    ];

    const analysis = matcher.analyzeExhaustiveness(cases, "boolean");
    expect(analysis.isExhaustive).toBe(false);
    expect(analysis.missingPatterns).toHaveLength(1);
    expect(analysis.missingPatterns[0].value).toBe(false);
  });

  test("detects exhaustive Option patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.some(PatternBuilder.wildcard()),
        action: "some",
      },
      {
        pattern: PatternBuilder.none(),
        action: "none",
      },
    ];

    const analysis = matcher.analyzeExhaustiveness(cases, "Option");
    expect(analysis.isExhaustive).toBe(true);
  });

  test("detects redundant patterns", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.wildcard(),
        action: "wildcard",
      },
      {
        pattern: PatternBuilder.literal(42),
        action: "forty-two",
      },
    ];

    const analysis = matcher.analyzeExhaustiveness(cases, "number");
    expect(analysis.redundantCases).toContain(1);
    expect(analysis.warnings).toContain("Case 1 is unreachable due to case 0");
  });

  test("wildcard makes patterns exhaustive", () => {
    const cases: MatchCase[] = [
      {
        pattern: PatternBuilder.literal(42),
        action: "forty-two",
      },
      {
        pattern: PatternBuilder.wildcard(),
        action: "other",
      },
    ];

    const analysis = matcher.analyzeExhaustiveness(cases, "number");
    expect(analysis.isExhaustive).toBe(true);
  });
});

describe("Match Compiler", () => {
  test("compiles match expressions with analysis", () => {
    const compiler = new MatchCompiler();

    const matchExpr = {
      value: 42,
      cases: [
        {
          pattern: PatternBuilder.literal(42),
          action: "found",
        },
        {
          pattern: PatternBuilder.wildcard(),
          action: "not found",
        },
      ],
    };

    const compiled = compiler.compile(matchExpr);
    expect(compiled.type).toBe("Match");
    expect(compiled.analysis.isExhaustive).toBe(true);
    expect(compiled.execute(42)).toBe("found");
    expect(compiled.execute(99)).toBe("not found");
  });
});
