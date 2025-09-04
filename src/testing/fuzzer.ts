/**
 * Fuzzing utilities for parser and runtime safety testing
 * Implements property-based testing and random input generation for security
 */

import { Parser } from "../parser/index";
import { Runtime } from "../runtime/index";
import { OmniscriptError } from "../errors";

export interface FuzzingConfig {
  maxIterations: number;
  maxStringLength: number;
  includeUnicode: boolean;
  includeControlChars: boolean;
  timeout: number;
}

export interface FuzzingResult {
  totalTests: number;
  failures: Array<{
    input: string;
    error: string;
    type: "parser" | "runtime";
  }>;
  crashes: number;
  timeouts: number;
}

export class Fuzzer {
  private parser: Parser;
  private runtime: Runtime;
  private config: FuzzingConfig;

  constructor(config: Partial<FuzzingConfig> = {}) {
    this.parser = new Parser();
    this.runtime = new Runtime();
    this.config = {
      maxIterations: 1000,
      maxStringLength: 1000,
      includeUnicode: true,
      includeControlChars: false,
      timeout: 5000,
      ...config,
    };
  }

  /**
   * Generate random source code for testing
   */
  private generateRandomInput(): string {
    const generators = [
      () => this.generateRandomExpression(),
      () => this.generateRandomStatement(),
      () => this.generateRandomClass(),
      () => this.generateRandomFunction(),
      () => this.generateRandomString(),
      () => this.generateRandomSymbols(),
    ];

    const generator = generators[Math.floor(Math.random() * generators.length)];
    return generator();
  }

  private generateRandomExpression(): string {
    const expressions = [
      `${this.randomNumber()} + ${this.randomNumber()}`,
      `"${this.randomString()}" + "${this.randomString()}"`,
      `let x = ${this.randomNumber()}; x * 2`,
      `[${Array.from({ length: Math.floor(Math.random() * 5) }, () => this.randomNumber()).join(", ")}]`,
      `{${this.randomString()}: ${this.randomNumber()}}`,
      `match ${this.randomNumber()} { ${this.randomNumber()} => "match", _ => "default" }`,
    ];
    return expressions[Math.floor(Math.random() * expressions.length)];
  }

  private generateRandomStatement(): string {
    const statements = [
      `let ${this.randomIdentifier()} = ${this.randomNumber()};`,
      `if (${this.randomBoolean()}) { ${this.randomNumber()} } else { ${this.randomNumber()} }`,
      `for (let i = 0; i < ${Math.floor(Math.random() * 10)}; i++) { ${this.randomNumber()} }`,
      `try { throw "${this.randomString()}" } catch (e) { e }`,
      `function ${this.randomIdentifier()}() { return ${this.randomNumber()}; }`,
    ];
    return statements[Math.floor(Math.random() * statements.length)];
  }

  private generateRandomClass(): string {
    const className = this.randomIdentifier();
    const methodName = this.randomIdentifier();
    return `class ${className} { ${methodName}() { return ${this.randomNumber()}; } }`;
  }

  private generateRandomFunction(): string {
    const funcName = this.randomIdentifier();
    const paramName = this.randomIdentifier();
    return `function ${funcName}(${paramName}) { return ${paramName} + ${this.randomNumber()}; }`;
  }

  private generateRandomString(): string {
    return `"${this.randomString()}"`;
  }

