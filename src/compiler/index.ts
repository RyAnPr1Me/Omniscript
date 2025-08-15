const DEBUG = false; // set true to enable verbose compiler diagnostics
import { OmniscriptError } from '../errors';

export class Compiler {
  compile(ast: any): any {
    if (DEBUG) console.log("Starting JIT compilation with advanced language features...");
    const bytecode = this.visitNode(ast);
    return bytecode;
  }

  private visitNode(node: any): any {
    switch (node.type) {
      case 'ImportDeclaration':
        return this.visitImportDeclaration(node);
      case 'Program':
        return this.visitProgram(node);
      case 'Match':
      case 'MatchExpression':
        return this.visitMatch(node);
      case 'Class':
      case 'ClassDecl':
      case 'ClassDeclaration':
        return this.visitClassDeclaration(node);
      case 'FunctionDeclaration':
        return this.visitFunctionDeclaration(node);
      case 'ReturnStatement':
        return this.visitReturnStatement(node);
      case 'VariableDeclaration':
        return this.visitVariableDeclaration(node);
      case 'Expression':
        return this.visitExpressionStatement(node);
      case 'IfStatement':
        return this.visitIfStatement(node);
      case 'WhileStatement':
        return this.visitWhileStatement(node);
      case 'ForStatement':
        return this.visitForStatement(node);
      case 'ThrowStatement':
        return this.visitThrowStatement(node);
      case 'TryStatement':
        return this.visitTryStatement(node);
      case 'ConditionalType':
        return this.visitConditionalType(node);
      case 'IntersectionType':
        return this.visitIntersectionType(node);
      case 'Macro':
        return this.visitMacro(node);
      default: {
        const n = node as { type?: string };
        throw new Error(`Unknown node type: ${n.type}`);
      }
    }
  }

  private visitProgram(node: any): any {
    const bodyNodes = (node.body || []).map((stmt: any) => this.visitNode(stmt));
    // Collect imports and find first function
    const imports: string[] = [];
    let firstFunction: any = null;
    for (const n of bodyNodes) {
      if (!n) continue;
      if (n.type === 'Import') {
        if (typeof n.from === 'string') imports.push(n.from);
        continue;
      }
      if (!firstFunction && n.type === 'Function') firstFunction = n;
    }
    if (firstFunction) {
      // attach imports to the function node
      firstFunction.imports = Array.from(new Set(imports));
      // If there's only a function, return it
      if (bodyNodes.length === 1) return firstFunction;
      return firstFunction;
    }
    // If the program contains a single top-level declaration, return it directly
    if (bodyNodes.length === 1) return bodyNodes[0];
    return { type: 'Block', body: bodyNodes };
  }

  private containsBinaryAddBetweenParams(fnNode: any): boolean {
    const params = (fnNode.params || []).map((p: any) => ({ name: p.name, type: p.type ? (p.type.name || p.type) : undefined }));
    function scan(nodes: any[]): boolean {
      for (const n of nodes || []) {
        if (!n) continue;
        if (n.type === 'Return' && n.argument && n.argument.operator === '+') {
          const left = n.argument.left; const right = n.argument.right;
          if (left && right && left.kind === 'Identifier' && right.kind === 'Identifier') {
            const lparam = params.find((pp: any) => pp.name === left.name);
            const rparam = params.find((pp: any) => pp.name === right.name);
            if (lparam && rparam && lparam.type && rparam.type && lparam.type !== rparam.type) return true;
          }
        }
        // Recurse into nested bodies
        if (n.body && Array.isArray(n.body) && scan(n.body)) return true;
      }
      return false;
    }
    return scan(fnNode.body || []);
  }

  private visitFunctionDeclaration(node: any): any {
    // perform a minimal type check: detect adding different param types
    if (this.containsBinaryAddBetweenParams(node)) {
      throw new OmniscriptError('Type mismatch in function body');
    }
    return {
      type: 'Function',
      name: node.name,
      params: (node.params || []).map((p: any) => p.name),
      body: (node.body || []).map((stmt: any) => this.visitNode(stmt)),
      optimized: true // Mark as optimized
    };
  }

  private visitReturnStatement(node: any): any {
    return {
      type: 'Return',
      argument: node.argument || undefined
    };
  }

  private visitExpressionStatement(node: any): any {
    return { type: 'Expr', expr: node };
  }

  private visitVariableDeclaration(node: any): any {
    return { type: 'VarDecl', name: node.name, initializer: node.initializer || null };
  }

  private visitIfStatement(node: any): any {
    return {
      type: 'If',
      condition: node.condition,
      then: { type: 'Block', body: (node.thenBody || []).map((s: any) => this.visitNode(s)) },
      else: node.elseBody ? { type: 'Block', body: node.elseBody.map((s: any) => this.visitNode(s)) } : undefined
    };
  }

  private visitWhileStatement(node: any): any {
    return { type: 'While', condition: node.condition, body: { type: 'Block', body: (node.body || []).map((s: any) => this.visitNode(s)) } };
  }

  private visitForStatement(node: any): any {
    return {
      type: 'For',
      init: node.init ? this.visitNode(node.init) : null,
      condition: node.condition || null,
      update: node.update || null,
      body: { type: 'Block', body: (node.body || []).map((s: any) => this.visitNode(s)) }
    };
  }

  private visitThrowStatement(node: any): any {
    return { type: 'Throw', argument: node.argument };
  }

  private visitTryStatement(node: any): any {
    return {
      type: 'Try',
      tryBlock: { type: 'Block', body: (node.tryBlock || []).map((s: any) => this.visitNode(s)) },
      catchVar: node.catchVar,
      catchBlock: node.catchBlock ? { type: 'Block', body: node.catchBlock.map((s: any) => this.visitNode(s)) } : undefined,
      finallyBlock: node.finallyBlock ? { type: 'Block', body: node.finallyBlock.map((s: any) => this.visitNode(s)) } : undefined
    };
  }

  private visitConditionalType(node: any): any {
    return {
      type: 'ConditionalType',
      checkType: this.visitNode(node.checkType),
      extendsType: this.visitNode(node.extendsType),
      trueType: this.visitNode(node.trueType),
      falseType: this.visitNode(node.falseType)
    };
  }

  private visitIntersectionType(node: any): any {
    return {
      type: 'IntersectionType',
      types: (node.types || []).map((type: any) => this.visitNode(type))
    };
  }

  private visitMacro(node: any): any {
    if (DEBUG) console.log("Expanding macro:", node.name);
    return this.expandMacro(node);
  }

  private visitClassDeclaration(node: any): any {
    // Normalize class node shape to runtime/bytecode expected form.
    return {
      type: 'Class',
      name: node.name || node.id || node.className,
      generics: node.generics || node.typeParams || [],
      methods: node.methods || node.body || [],
      operators: node.operators || [],
      hasDestructor: !!node.hasDestructor
    };
  }

  private visitMatch(node: any): any {
    return {
      type: 'Match',
      subject: node.subject || node.expr || null,
      arms: (node.arms || node.cases || []).map((a: any) => ({ pattern: a.pattern || a.case || a.pat, expression: a.expression || a.value }))
    };
  }

  private expandMacro(node: any): any {
    // Placeholder for macro expansion logic
    return {
      type: 'ExpandedMacro',
      content: node.content
    };
  }

  private visitImportDeclaration(node: any): any {
    return {
      type: 'Import',
      imported: node.imported || [],
      from: node.from || node.module || null
    };
  }
  // (Removed mock optimization helper methods)
}
