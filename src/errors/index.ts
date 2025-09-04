export interface SourceLocation {
  filename: string;
  line: number;
  column: number;
  source?: string;
  length?: number;
}

export interface ErrorSuggestion {
  type: "fix" | "suggestion" | "info";
  message: string;
  action?: {
    type: "replace" | "insert" | "delete";
    range?: [number, number];
    text?: string;
  };
}

export interface DiagnosticContext {
  relatedErrors?: OmniscriptError[];
  quickFixes?: ErrorSuggestion[];
  documentation?: {
    url: string;
    description: string;
  };
}

export class OmniscriptError extends Error {
  public readonly location?: SourceLocation;
  public readonly code?: string;
  public readonly suggestions: string[] = [];
  public readonly severity: "error" | "warning" | "info" = "error";
  public readonly context?: DiagnosticContext;

  constructor(
    message: string,
    location?: SourceLocation,
    code?: string,
    suggestions: string[] = [],
    context?: DiagnosticContext,
    severity: "error" | "warning" | "info" = "error",
  ) {
    super(message);
    this.name = "OmniscriptError";
    this.location = location;
    this.code = code;
    this.suggestions = suggestions;
    this.context = context;
    (this as any).severity = severity;
  }

  // Enhanced constructor with better error context
  static create(options: {
    message: string;
    location?: SourceLocation;
    code?: string;
    suggestions?: string[];
    severity?: "error" | "warning" | "info";
    context?: DiagnosticContext;
  }): OmniscriptError {
    return new OmniscriptError(
      options.message,
      options.location,
      options.code,
      options.suggestions,
      options.context,
      options.severity || "error",
    );
  }

  // Legacy constructor for backward compatibility
  static withLineCol(
    message: string,
    line: number = 0,
    column: number = 0,
  ): OmniscriptError {
    return new OmniscriptError(message, {
      filename: "<unknown>",
      line,
      column,
    });
  }

  public formatError(): string {
    let formatted = this.formatHeader();

    if (this.location) {
      formatted += this.formatLocation();
      if (this.location.source) {
        formatted += this.getContextLines();
      }
    }

    if (this.code) {
      formatted += `\n  Error Code: ${this.code}`;
    }

    formatted += this.formatSuggestions();
    formatted += this.formatQuickFixes();
    formatted += this.formatDocumentation();

    return formatted;
  }

  private formatHeader(): string {
    const icon = this.getErrorIcon();
    return `${icon} ${this.severity.toUpperCase()}: ${this.message}`;
  }

  private getErrorIcon(): string {
    switch (this.severity) {
      case "error": return "❌";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
      default: return "•";
    }
  }

  private formatLocation(): string {
    if (!this.location) return "";
    
    let locationStr = `\n  --> ${this.location.filename}:${this.location.line}:${this.location.column}`;
    
    if (this.location.length) {
      locationStr += `-${this.location.column + this.location.length}`;
    }
    
    return locationStr;
  }

  private formatSuggestions(): string {
    if (this.suggestions.length === 0) return "";
    
    let formatted = "\n\n💡 Suggestions:";
    this.suggestions.forEach((suggestion, index) => {
      formatted += `\n  ${index + 1}. ${suggestion}`;
    });
    
    return formatted;
  }

  private formatQuickFixes(): string {
    const quickFixes = this.context?.quickFixes;
    if (!quickFixes || quickFixes.length === 0) return "";
    
    let formatted = "\n\n🔧 Quick Fixes:";
    quickFixes.forEach((fix, index) => {
      const icon = fix.type === "fix" ? "🔧" : fix.type === "suggestion" ? "💡" : "ℹ️";
      formatted += `\n  ${index + 1}. ${icon} ${fix.message}`;
      
      if (fix.action) {
        formatted += ` (${fix.action.type}${fix.action.text ? `: "${fix.action.text}"` : ""})`;
      }
    });
    
    return formatted;
  }

  private formatDocumentation(): string {
    const docs = this.context?.documentation;
    if (!docs) return "";
    
    return `\n\n📚 Learn more: ${docs.description}\n    ${docs.url}`;
  }

  private getContextLines(): string {
    if (!this.location?.source) return "";

    const lines = this.location.source.split("\n");
    const lineNum = this.location.line - 1;
    const context: string[] = [];

    // Show 2 lines before and after if available
    const start = Math.max(0, lineNum - 2);
    const end = Math.min(lines.length, lineNum + 3);

    for (let i = start; i < end; i++) {
      const isErrorLine = i === lineNum;
      const prefix = isErrorLine ? "  > " : "    ";
      const lineNumberStr = (i + 1).toString().padStart(3, " ");
      context.push(`${prefix}${lineNumberStr} | ${lines[i]}`);

      if (isErrorLine && this.location.column > 0) {
        const pointer = " ".repeat(this.location.column + 6) + "^";
        context.push(`      ${pointer}`);
      }
    }

    return context.join("\n");
  }
}

