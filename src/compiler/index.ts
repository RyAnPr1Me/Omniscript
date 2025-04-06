import * as llvm from 'llvm-bindings';

type CompilerValue = llvm.Value | null;

interface ASTNode {
  type: string;
}

interface FunctionDeclaration extends ASTNode {
  id: { name: string };
  params: any[];
  body: any[];
}

interface ReturnStatement extends ASTNode {
  argument: any;
}

export class Compiler {
  private context: llvm.LLVMContext;
  private module: llvm.Module;
  private builder: llvm.IRBuilder;

  constructor() {
    this.context = new llvm.LLVMContext();
    this.module = new llvm.Module("omniscript", this.context);
    this.builder = new llvm.IRBuilder(this.context);
  }

  compile(ast: any) {
    this.module = new llvm.Module("omniscript", this.context);
    this.visitNode(ast);
    return this.module;
  }

  private visitNode(node: ASTNode): CompilerValue {
    switch (node.type) {
      case 'Program':
        return this.visitProgram(node);
      case 'FunctionDeclaration':
        return this.visitFunctionDeclaration(node);
      case 'ReturnStatement':
        return this.visitReturnStatement(node);
      default:
        return null;
    }
  }

  private visitProgram(node: any) {
    node.body.forEach((n: any) => this.visitNode(n));
  }

  private visitFunctionDeclaration(node: FunctionDeclaration) {
    const returnType = this.context.getVoidTy();
    const paramTypes: llvm.Type[] = [];
    const fnType = llvm.FunctionType.get(returnType, paramTypes, false);
    const fn = this.module.addFunction(node.id.name, fnType);
    
    const entry = fn.addBasicBlock("entry");
    this.builder.setInsertionPoint(entry);
    
    node.body.forEach(stmt => this.visitNode(stmt));
    return fn;
  }

  private visitReturnStatement(node: ReturnStatement): llvm.Value {
    if (node.argument) {
      const value: llvm.Value = this.visitNode(node.argument) as llvm.Value;
      return this.builder.createRet(value);
    }
    return this.builder.createRetVoid();
  }
}
