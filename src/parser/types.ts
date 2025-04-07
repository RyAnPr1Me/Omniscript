export interface Token {
  text: string;
  type: number;
  line: number;
  column: number;
}

export interface ParserInput {
  LA(offset: number): number;
  LT(offset: number): Token;
}

export interface ASTNode {
  type: string;
  line: number;
  column: number;
}

export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

export interface Statement extends ASTNode {
  type: 'VariableDeclaration' | 'FunctionDeclaration' | 'Decorator' | 'Expression';
}

export interface Expression extends ASTNode {
  type: 'Expression';
  kind: 'Binary' | 'Unary' | 'Literal' | 'Identifier' | 'Call';
  operator?: string;
  left?: Expression;
  right?: Expression;
  value?: any;
  name?: string;
  arguments?: Expression[];
}

export interface VariableDeclaration extends Statement {
  type: 'VariableDeclaration';
  name: string;
  varType: string | null;
  initializer: Expression | null;
}

export interface Decorator extends Statement {
  type: 'Decorator';
  name: string;
  arguments: Expression[] | null;
}
