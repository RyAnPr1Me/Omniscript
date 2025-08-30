import { OmniscriptError } from '../errors';

// Advanced pattern matching system with exhaustive checking
export interface Pattern {
  type: 'literal' | 'identifier' | 'wildcard' | 'constructor' | 'array' | 'object' | 'guard';
  value?: any;
  name?: string;
  patterns?: Pattern[];
  properties?: Record<string, Pattern>;
  condition?: any;
}

export interface MatchCase {
  pattern: Pattern;
  guard?: any;
  action: any;
  bindings?: Map<string, any>;
}

export interface MatchAnalysis {
  isExhaustive: boolean;
  missingPatterns: Pattern[];
  redundantCases: number[];
  warnings: string[];
}

export class PatternMatcher {
  private caseHistory: MatchCase[] = [];

  match(value: any, cases: MatchCase[]): any {
    this.caseHistory = cases;
    
    for (let i = 0; i < cases.length; i++) {
      const matchCase = cases[i];
      const bindings = new Map<string, any>();
      
      if (this.matchPattern(value, matchCase.pattern, bindings)) {
        // Check guard condition if present
        if (matchCase.guard) {
          const guardResult = this.evaluateGuard(matchCase.guard, bindings);
          if (!guardResult) continue;
        }
        
        // Execute action with bindings
        return this.executeAction(matchCase.action, bindings);
      }
    }
    
    throw new OmniscriptError('Non-exhaustive pattern match - no case matched the value');
  }

  analyzeExhaustiveness(cases: MatchCase[], valueType: string): MatchAnalysis {
    const analysis: MatchAnalysis = {
      isExhaustive: false,
      missingPatterns: [],
      redundantCases: [],
      warnings: []
    };

    // Check for redundant cases (cases that can never be reached)
    for (let i = 0; i < cases.length; i++) {
      for (let j = i + 1; j < cases.length; j++) {
        if (this.patternSubsumes(cases[i].pattern, cases[j].pattern)) {
          analysis.redundantCases.push(j);
          analysis.warnings.push(`Case ${j} is unreachable due to case ${i}`);
        }
      }
    }

    // Check exhaustiveness based on value type
    const missingPatterns = this.findMissingPatterns(cases, valueType);
    analysis.missingPatterns = missingPatterns;
    analysis.isExhaustive = missingPatterns.length === 0;

    if (!analysis.isExhaustive) {
      analysis.warnings.push('Pattern match is not exhaustive - some values may not be handled');
    }

    return analysis;
  }

  private matchPattern(value: any, pattern: Pattern, bindings: Map<string, any>): boolean {
    switch (pattern.type) {
      case 'literal':
        return this.matchLiteral(value, pattern.value);
      
      case 'identifier':
        // Variable binding - always matches and binds the value
        if (pattern.name) {
          bindings.set(pattern.name, value);
        }
        return true;
      
      case 'wildcard':
        return true;
      
      case 'constructor':
        return this.matchConstructor(value, pattern, bindings);
      
      case 'array':
        return this.matchArray(value, pattern, bindings);
      
      case 'object':
        return this.matchObject(value, pattern, bindings);
      
      case 'guard': {
        const baseMatch = pattern.patterns && pattern.patterns.length > 0 
          ? this.matchPattern(value, pattern.patterns[0], bindings)
          : true;
        return baseMatch && this.evaluateGuard(pattern.condition, bindings);
      }
      
      default:
        return false;
    }
  }

  private matchLiteral(value: any, patternValue: any): boolean {
    return value === patternValue;
  }

  private matchConstructor(value: any, pattern: Pattern, bindings: Map<string, any>): boolean {
    // Check if value is instance of constructor
    if (!value || typeof value !== 'object') return false;
    
    const className = value.constructor?.name || value.__class;
    if (className !== pattern.name) return false;
    
    // Match constructor parameters if provided
    if (pattern.patterns) {
      // Simplified - in real implementation would extract constructor args
      return pattern.patterns.every((subPattern, index) => {
        const fieldValue = (value as any)[`field${index}`] || (value as any)[index];
        return this.matchPattern(fieldValue, subPattern, bindings);
      });
    }
    
    return true;
  }

  private matchArray(value: any, pattern: Pattern, bindings: Map<string, any>): boolean {
    if (!Array.isArray(value)) return false;
    if (!pattern.patterns) return true;
    
    // Exact length match for now - could be extended for rest patterns
    if (pattern.patterns.length !== value.length) return false;
    
    return pattern.patterns.every((subPattern, index) => 
      this.matchPattern(value[index], subPattern, bindings)
    );
  }

  private matchObject(value: any, pattern: Pattern, bindings: Map<string, any>): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    if (!pattern.properties) return true;
    
    // Check all required properties match
    for (const [key, subPattern] of Object.entries(pattern.properties)) {
      if (!this.matchPattern(value[key], subPattern, bindings)) {
        return false;
      }
    }
    
