import { OmniscriptError } from '../errors';

export class TypeChecker {
  check(ast: any) {
    const errors: any[] = [];
    this.visitNode(ast, errors);
    
    if (errors.length > 0) {
      throw new OmniscriptError(`Type errors found: ${errors.map(e => e.message).join(', ')}`);
    }
    
    return {
      errors: []
    };
  }

  private visitNode(node: any, errors: any[]): void {
    if (!node) return;
    
    switch (node.type) {
      case 'Program':
        if (node.body) {
          node.body.forEach((stmt: any) => this.visitNode(stmt, errors));
        }
        break;
      case 'VariableDeclaration':
        this.checkVariableDeclaration(node, errors);
        break;
      case 'FunctionDeclaration':
        if (node.body) {
          node.body.forEach((stmt: any) => this.visitNode(stmt, errors));
        }
        break;
      default:
        // Recursively visit nested nodes
        if (Array.isArray(node.body)) {
          node.body.forEach((stmt: any) => this.visitNode(stmt, errors));
        }
    }
  }

  private checkVariableDeclaration(node: any, errors: any[]): void {
    if (node.varType && node.initializer) {
      const expectedType = node.varType;
      const actualType = this.inferType(node.initializer);
      
      if (expectedType !== actualType) {
        errors.push({
          message: `Type mismatch: expected ${expectedType} but got ${actualType}`,
          line: node.line || 0,
          column: node.column || 0
        });
      }
    }
  }

  private inferType(expr: any): string {
    if (!expr) return 'unknown';
    
    if (expr.type === 'Expression') {
      switch (expr.kind) {
        case 'Literal':
          if (typeof expr.value === 'number') return 'number';
          if (typeof expr.value === 'string') return 'string';
          if (typeof expr.value === 'boolean') return 'boolean';
          return 'unknown';
        case 'Identifier':
          return 'unknown'; // Would need symbol table for proper inference
        default:
          return 'unknown';
      }
    }
    
    return 'unknown';
  }

  validateType(expected: string, actual: string, line: number = 0, column: number = 0) {
    if (expected !== actual) {
      throw new OmniscriptError(`Expected type ${expected} but got ${actual}`, line, column);
    }
  }
}