  private generateRandomSymbols(): string {
    const symbols = ["!@#$%^&*()", "{}[]();", "+-*/", "==!=<>", "&&||", "??"];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  private randomString(maxLength?: number): string {
    const length =
      Math.floor(Math.random() * (maxLength || this.config.maxStringLength)) +
      1;
    let result = "";

    for (let i = 0; i < length; i++) {
      if (this.config.includeUnicode && Math.random() < 0.1) {
        // Add some Unicode characters
        result += String.fromCharCode(
          0x1f600 + Math.floor(Math.random() * 100),
        );
      } else if (this.config.includeControlChars && Math.random() < 0.05) {
        // Add control characters
        result += String.fromCharCode(Math.floor(Math.random() * 32));
      } else {
        // Regular ASCII
        const chars =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    return result;
  }

  private randomIdentifier(): string {
    const start = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
    const chars = start + "0123456789";
    let result = start[Math.floor(Math.random() * start.length)];

    const length = Math.floor(Math.random() * 10) + 1;
    for (let i = 1; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
  }

  private randomNumber(): number {
    return Math.floor(Math.random() * 1000) - 500;
  }

  private randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * Test parser with random inputs
   */
  private testParser(input: string): { success: boolean; error?: string } {
    try {
      this.parser.parse(input);
      return { success: true };
    } catch (error) {
      if (error instanceof OmniscriptError) {
        // Expected parsing errors are fine
        return { success: true };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test runtime with random inputs
   */
  private testRuntime(input: string): { success: boolean; error?: string } {
    try {
      const ast = this.parser.parse(input);
      this.runtime.execute(ast);
      return { success: true };
    } catch (error) {
      if (error instanceof OmniscriptError) {
        // Expected runtime errors are fine
        return { success: true };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run fuzzing test suite
   */
  async fuzz(): Promise<FuzzingResult> {
    const result: FuzzingResult = {
      totalTests: 0,
      failures: [],
      crashes: 0,
      timeouts: 0,
    };

    console.log(
      `Starting fuzzing with ${this.config.maxIterations} iterations...`,
    );

    for (let i = 0; i < this.config.maxIterations; i++) {
      const input = this.generateRandomInput();
      result.totalTests++;

      try {
        // Test with timeout
        const testPromise = Promise.race([
          new Promise<void>((resolve) => {
            // Test parser
            const parserResult = this.testParser(input);
            if (!parserResult.success) {
              result.failures.push({
                input,
                error: parserResult.error || "Unknown parser error",
                type: "parser",
              });
              result.crashes++;
            } else {
              // Test runtime only if parser succeeded
              const runtimeResult = this.testRuntime(input);
              if (!runtimeResult.success) {
                result.failures.push({
                  input,
                  error: runtimeResult.error || "Unknown runtime error",
                  type: "runtime",
                });
                result.crashes++;
              }
            }
            resolve();
          }),
          new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), this.config.timeout);
          }),
        ]);

        await testPromise;
      } catch (error) {
        if (error instanceof Error && error.message === "Timeout") {
          result.timeouts++;
        } else {
          result.crashes++;
          result.failures.push({
            input,
            error: error instanceof Error ? error.message : String(error),
            type: "runtime",
          });
        }
      }

      // Progress reporting
      if (i % Math.floor(this.config.maxIterations / 10) === 0) {
        console.log(
          `Fuzzing progress: ${Math.floor((i / this.config.maxIterations) * 100)}%`,
        );
      }
    }

    return result;
  }

  /**
   * Generate property-based test for specific features
   */
  async testProperty(
    property: string,
    iterations: number = 100,
  ): Promise<boolean> {
    switch (property) {
      case "parser-never-hangs":
        return this.testParserNeverHangs(iterations);
      case "runtime-memory-safe":
        return this.testRuntimeMemorySafe(iterations);
      case "type-safety":
        return this.testTypeSafety(iterations);
      default:
        throw new Error(`Unknown property: ${property}`);
    }
  }

  private async testParserNeverHangs(iterations: number): Promise<boolean> {
    for (let i = 0; i < iterations; i++) {
      const input = this.generateRandomInput();
      const start = Date.now();

      try {
        this.parser.parse(input);
      } catch {
        // Errors are fine, hangs are not
      }

      if (Date.now() - start > 1000) {
        console.error(`Parser hung on input: ${input}`);
        return false;
      }
    }
    return true;
  }

  private async testRuntimeMemorySafe(iterations: number): Promise<boolean> {
    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const input = this.generateRandomExpression();
      try {
        const ast = this.parser.parse(input);
        this.runtime.execute(ast);
      } catch {
        // Errors are fine
      }

      // Check for memory leaks
      if (i % 50 === 0) {
        if (global.gc) global.gc();
        const currentMemory = process.memoryUsage().heapUsed;
        if (currentMemory > initialMemory * 10) {
          console.error("Potential memory leak detected");
          return false;
        }
      }
    }
    return true;
  }

  private async testTypeSafety(iterations: number): Promise<boolean> {
    for (let i = 0; i < iterations; i++) {
      const input = this.generateRandomExpression();
      try {
        const ast = this.parser.parse(input);
        const result = this.runtime.execute(ast);

        // Basic type invariants
        if (result !== null && result !== undefined) {
          const type = typeof result;
          if (
            !["number", "string", "boolean", "object", "function"].includes(
              type,
            )
          ) {
            console.error(`Invalid type returned: ${type}`);
            return false;
          }
        }
      } catch {
        // Type errors are expected and fine
      }
    }
    return true;
  }
}

/**
 * Convenience function to run basic fuzzing
 */
export async function runFuzzTest(
  config?: Partial<FuzzingConfig>,
): Promise<FuzzingResult> {
  const fuzzer = new Fuzzer(config);
  return await fuzzer.fuzz();
}

/**
 * Run property-based tests
 */
export async function runPropertyTest(
  property: string,
  iterations?: number,
): Promise<boolean> {
  const fuzzer = new Fuzzer();
  return await fuzzer.testProperty(property, iterations);
}
