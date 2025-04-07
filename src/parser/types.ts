/**
 * Enum representing the allowed kinds of expressions.
 */
export enum ExpressionKind {
	Binary = "Binary",
	Unary = "Unary",
	Literal = "Literal",
	Identifier = "Identifier",
	Call = "Call",
	MemberAccess = "MemberAccess",
	ArrayLiteral = "ArrayLiteral",
	ObjectLiteral = "ObjectLiteral"
}

/**
 * Enum representing common operators.
 * (Extend as needed.)
 */
export enum Operator {
	Plus = "+",
	Minus = "-",
	Multiply = "*",
	Divide = "/",
	Modulo = "%",
	Equal = "==",
	NotEqual = "!=",
	LessThan = "<",
	GreaterThan = ">",
	And = "&&",
	Or = "||"
}

/**
 * Represents a token produced by the lexer.
 */
export interface Token {
	/** The textual representation of the token. */
	text: string;
	/** The numeric type identifier for the token. */
	type: number;
	/** Line number where the token occurs. */
	line: number;
	/** Column number where the token occurs. */
	column: number;
}

/**
 * Represents an input to the parser.
 */
export interface ParserInput {
	/**
	 * Look ahead by the given offset.
	 * @param offset Number of tokens to look ahead.
	 */
	LA(offset: number): number;
	/**
	 * Get the token at the given offset.
	 * @param offset Number of tokens to look ahead.
	 */
	LT(offset: number): Token;
}

/**
 * Base interface for all AST nodes.
 */
export interface ASTNode {
	/** A string identifying the type of AST node. */
	type: string;
	/** Line number where the node starts. */
	line: number;
	/** Column number where the node starts. */
	column: number;
}

/**
 * Represents the entire program AST.
 */
export interface Program extends ASTNode {
	/** Constant discriminant for a program node. */
	type: 'Program';
	/** An array of statements that make up the program. */
	body: Statement[];
}

/**
 * Represents a statement in the AST.
 */
export interface Statement extends ASTNode {
	/** Discriminated type identifying the statement kind. */
	type: 'VariableDeclaration' | 'FunctionDeclaration' | 'Decorator' | 'Expression';
}

/**
 * Represents an expression in the AST.
 */
export interface Expression extends ASTNode {
	/** Constant discriminant for an expression node. */
	type: 'Expression';
	/** The kind of expression. */
	kind: ExpressionKind;
	/** Operator used (if applicable). */
	operator?: Operator;
	/** Left-hand side expression (if applicable). */
	left?: Expression;
	/** Right-hand side expression (if applicable). */
	right?: Expression;
	/**
	 * The literal value of the expression.
	 * Allowed types: string, number, or boolean.
	 */
	value?: string | number | boolean;
	/** Name for identifier expressions. */
	name?: string;
	/** Array of arguments for call expressions. */
	arguments?: Expression[];
	/** The object for member access expressions. */
	object?: Expression;
	/** The member name for member access expressions. */
	member?: string;
	/** Elements for array literal expressions. */
	elements?: Expression[];
	/** Properties for object literal expressions. */
	properties?: { key: string; value: Expression }[];
	/** The function or method callee for call expressions. */
	callee?: Expression;
}

/**
 * Represents a variable declaration statement.
 */
export interface VariableDeclaration extends Statement {
	/** Constant discriminant for a variable declaration. */
	type: 'VariableDeclaration';
	/** The identifier name. */
	name: string;
	/** The type annotation, if any. */
	varType: string | null;
	/** The initializer expression, if present. */
	initializer: Expression | null;
}

/**
 * Represents a decorator applied to a declaration.
 */
export interface Decorator extends Statement {
	/** Constant discriminant for a decorator node. */
	type: 'Decorator';
	/** The decorator's identifier name. */
	name: string;
	/** An array of arguments for the decorator function call. */
	arguments: Expression[] | null;
}

/**
 * Interface for AST errors or diagnostic messages.
 */
export interface ASTError {
	/** The error message describing the issue. */
	message: string;
	/** The line number where the error occurred. */
	line: number;
	/** The column number where the error occurred. */
	column: number;
	/** Optional additional information about the error. */
	details?: string;
}
