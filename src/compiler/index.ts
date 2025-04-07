import { Program, FunctionDeclaration, ReturnStatement, Expression, ASTNode } from './types';

export class Compiler {
  compile(ast: any) {
    console.log("Starting JIT compilation...");
    return this.visitNode(ast);
  }

  private visitNode(node: ASTNode): any {
    switch (node.type) {
      case 'Program':
        return this.visitProgram(node as Program);
      case 'FunctionDeclaration':
        return this.visitFunctionDeclaration(node as FunctionDeclaration);
      case 'ReturnStatement':
        return this.visitReturnStatement(node as ReturnStatement);
      case 'Expression':
        return this.visitExpression(node as Expression);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private visitProgram(node: Program): any {
    let result: any = null;
    for (const stmt of node.body) {
      result = this.visitNode(stmt);
    }
    return result;
  }

  private visitFunctionDeclaration(node: FunctionDeclaration): any {
    return {
      type: 'Function',
      name: node.id.name,
      params: node.params,
      body: node.body.map(stmt => this.visitNode(stmt)),
      optimized: true // Mark as optimized
    };
  }

  private visitReturnStatement(node: ReturnStatement): any {
    return {
      type: 'Return',
      value: node.argument ? this.visitNode(node.argument) : undefined
    };
  }

  private visitExpression(node: Expression): any {
    return {
      type: 'Value',
      value: node.value
    };
  }
}
