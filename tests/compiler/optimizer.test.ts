import { JITOptimizer, ConstantFoldingPass, DeadCodeEliminationPass, InliningPass } from '../../src/compiler/optimizer';

describe('JIT Optimizer', () => {
  let optimizer: JITOptimizer;

  beforeEach(() => {
    optimizer = new JITOptimizer();
  });

  describe('ConstantFoldingPass', () => {
    it('should fold constant additions', () => {
      const input = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 3 }
      };

      const result = optimizer.optimize(input);
      expect(result).toEqual({ type: 'Literal', value: 8 });
    });

    it('should fold constant multiplications', () => {
      const input = {
        type: 'BinaryExpression',
        operator: '*',
        left: { type: 'Literal', value: 4 },
        right: { type: 'Literal', value: 6 }
      };

      const result = optimizer.optimize(input);
      expect(result).toEqual({ type: 'Literal', value: 24 });
    });

    it('should not fold non-constant expressions', () => {
      const input = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 3 }
      };

      const result = optimizer.optimize(input);
      expect(result.type).toBe('BinaryExpression');
      expect(result.left.type).toBe('Identifier');
    });
  });

  describe('DeadCodeEliminationPass', () => {
    it('should eliminate code after return statements', () => {
      const input = {
        type: 'Block',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
          { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 3 } }
        ]
      };

      const result = optimizer.optimize(input);
      expect(result.body).toHaveLength(2);
      expect(result.body[1].type).toBe('ReturnStatement');
    });

    it('should preserve code when no return statement is present', () => {
      const input = {
        type: 'Block',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } }
        ]
      };

      const result = optimizer.optimize(input);
      expect(result.body).toHaveLength(2);
    });
  });

  describe('InliningPass', () => {
    it('should handle simple function inlining', () => {
      const input = {
        type: 'CallExpression',
        callee: {
          type: 'Function',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Literal', value: 42 }
            }
          ]
        }
      };

      const result = optimizer.optimize(input);
      // The inlining pass should extract the return value
      expect(result.type).toBe('Literal');
      expect(result.value).toBe(42);
    });

    it('should not inline large functions', () => {
      const largeBody = Array.from({ length: 15 }, (_, i) => ({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: i }
      }));

      const input = {
        type: 'CallExpression',
        callee: {
          type: 'Function',
          body: largeBody
        }
      };

      const result = optimizer.optimize(input);
      expect(result.type).toBe('CallExpression');
    });
  });

  describe('Optimization Pipeline', () => {
    it('should apply multiple optimizations', () => {
      const input = {
        type: 'Block',
        body: [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 10 },
            right: { type: 'Literal', value: 5 }
          },
          { type: 'ReturnStatement', argument: { type: 'Literal', value: 'result' } },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'unreachable' } }
        ]
      };

      const result = optimizer.optimize(input);
      
      // Should fold constants and eliminate dead code
      expect(result.body).toHaveLength(2);
      expect(result.body[0].type).toBe('Literal');
      expect(result.body[0].value).toBe(15);
      expect(result.body[1].type).toBe('ReturnStatement');
    });
  });

  describe('Optimizer Configuration', () => {
    it('should allow adding custom passes', () => {
      const customPass = {
        name: 'CustomPass',
        optimize: jest.fn((bytecode) => bytecode)
      };

      optimizer.addPass(customPass);
      const input = { type: 'Literal', value: 42 };
      
      optimizer.optimize(input);
      expect(customPass.optimize).toHaveBeenCalled();
    });

    it('should allow removing passes', () => {
      optimizer.removePass('ConstantFolding');
      
      const input = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 3 }
      };

      const result = optimizer.optimize(input);
      // Without constant folding, should remain as binary expression
      expect(result.type).toBe('BinaryExpression');
    });
  });
});