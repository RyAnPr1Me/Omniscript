export interface SourceLocation {
  filename: string;
  line: number;
  column: number;
  source?: string;
}

export class OmniscriptError extends Error {
  public readonly location?: SourceLocation;
  public readonly code?: string;
  public readonly suggestions: string[] = [];
  public readonly severity: 'error' | 'warning' | 'info' = 'error';

  constructor(
    message: string, 
    location?: SourceLocation, 
    code?: string,
    suggestions: string[] = []
  ) {
    super(message);
    this.name = 'OmniscriptError';
    this.location = location;
    this.code = code;
    this.suggestions = suggestions;
  }

  // Legacy constructor for backward compatibility
  static withLineCol(message: string, line: number = 0, column: number = 0): OmniscriptError {
    return new OmniscriptError(message, { filename: '<unknown>', line, column });
  }

  public formatError(): string {
    let formatted = `${this.severity.toUpperCase()}: ${this.message}`;
    
    if (this.location) {
      formatted += `\n  --> ${this.location.filename}:${this.location.line}:${this.location.column}`;
      if (this.location.source) {
        formatted += `\n${this.getContextLines()}`;
      }
    }
    
    if (this.code) {
      formatted += `\n  Code: ${this.code}`;
    }
    
    if (this.suggestions.length > 0) {
      formatted += `\n  Suggestions:`;
      this.suggestions.forEach(suggestion => {
        formatted += `\n    - ${suggestion}`;
      });
    }
    
    return formatted;
  }

  private getContextLines(): string {
    if (!this.location?.source) return '';
    
    const lines = this.location.source.split('\n');
    const lineNum = this.location.line - 1;
    const context: string[] = [];
    
    // Show 2 lines before and after if available
    const start = Math.max(0, lineNum - 2);
    const end = Math.min(lines.length, lineNum + 3);
    
    for (let i = start; i < end; i++) {
      const isErrorLine = i === lineNum;
      const prefix = isErrorLine ? '  > ' : '    ';
      const lineNumberStr = (i + 1).toString().padStart(3, ' ');
      context.push(`${prefix}${lineNumberStr} | ${lines[i]}`);
      
      if (isErrorLine && this.location.column > 0) {
        const pointer = ' '.repeat(this.location.column + 6) + '^';
        context.push(`      ${pointer}`);
      }
    }
    
    return context.join('\n');
  }
}

export class TypeMismatchError extends OmniscriptError {
  constructor(
    message: string, 
    location?: SourceLocation, 
    expectedType?: string, 
    actualType?: string
  ) {
    const enhancedMessage = expectedType && actualType 
      ? `${message}. Expected ${expectedType}, got ${actualType}`
      : message;
    
    const suggestions = expectedType && actualType 
      ? [`Try converting ${actualType} to ${expectedType}`, `Check variable assignments`]
      : [];
    
    super(enhancedMessage, location, 'E001', suggestions);
    this.name = 'TypeMismatchError';
  }
}

export class SyntaxError extends OmniscriptError {
  constructor(message: string, location?: SourceLocation, token?: string) {
    const suggestions = token 
      ? [`Check syntax around '${token}'`, 'Verify parentheses and brackets are balanced']
      : ['Check syntax and spelling'];
    
    super(message, location, 'E002', suggestions);
    this.name = 'SyntaxError';
  }
}

export class ReferenceError extends OmniscriptError {
  constructor(identifier: string, location?: SourceLocation) {
    const suggestions = [
      `Check if '${identifier}' is declared`,
      `Verify import statements`,
      `Check spelling of '${identifier}'`
    ];
    
    super(`Undefined identifier: ${identifier}`, location, 'E003', suggestions);
    this.name = 'ReferenceError';
  }
}

export class PatternMatchError extends OmniscriptError {
  constructor(message: string, location?: SourceLocation, missingPatterns?: string[]) {
    const suggestions = missingPatterns 
      ? [`Add cases for: ${missingPatterns.join(', ')}`, 'Add a wildcard case to handle all remaining values']
      : ['Check pattern match exhaustiveness'];
    
    super(message, location, 'E004', suggestions);
    this.name = 'PatternMatchError';
  }
}

export class RuntimeError extends OmniscriptError {
  public readonly cause?: Error;
  
  constructor(message: string, location?: SourceLocation, cause?: Error) {
    const suggestions = cause 
      ? ['Check runtime conditions', 'Add null/undefined checks']
      : ['Verify runtime state'];
    
    super(message, location, 'E005', suggestions);
    this.name = 'RuntimeError';
    this.cause = cause;
  }
}

// Error utilities
export class ErrorFormatter {
  static formatMultiple(errors: OmniscriptError[]): string {
    return errors.map(error => error.formatError()).join('\n\n');
  }

  static createDiagnostic(
    message: string, 
    location: SourceLocation, 
    severity: 'error' | 'warning' | 'info' = 'error'
  ): OmniscriptError {
    const error = new OmniscriptError(message, location);
    (error as any).severity = severity;
    return error;
  }
}
