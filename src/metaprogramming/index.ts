import { OmniscriptError } from "../errors";

// Macro system for compile-time code generation and transformation
export interface MacroDefinition {
  name: string;
  parameters: string[];
  body: string;
  isCompileTime: boolean;
}

export interface MacroExpansion {
  original: string;
  expanded: string;
  context: Record<string, any>;
}

export class MacroProcessor {
  private macros: Map<string, MacroDefinition> = new Map();
  private expansionHistory: MacroExpansion[] = [];

  constructor() {
    this.registerBuiltinMacros();
  }

  registerMacro(definition: MacroDefinition): void {
    this.macros.set(definition.name, definition);
  }

  expandMacros(source: string): string {
    let expanded = source;
    let changed = true;
    let iterations = 0;
    const maxIterations = 100; // Prevent infinite expansion loops

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (const [name, macro] of this.macros) {
        const pattern = new RegExp(`@${name}\\s*\\(([^)]*)\\)`, "g");
        expanded = expanded.replace(pattern, (match, args) => {
          changed = true;
          return this.expandMacro(macro, args, match);
        });
      }
    }

    if (iterations >= maxIterations) {
      throw new OmniscriptError(
        "Macro expansion limit exceeded - possible infinite recursion",
      );
    }

    return expanded;
  }

  private expandMacro(
    macro: MacroDefinition,
    argsString: string,
    original: string,
  ): string {
    const args = this.parseArguments(argsString);

    if (args.length !== macro.parameters.length) {
      throw new OmniscriptError(
        `Macro ${macro.name} expects ${macro.parameters.length} arguments but got ${args.length}`,
      );
    }

    let expanded = macro.body;
    const context: Record<string, any> = {};

    // Substitute parameters
    macro.parameters.forEach((param, index) => {
      const value = args[index].trim();
      context[param] = value;
      const paramPattern = new RegExp(`\\$${param}\\b`, "g");
      expanded = expanded.replace(paramPattern, value);
    });

    // Record expansion for debugging
    this.expansionHistory.push({
      original,
      expanded,
      context,
    });

    return expanded;
  }

  private parseArguments(argsString: string): string[] {
    if (!argsString.trim()) return [];

    const args: string[] = [];
    let current = "";
    let depth = 0;
    let inString = false;
    let stringChar = "";

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];

      if (inString) {
        current += char;
        if (char === stringChar && argsString[i - 1] !== "\\") {
          inString = false;
        }
      } else {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
          current += char;
        } else if (char === "(" || char === "[" || char === "{") {
          depth++;
          current += char;
        } else if (char === ")" || char === "]" || char === "}") {
          depth--;
          current += char;
        } else if (char === "," && depth === 0) {
          args.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args;
  }

  private registerBuiltinMacros(): void {
    // Debug macro
    this.registerMacro({
      name: "debug",
      parameters: ["message"],
      body: 'console.log("[DEBUG]", $message)',
      isCompileTime: false,
    });

    // Assert macro
    this.registerMacro({
      name: "assert",
      parameters: ["condition", "message"],
      body: 'if (!($condition)) { throw new Error("Assertion failed: " + $message); }',
      isCompileTime: false,
    });

    // Benchmark macro
    this.registerMacro({
      name: "benchmark",
      parameters: ["name", "code"],
      body: `
        console.time($name);
        try {
          $code
        } finally {
          console.timeEnd($name);
        }
      `,
      isCompileTime: false,
    });

    // Generate getter/setter macro
    this.registerMacro({
      name: "property",
      parameters: ["name", "type"],
      body: `
        private _$name: $type;
        get $name(): $type { return this._$name; }
        set $name(value: $type) { this._$name = value; }
      `,
      isCompileTime: true,
    });

    // Singleton macro
    this.registerMacro({
      name: "singleton",
      parameters: ["className"],
      body: `
        private static _instance: $className;
        static getInstance(): $className {
          if (!$className._instance) {
            $className._instance = new $className();
          }
          return $className._instance;
        }
      `,
      isCompileTime: true,
    });

    // Event emitter macro
    this.registerMacro({
      name: "eventEmitter",
      parameters: ["eventName"],
      body: `
        private listeners_$eventName: Array<(data: any) => void> = [];
        on$eventName(callback: (data: any) => void): void {
          this.listeners_$eventName.push(callback);
        }
        emit$eventName(data: any): void {
          this.listeners_$eventName.forEach(callback => callback(data));
        }
      `,
      isCompileTime: true,
    });
  }

  getExpansionHistory(): MacroExpansion[] {
    return [...this.expansionHistory];
  }

  clearHistory(): void {
    this.expansionHistory = [];
  }
}

