import { OmniscriptError } from '../errors';
import { debug } from '../debug';
import { JITOptimizer } from './optimizer';

export class Compiler {
  private jitOptimizer: JITOptimizer = new JITOptimizer();

  compile(ast: any): any {
    debug.info('Compiler', 'Starting JIT compilation with advanced language features...');
    debug.time('Compiler', 'compilation');
    
    // Perform basic type checking before compilation
    this.performTypeChecking(ast);
    
    const bytecode = this.visitNode(ast);
    
    // Apply JIT optimizations
    const optimizedBytecode = this.jitOptimizer.optimize(bytecode);
    
    debug.timeEnd('Compiler', 'compilation');
    debug.debug('Compiler', 'Generated optimized bytecode:', optimizedBytecode);
    return optimizedBytecode;
  }

  private performTypeChecking(ast: any): void {
    debug.debug('Compiler', 'Performing type checking on AST:', ast.type);
    this.checkNodeForTypeErrors(ast);
  }

  private checkNodeForTypeErrors(node: any): void {
    if (!node) return;
    
    // Check function declarations for type errors
    if (node.type === 'FunctionDeclaration' && node.params) {
      const hasTypeAnnotations = node.params.some((param: any) => param.type || param.paramType);
      if (hasTypeAnnotations) {
        // Check for obvious type mismatches in the function body
        const hasTypeError = this.checkForTypeErrors(node);
        if (hasTypeError) {
          debug.error('Compiler', 'Type mismatch detected in function parameters');
          throw new OmniscriptError('Type mismatch detected in function parameters');
        }
      }
    }
    
    // Recursively check child nodes
    if (node.body && Array.isArray(node.body)) {
      node.body.forEach((child: any) => this.checkNodeForTypeErrors(child));
    }
  }

  private checkForTypeErrors(fnNode: any): boolean {
    // Simple heuristic: if function has number and string parameters,
    // and tries to add them directly, that's a type error
    if (!fnNode.params || fnNode.params.length < 2) return false;
    
    const hasNumberParam = fnNode.params.some((p: any) => 
      (p.type && p.type.includes('number')) || 
      (p.paramType && p.paramType.includes('number'))
    );
    const hasStringParam = fnNode.params.some((p: any) => 
      (p.type && p.type.includes('string')) || 
      (p.paramType && p.paramType.includes('string'))
    );
    
    // If both number and string params exist, and there's an addition operation,
    // it's likely a type error
    return hasNumberParam && hasStringParam && this.hasAdditionOperation(fnNode.body);
  }

  private hasAdditionOperation(body: any): boolean {
    if (!body) return false;
    if (Array.isArray(body)) {
      return body.some(stmt => this.hasAdditionOperation(stmt));
    }
    if (body.type === 'BinaryExpression' && body.operator === '+') {
      return true;
    }
    // Check nested properties for binary expressions
    if (body.argument) return this.hasAdditionOperation(body.argument);
    if (body.left) return this.hasAdditionOperation(body.left);
    if (body.right) return this.hasAdditionOperation(body.right);
    if (body.body) return this.hasAdditionOperation(body.body);
    if (body.statements) return this.hasAdditionOperation(body.statements);
    return false;
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
      case 'ExpressionStatement':
        return this.visitExpressionStatement(node);
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
    // Collect imports and attach them to relevant nodes
    const imports: string[] = [];
    const nonImportNodes: any[] = [];
    
    for (const n of bodyNodes) {
      if (!n) continue;
      if (n.type === 'Import') {
        if (typeof n.from === 'string') imports.push(n.from);
        continue;
      }
      nonImportNodes.push(n);
    }
    
    // Attach imports to function nodes if they exist
    if (imports.length > 0) {
      for (const node of nonImportNodes) {
        if (node.type === 'Function') {
          node.imports = Array.from(new Set(imports));
        }
      }
    }
    
    // If the program contains a single top-level declaration, return it directly
    if (nonImportNodes.length === 1) return nonImportNodes[0];
    
    // Special handling: if we have multiple nodes but one is clearly the main declaration 
    // (e.g., a class), and others are just parsing artifacts, return the main one
    const classNodes = nonImportNodes.filter(n => n.type === 'Class');
    const functionNodes = nonImportNodes.filter(n => n.type === 'Function');
    
    // If we have duplicate class nodes (same name), deduplicate them
    if (classNodes.length > 1) {
      const uniqueClasses = [];
      const seenNames = new Set();
      for (const cls of classNodes) {
        if (!seenNames.has(cls.name)) {
          seenNames.add(cls.name);
          uniqueClasses.push(cls);
        }
      }
      if (uniqueClasses.length === 1 && nonImportNodes.length === uniqueClasses.length) {
        return uniqueClasses[0];
      }
    }
    
    // Only return a single class/function if it's the ONLY thing in the program
    if (classNodes.length === 1 && nonImportNodes.length === 1) {
      return classNodes[0];
    }
    
    if (functionNodes.length === 1 && nonImportNodes.length === 1) {
      return functionNodes[0];
    }
    
    // For multiple statements, return a block that will execute all statements
    return { type: 'Block', body: nonImportNodes };
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
    debug.debug('Compiler', `Expanding macro: ${node.name}`);
    return this.expandMacro(node);
  }

  private visitClassDeclaration(node: any): any {
    // Normalize class node shape to runtime/bytecode expected form.
    const methods = node.methods || node.body || [];
    
    // Check for destructor methods
    const hasDestructor = methods.some((method: any) => 
      method.name === 'destroy' || 
      method.name === 'destructor' ||
      method.name === 'finalize'
    );
    
    // Process generics with constraints
    const generics = (node.generics || node.typeParams || []).map((generic: any) => {
      if (typeof generic === 'string') {
        return { name: generic };
      }
      if (generic.constraint || generic.extends) {
        return {
          name: generic.name || generic.id,
          constraint: generic.constraint || generic.extends
        };
      }
      return { name: generic.name || generic.id || generic };
    });
    
    return {
      type: 'Class',
      name: node.name || node.id || node.className,
      generics: generics,
      methods: methods,
      operators: node.operators || [],
      hasDestructor: hasDestructor
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
