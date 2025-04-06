export interface ASTNode {
  type: string;
}

export interface Program extends ASTNode {
  type: 'Program';
  body: ASTNode[];
}

export interface FunctionDeclaration extends ASTNode {
  type: 'FunctionDeclaration';
  id: { name: string };
  params: Parameter[];
  body: ASTNode[];
}

export interface Parameter extends ASTNode {
  type: 'Parameter';
  name: string;
  typeAnnotation?: string;
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  argument: Expression | null;
}

export interface Expression extends ASTNode {
  type: 'Expression';
  value: any;
}
