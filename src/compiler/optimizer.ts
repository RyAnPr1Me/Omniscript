import { debug } from '../debug';

export interface OptimizationPass {
  name: string;
  optimize(bytecode: any): any;
}

export class ConstantFoldingPass implements OptimizationPass {
  name = 'ConstantFolding';

  optimize(bytecode: any): any {
    debug.debug('Optimizer', `Running ${this.name} pass`);
    return this.foldConstants(bytecode);
  }

  private foldConstants(node: any): any {
    if (!node) return node;

    // Handle binary operations with constant operands
    if (node.type === 'BinaryExpression' && node.operator && node.left && node.right) {
      const left = this.foldConstants(node.left);
      const right = this.foldConstants(node.right);

      // Check if both operands are literal values
      if (left.type === 'Literal' && right.type === 'Literal') {
        const leftVal = left.value;
        const rightVal = right.value;

        if (typeof leftVal === 'number' && typeof rightVal === 'number') {
          let result: number;
          switch (node.operator) {
            case '+':
              result = leftVal + rightVal;
              break;
            case '-':
              result = leftVal - rightVal;
              break;
            case '*':
              result = leftVal * rightVal;
              break;
            case '/':
              result = rightVal !== 0 ? leftVal / rightVal : leftVal / rightVal; // Keep division by zero behavior
              break;
            case '%':
              result = rightVal !== 0 ? leftVal % rightVal : NaN;
              break;
            default:
              return { ...node, left, right };
          }
          return { type: 'Literal', value: result };
        }
      }

      return { ...node, left, right };
    }

    // Recursively process other node types
    if (Array.isArray(node)) {
      return node.map(child => this.foldConstants(child));
    }

    if (typeof node === 'object') {
      const result: any = { ...node };
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key) && typeof node[key] === 'object') {
          result[key] = this.foldConstants(node[key]);
        }
      }
      return result;
    }

    return node;
  }
}

export class DeadCodeEliminationPass implements OptimizationPass {
  name = 'DeadCodeElimination';

  optimize(bytecode: any): any {
    debug.debug('Optimizer', `Running ${this.name} pass`);
    return this.eliminateDeadCode(bytecode);
  }

  private eliminateDeadCode(node: any): any {
    if (!node) return node;

    // Remove unreachable code after return statements
    if (node.type === 'Block' && Array.isArray(node.body)) {
      const optimizedBody: any[] = [];
      let foundReturn = false;

      for (const stmt of node.body) {
        if (foundReturn) {
          debug.debug('Optimizer', 'Eliminating unreachable code after return');
          break;
        }
        
        const optimizedStmt = this.eliminateDeadCode(stmt);
        optimizedBody.push(optimizedStmt);

        if (stmt.type === 'ReturnStatement') {
          foundReturn = true;
        }
      }

      return { ...node, body: optimizedBody };
    }

    // Recursively process other node types
    if (Array.isArray(node)) {
      return node.map(child => this.eliminateDeadCode(child));
    }

    if (typeof node === 'object') {
      const result: any = { ...node };
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key) && typeof node[key] === 'object') {
          result[key] = this.eliminateDeadCode(node[key]);
        }
      }
      return result;
    }

    return node;
  }
}

export class InliningPass implements OptimizationPass {
  name = 'Inlining';
  private inlineThreshold = 10; // Inline functions with body length <= 10

  optimize(bytecode: any): any {
    debug.debug('Optimizer', `Running ${this.name} pass`);
    return this.performInlining(bytecode);
  }

  private performInlining(node: any): any {
    if (!node) return node;

    // Simple function call inlining for small functions
    if (node.type === 'CallExpression' && node.callee && node.callee.type === 'Function') {
      const func = node.callee;
      const bodyLength = Array.isArray(func.body) ? func.body.length : 1;

      if (bodyLength <= this.inlineThreshold && func.body) {
        debug.debug('Optimizer', `Inlining function call with body length ${bodyLength}`);
        
        // For simple cases, inline the function body
        if (Array.isArray(func.body) && func.body.length === 1) {
          const bodyStmt = func.body[0];
          if (bodyStmt.type === 'ReturnStatement' && bodyStmt.argument) {
            return this.performInlining(bodyStmt.argument);
          }
        }
      }
    }

    // Recursively process other node types
    if (Array.isArray(node)) {
      return node.map(child => this.performInlining(child));
    }

    if (typeof node === 'object') {
      const result: any = { ...node };
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key) && typeof node[key] === 'object') {
          result[key] = this.performInlining(node[key]);
        }
      }
      return result;
    }

    return node;
  }
}

export class JITOptimizer {
  private passes: OptimizationPass[] = [
    new ConstantFoldingPass(),
    new DeadCodeEliminationPass(),
    new InliningPass()
  ];
  private fastMode = false;

  constructor(fastMode: boolean = false) {
    this.fastMode = fastMode;
  }

  optimize(bytecode: any): any {
    if (this.fastMode) {
      return this.fastOptimize(bytecode);
    }

    debug.info('Optimizer', 'Starting JIT optimization passes');
    debug.time('Optimizer', 'optimization');

    let optimized = bytecode;
    
    for (const pass of this.passes) {
      debug.time('Optimizer', pass.name);
      optimized = pass.optimize(optimized);
      debug.timeEnd('Optimizer', pass.name);
    }

    debug.timeEnd('Optimizer', 'optimization');
    debug.debug('Optimizer', 'Optimization complete');
    
    return optimized;
  }

  fastOptimize(bytecode: any): any {
    // Only run the most essential optimization - constant folding
    // Skip expensive passes like inlining and dead code elimination
    debug.debug('Optimizer', 'Fast optimization - running essential passes only');
    const constantFolding = new ConstantFoldingPass();
    return constantFolding.optimize(bytecode);
  }

  addPass(pass: OptimizationPass): void {
    this.passes.push(pass);
  }

  removePass(passName: string): void {
    this.passes = this.passes.filter(pass => pass.name !== passName);
  }
}