export class TypeMismatchError extends OmniscriptError {
  public readonly expectedType: string;
  public readonly actualType: string;

  constructor(
    message: string,
    location: SourceLocation,
    expectedType: string,
    actualType: string,
  ) {
    const suggestions = TypeMismatchError.generateSuggestions(expectedType, actualType);
    const context = TypeMismatchError.generateContext(expectedType, actualType);
    
    super(message, location, "E001", suggestions, context);
    this.expectedType = expectedType;
    this.actualType = actualType;
  }

  private static generateSuggestions(expected: string, actual: string): string[] {
    const suggestions: string[] = [];
    
    // Type conversion suggestions
    if (expected === "string" && actual === "number") {
      suggestions.push("Convert to string using toString() or String() constructor");
      suggestions.push("Use template literals: `${value}`");
    } else if (expected === "number" && actual === "string") {
      suggestions.push("Convert to number using Number() constructor or parseInt()");
      suggestions.push("Use the unary plus operator: +value");
    } else if (expected === "boolean" && (actual === "string" || actual === "number")) {
      suggestions.push("Convert to boolean using Boolean() constructor");
      suggestions.push("Use double negation: !!value");
    }
    
    // Array/object suggestions
    if (expected.includes("[]") && !actual.includes("[]")) {
      suggestions.push("Wrap value in an array: [value]");
    }
    
    // Null/undefined suggestions
    if (actual === "null" || actual === "undefined") {
      suggestions.push(`Provide a default value: value || defaultValue`);
      suggestions.push("Check if value exists before using: if (value) { ... }");
    }
    
    return suggestions;
  }

  private static generateContext(expected: string, actual: string): DiagnosticContext {
    const quickFixes: ErrorSuggestion[] = [];
    
    // Generate quick fixes based on common patterns
    if (expected === "string" && actual === "number") {
      quickFixes.push({
        type: "fix",
        message: "Convert to string",
        action: {
          type: "replace",
          text: "String()"
        }
      });
    }
    
    return {
      quickFixes,
      documentation: {
        url: "https://omniscript.dev/docs/types",
        description: "Learn about type conversions and type safety"
      }
    };
  }
}

export class SyntaxError extends OmniscriptError {
  constructor(message: string, location?: SourceLocation, token?: string) {
    const suggestions = token
      ? [
          `Check syntax around '${token}'`,
          "Verify parentheses and brackets are balanced",
        ]
      : ["Check syntax and spelling"];

    super(message, location, "E002", suggestions);
    this.name = "SyntaxError";
  }
}

export class ReferenceError extends OmniscriptError {
  constructor(identifier: string, location?: SourceLocation) {
    const suggestions = [
      `Check if '${identifier}' is declared`,
      `Verify import statements`,
      `Check spelling of '${identifier}'`,
    ];

    super(`Undefined identifier: ${identifier}`, location, "E003", suggestions);
    this.name = "ReferenceError";
  }
}

export class PatternMatchError extends OmniscriptError {
  constructor(
    message: string,
    location?: SourceLocation,
    missingPatterns?: string[],
  ) {
    const suggestions = missingPatterns
      ? [
          `Add cases for: ${missingPatterns.join(", ")}`,
          "Add a wildcard case to handle all remaining values",
        ]
      : ["Check pattern match exhaustiveness"];

    super(message, location, "E004", suggestions);
    this.name = "PatternMatchError";
  }
}

export class RuntimeError extends OmniscriptError {
  public readonly cause?: Error;

  constructor(message: string, location?: SourceLocation, cause?: Error) {
    const suggestions = cause
      ? ["Check runtime conditions", "Add null/undefined checks"]
      : ["Verify runtime state"];

    super(message, location, "E005", suggestions);
    this.name = "RuntimeError";
    this.cause = cause;
  }
}

// Error utilities
export class ErrorFormatter {
  static formatMultiple(errors: OmniscriptError[]): string {
    return errors.map((error) => error.formatError()).join("\n\n");
  }

  static createDiagnostic(
    message: string,
    location: SourceLocation,
    severity: "error" | "warning" | "info" = "error",
  ): OmniscriptError {
    const error = new OmniscriptError(message, location);
    (error as any).severity = severity;
    return error;
  }
}