    return true;
  }

  private evaluateGuard(guard: any, bindings: Map<string, any>): boolean {
    // Simplified guard evaluation - would need proper expression evaluator
    if (typeof guard === 'function') {
      return guard(Object.fromEntries(bindings));
    }
    return !!guard;
  }

  private executeAction(action: any, bindings: Map<string, any>): any {
    if (typeof action === 'function') {
      return action(Object.fromEntries(bindings));
    }
    return action;
  }

  private patternSubsumes(pattern1: Pattern, pattern2: Pattern): boolean {
    // Check if pattern1 is more general than pattern2
    if (pattern1.type === 'wildcard') return true;
    if (pattern1.type !== pattern2.type) return false;
    
    switch (pattern1.type) {
      case 'literal':
        return pattern1.value === pattern2.value;
      case 'constructor':
        return pattern1.name === pattern2.name && 
               this.patternsSubsume(pattern1.patterns || [], pattern2.patterns || []);
      case 'array':
        return this.patternsSubsume(pattern1.patterns || [], pattern2.patterns || []);
      case 'object':
        return this.objectPatternSubsumes(pattern1.properties || {}, pattern2.properties || {});
      default:
        return false;
    }
  }

  private patternsSubsume(patterns1: Pattern[], patterns2: Pattern[]): boolean {
    if (patterns1.length !== patterns2.length) return false;
    return patterns1.every((p1, i) => this.patternSubsumes(p1, patterns2[i]));
  }

  private objectPatternSubsumes(props1: Record<string, Pattern>, props2: Record<string, Pattern>): boolean {
    for (const key in props2) {
      if (!(key in props1) || !this.patternSubsumes(props1[key], props2[key])) {
        return false;
      }
    }
    return true;
  }

  private findMissingPatterns(cases: MatchCase[], valueType: string): Pattern[] {
    const missing: Pattern[] = [];
    
    switch (valueType) {
      case 'boolean': {
        const hasTrue = cases.some(c => this.matchesLiteral(c.pattern, true));
        const hasFalse = cases.some(c => this.matchesLiteral(c.pattern, false));
        const hasWildcard = cases.some(c => c.pattern.type === 'wildcard');
        
        if (!hasWildcard) {
          if (!hasTrue) missing.push({ type: 'literal', value: true });
          if (!hasFalse) missing.push({ type: 'literal', value: false });
        }
        break;
      }
        
      case 'Option': {
        const hasSome = cases.some(c => this.matchesConstructor(c.pattern, 'Some'));
        const hasNone = cases.some(c => this.matchesConstructor(c.pattern, 'None'));
        const hasOptionWildcard = cases.some(c => c.pattern.type === 'wildcard');
        
        if (!hasOptionWildcard) {
          if (!hasSome) missing.push({ type: 'constructor', name: 'Some', patterns: [{ type: 'wildcard' }] });
          if (!hasNone) missing.push({ type: 'constructor', name: 'None' });
        }
        break;
      }
        
      default: {
        // For other types, check if there's a wildcard
        const hasAnyWildcard = cases.some(c => c.pattern.type === 'wildcard');
        if (!hasAnyWildcard) {
          missing.push({ type: 'wildcard' });
        }
        break;
      }
    }
    
    return missing;
  }

  private matchesLiteral(pattern: Pattern, value: any): boolean {
    return pattern.type === 'literal' && pattern.value === value;
  }

  private matchesConstructor(pattern: Pattern, name: string): boolean {
    return pattern.type === 'constructor' && pattern.name === name;
  }
}

// Pattern builder for creating complex patterns
export class PatternBuilder {
  static literal(value: any): Pattern {
    return { type: 'literal', value };
  }

  static identifier(name: string): Pattern {
    return { type: 'identifier', name };
  }

  static wildcard(): Pattern {
    return { type: 'wildcard' };
  }

  static constructorPattern(name: string, patterns?: Pattern[]): Pattern {
    return { type: 'constructor', name, patterns };
  }

  static array(patterns: Pattern[]): Pattern {
    return { type: 'array', patterns };
  }

  static object(properties: Record<string, Pattern>): Pattern {
    return { type: 'object', properties };
  }

  static guard(pattern: Pattern, condition: any): Pattern {
    return { type: 'guard', patterns: [pattern], condition };
  }

  // Convenience methods for common patterns
  static some(innerPattern: Pattern): Pattern {
    return this.constructorPattern('Some', [innerPattern]);
  }

  static none(): Pattern {
    return this.constructorPattern('None');
  }

  static cons(head: Pattern, tail: Pattern): Pattern {
    return this.constructorPattern('Cons', [head, tail]);
  }

  static nil(): Pattern {
    return this.constructorPattern('Nil');
  }
}

// Advanced match expression compiler
export class MatchCompiler {
  compile(matchExpr: { value: any; cases: MatchCase[] }): any {
    const matcher = new PatternMatcher();
    
    // Analyze exhaustiveness
    const analysis = matcher.analyzeExhaustiveness(matchExpr.cases, 'unknown');
    
    if (!analysis.isExhaustive) {
      console.warn('Warning: Pattern match is not exhaustive');
    }
    
    if (analysis.redundantCases.length > 0) {
      console.warn(`Warning: Redundant cases found: ${analysis.redundantCases.join(', ')}`);
    }
    
    return {
      type: 'Match',
      value: matchExpr.value,
      cases: matchExpr.cases,
      analysis,
      execute: (value: any) => matcher.match(value, matchExpr.cases)
    };
  }
}

export { PatternMatcher as default };