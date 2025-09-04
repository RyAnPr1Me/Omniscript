export type NumberLiteral = { type: "NumberLiteral"; value: number };
export type StringLiteral = { type: "StringLiteral"; value: string };
export type BooleanLiteral = { type: "BooleanLiteral"; value: boolean };
export type Identifier = { type: "Identifier"; name: string };
export type Lambda = {
  type: "Lambda";
  params: string[];
  body: Expression;
  closure?: Env;
};
export type Call = { type: "Call"; callee: Expression; args: Expression[] };
export type Let = {
  type: "Let";
  name: string;
  value: Expression;
  body?: Expression;
  immutable?: boolean;
};
export type Const = {
  type: "Const";
  name: string;
  value: Expression;
  body?: Expression;
};
export type IfExpr = {
  type: "If";
  cond: Expression;
  then: Expression;
  else: Expression;
};
export type Pipe = { type: "Pipe"; left: Expression; right: Expression };
export type Binary = {
  type: "Binary";
  op:
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | ">"
    | "<"
    | ">="
    | "<="
    | "=="
    | "!="
    | "==="
    | "!==";
  left: Expression;
  right: Expression;
};
export type Unary = {
  type: "Unary";
  operator: "typeof" | "-" | "!" | "++" | "--";
  operand: Expression;
};
export type MatchCase = {
  pattern: Expression | { type: "Wildcard" };
  guard?: Expression;
  value: Expression;
};
export type Match = { type: "Match"; expr: Expression; cases: MatchCase[] };
export type AwaitExpr = { type: "Await"; expr: Expression };
export type ReturnExpr = { type: "Return"; expr?: Expression };
export type Decorated = { decorators: string[] };
export type MethodDecl = {
  type: "MethodDecl";
  name: string;
  params: string[];
  body: Expression;
  isOperator?: boolean;
  isAsync?: boolean;
  decorators: string[];
};
export type ClassDecl = {
  type: "ClassDecl";
  name: string;
  methods: MethodDecl[];
  decorators: string[];
};
export type NewInstance = {
  type: "New";
  className: string;
  args: Expression[];
};
export type PropAccess = { type: "Prop"; object: Expression; name: string };
export type ObjectLiteral = {
  type: "ObjectLiteral";
  properties: Record<string, Expression>;
};
export type ArrayLiteral = { type: "ArrayLiteral"; elements: Expression[] };

export type CurriedFunction = {
  type: "CurriedFunction";
  fn: Lambda;
  appliedArgs: Expression[];
};
export type PartialApplication = {
  type: "Partial";
  fn: Expression;
  args: (Expression | null)[];
};
export type LazyExpr = { type: "Lazy"; expr: Expression };
export type MemoizedFunction = { type: "Memo"; fn: Lambda };
export type MaybeType = { type: "Maybe"; value: Expression | null };
export type EitherType = { type: "Either"; isLeft: boolean; value: Expression };
export type ImportDecl = { type: "Import"; imports: string[]; from: string };
export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | Identifier
  | Lambda
  | Call
  | Let
  | Const
  | IfExpr
  | Pipe
  | Binary
  | Unary
  | Match
  | AwaitExpr
  | ReturnExpr
  | ClassDecl
  | NewInstance
  | PropAccess
  | ObjectLiteral
  | ArrayLiteral
  | ImportDecl
  | CurriedFunction
  | PartialApplication
  | LazyExpr
  | MemoizedFunction
  | MaybeType
  | EitherType;
export type Program = { type: "Program"; body: Expression[] };

export interface Env {
  parent?: Env;
  values: Map<string, any>;
  immutable: Set<string>;
}
export function createEnv(parent?: Env): Env {
  return { parent, values: new Map(), immutable: new Set() };
}
export function envDefine(env: Env, name: string, value: any) {
  // Allow overwriting existing bindings (shadow or replace)
  env.values.set(name, value);
  env.immutable.add(name);
}
export function envLookup(env: Env, name: string): any {
  if (env.values.has(name)) return env.values.get(name);
  if (env.parent) return envLookup(env.parent, name);
  throw new Error(`Unbound identifier '${name}'`);
}

export interface LambdaValue {
  __tag: "lambda";
  params: string[];
  body: Expression;
  closure: Env;
  __native?: (...args: any[]) => any;
}
export const isLambdaValue = (v: any): v is LambdaValue =>
  v && v.__tag === "lambda";