/**
 * Intelligent error analyzer that provides context-aware suggestions
 */
export class ErrorAnalyzer {
  private static readonly COMMON_TYPOS = new Map([
    ["lenght", "length"],
    ["widht", "width"],
    ["heigth", "height"],
    ["fucntion", "function"],
    ["funciton", "function"],
    ["cosnt", "const"],
    ["lte", "let"],
    ["retrun", "return"],
    ["classs", "class"],
    ["improt", "import"],
    ["exprot", "export"],
  ]);

  private static readonly COMMON_METHODS = new Map([
    ["array", ["push", "pop", "shift", "unshift", "slice", "splice", "map", "filter", "reduce", "forEach"]],
    ["string", ["length", "charAt", "substring", "indexOf", "replace", "split", "trim", "toLowerCase", "toUpperCase"]],
    ["object", ["keys", "values", "entries", "hasOwnProperty", "toString", "valueOf"]],
  ]);

  static analyzeUndefinedVariable(varName: string, availableVars: string[]): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];
    
    // Check for typos
    const typoFix = this.COMMON_TYPOS.get(varName.toLowerCase());
    if (typoFix) {
      suggestions.push({
        type: "fix",
        message: `Did you mean '${typoFix}'?`,
        action: {
          type: "replace",
          text: typoFix
        }
      });
    }
    
    // Find similar variable names
    const similar = this.findSimilarNames(varName, availableVars);
    similar.forEach(name => {
      suggestions.push({
        type: "suggestion",
        message: `Did you mean '${name}'?`,
        action: {
          type: "replace",
          text: name
        }
      });
    });
    
    // Suggest declaration if no similar names found
    if (similar.length === 0) {
      suggestions.push({
        type: "suggestion",
        message: `Declare variable: const ${varName} = ...`,
        action: {
          type: "insert",
          text: `const ${varName} = `
        }
      });
    }
    
    return suggestions;
  }

  static analyzeMethodNotFound(methodName: string, objectType: string): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];
    
    // Get available methods for the object type
    const availableMethods = this.COMMON_METHODS.get(objectType.toLowerCase()) || [];
    
    // Find similar method names
    const similar = this.findSimilarNames(methodName, availableMethods);
    similar.forEach(method => {
      suggestions.push({
        type: "suggestion",
        message: `Did you mean '${method}'?`,
        action: {
          type: "replace",
          text: method
        }
      });
    });
    
    // Type-specific suggestions
    if (objectType === "array") {
      if (methodName.includes("add")) {
        suggestions.push({
          type: "suggestion",
          message: "Use 'push()' to add elements to an array",
          action: { type: "replace", text: "push" }
        });
      }
      if (methodName.includes("size")) {
        suggestions.push({
          type: "suggestion",
          message: "Use 'length' property to get array size",
          action: { type: "replace", text: "length" }
        });
      }
    }
    
    return suggestions;
  }

  static analyzeSyntaxError(source: string, line: number, column: number): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];
    const lines = source.split('\n');
    const currentLine = lines[line - 1];
    
    if (!currentLine) return suggestions;
    
    // Check for common syntax issues
    if (currentLine.includes('=') && !currentLine.includes('==') && !currentLine.includes('===')) {
      if (currentLine.includes('if') || currentLine.includes('while')) {
        suggestions.push({
          type: "fix",
          message: "Use '==' or '===' for comparison instead of '='",
          action: {
            type: "replace",
            text: "=="
          }
        });
      }
    }
    
    // Check for missing semicolons
    if (!currentLine.trim().endsWith(';') && !currentLine.trim().endsWith('{') && !currentLine.trim().endsWith('}')) {
      suggestions.push({
        type: "suggestion",
        message: "Add semicolon at end of statement",
        action: {
          type: "insert",
          text: ";"
        }
      });
    }
    
    // Check for unmatched parentheses
    const openParens = (currentLine.match(/\(/g) || []).length;
    const closeParens = (currentLine.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      suggestions.push({
        type: "fix",
        message: `Missing ${openParens - closeParens} closing parenthesis`,
        action: {
          type: "insert",
          text: ")".repeat(openParens - closeParens)
        }
      });
    }
    
    return suggestions;
  }

  private static findSimilarNames(target: string, candidates: string[]): string[] {
    return candidates
      .map(candidate => ({
        name: candidate,
        distance: this.levenshteinDistance(target.toLowerCase(), candidate.toLowerCase())
      }))
      .filter(({ distance }) => distance <= 2 && distance > 0)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(({ name }) => name);
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}
