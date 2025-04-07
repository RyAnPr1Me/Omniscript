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

export interface ClassDeclaration extends ASTNode {
  type: 'ClassDeclaration';
  id: { name: string };
  superClass?: { name: string };
  implements?: { name: string }[];
  body: ClassMember[];
}

export interface InterfaceDeclaration extends ASTNode {
  type: 'InterfaceDeclaration';
  id: { name: string };
  extends?: { name: string }[];
  body: InterfaceMember[];
}

export interface MethodDeclaration extends ASTNode {
  type: 'MethodDeclaration';
  id: { name: string };
  params: Parameter[];
  returnType?: string;
  body: ASTNode[];
  modifiers: string[];
}

export interface PropertyDeclaration extends ASTNode {
  type: 'PropertyDeclaration';
  id: { name: string };
  typeAnnotation?: string;
  initializer?: Expression;
  modifiers: string[];
}

export interface TypeAnnotation extends ASTNode {
  type: 'TypeAnnotation';
  typeAnnotation: string | ObjectType | ArrayType | FunctionType;
}

export interface ClassMember extends ASTNode {
  type: 'ClassMember';
  modifiers: string[];
  declaration: MethodDeclaration | PropertyDeclaration;
}

export interface InterfaceMember extends ASTNode {
  type: 'InterfaceMember';
  name: string;
  typeAnnotation: TypeAnnotation;
}

export interface ObjectType extends ASTNode {
  type: 'ObjectType';
  properties: { [key: string]: TypeAnnotation };
}

export interface ArrayType extends ASTNode {
  type: 'ArrayType';
  elementType: TypeAnnotation;
}

export interface FunctionType extends ASTNode {
  type: 'FunctionType';
  parameters: TypeAnnotation[];
  returnType: TypeAnnotation;
}

export interface GenericParameter extends ASTNode {
  type: 'GenericParameter';
  name: string;
  constraint?: TypeAnnotation;
}

export interface MatchExpression extends ASTNode {
  type: 'MatchExpression';
  subject: Expression;
  arms: MatchArm[];
}

export interface MatchArm extends ASTNode {
  type: 'MatchArm';
  pattern: Pattern;
  expression: Expression;
}

export interface Pattern extends ASTNode {
  type: 'Pattern';
  kind: 'literal' | 'variable' | 'wildcard' | 'or' | 'object' | 'array';
  value?: any;
  subPatterns?: Pattern[];
}

export interface Decorator extends ASTNode {
  type: 'Decorator';
  name: string;
  arguments?: Expression[];
}

export interface OperatorDeclaration extends ASTNode {
  type: 'OperatorDeclaration';
  operator: string;
  params: Parameter[];
  returnType?: TypeAnnotation;
  body: ASTNode[];
}