// Compile-time evaluation system
export class CompileTimeEvaluator {
  private constants: Map<string, any> = new Map();

  evaluateExpression(expr: string): any {
    try {
      // Simplified compile-time evaluation
      // In a real implementation, this would have a proper AST evaluator
      const constPattern = /const\s+(\w+)\s*=\s*(.+);/g;
      let match;

      while ((match = constPattern.exec(expr)) !== null) {
        const [, name, value] = match;
        this.constants.set(name, this.evaluateValue(value));
      }

      return this.evaluateValue(expr);
    } catch (error: any) {
      throw new OmniscriptError(
        `Compile-time evaluation failed: ${error.message}`,
      );
    }
  }

  private evaluateValue(value: string): any {
    value = value.trim();

    // Number literals
    if (/^\d+(\.\d+)?$/.test(value)) {
      return parseFloat(value);
    }

    // String literals
    if (/^["'].*["']$/.test(value)) {
      return value.slice(1, -1);
    }

    // Boolean literals
    if (value === "true") return true;
    if (value === "false") return false;

    // Array literals
    if (value.startsWith("[") && value.endsWith("]")) {
      const elements = value
        .slice(1, -1)
        .split(",")
        .map((el) => this.evaluateValue(el.trim()));
      return elements;
    }

    // Object literals
    if (value.startsWith("{") && value.endsWith("}")) {
      const obj: any = {};
      const content = value.slice(1, -1);
      const pairs = content.split(",");
      for (const pair of pairs) {
        const [key, val] = pair.split(":").map((s) => s.trim());
        obj[this.evaluateValue(key)] = this.evaluateValue(val);
      }
      return obj;
    }

    // Constants
    if (this.constants.has(value)) {
      return this.constants.get(value);
    }

    // Simple arithmetic
    if (/^\d+\s*[+\-*/]\s*\d+$/.test(value)) {
      return Function(`"use strict"; return (${value})`)();
    }

    return value;
  }

  getConstants(): Map<string, any> {
    return new Map(this.constants);
  }
}

// Reflection and introspection capabilities
export class ReflectionAPI {
  private typeMetadata: Map<string, any> = new Map();
  private decoratorMetadata: Map<string, any[]> = new Map();

  setTypeMetadata(typeName: string, metadata: any): void {
    this.typeMetadata.set(typeName, metadata);
  }

  getTypeMetadata(typeName: string): any {
    return this.typeMetadata.get(typeName);
  }

  addDecoratorMetadata(target: string, decorator: any): void {
    if (!this.decoratorMetadata.has(target)) {
      this.decoratorMetadata.set(target, []);
    }
    this.decoratorMetadata.get(target)!.push(decorator);
  }

  getDecoratorMetadata(target: string): any[] {
    return this.decoratorMetadata.get(target) || [];
  }

  hasDecorator(target: string, decoratorName: string): boolean {
    const decorators = this.getDecoratorMetadata(target);
    return decorators.some((d) => d.name === decoratorName);
  }

  getMethodSignature(className: string, methodName: string): any {
    const metadata = this.getTypeMetadata(className);
    if (metadata && metadata.methods) {
      return metadata.methods[methodName];
    }
    return null;
  }

  getPropertyType(className: string, propertyName: string): string {
    const metadata = this.getTypeMetadata(className);
    if (
      metadata &&
      metadata.properties &&
      propertyName in metadata.properties
    ) {
      return metadata.properties[propertyName];
    }
    return "unknown";
  }

  listMethods(className: string): string[] {
    const metadata = this.getTypeMetadata(className);
    if (metadata && metadata.methods) {
      return Object.keys(metadata.methods);
    }
    return [];
  }

  listProperties(className: string): string[] {
    const metadata = this.getTypeMetadata(className);
    if (metadata && metadata.properties) {
      return Object.keys(metadata.properties);
    }
    return [];
  }
}

export { MacroProcessor as default };
