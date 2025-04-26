/**
 * Enum representing the allowed kinds of expressions in the AST.
 * Use these values to discriminate expression nodes.
 *
 * @example
 * if(node.kind === ExpressionKind.Literal) { ... }
 */
export enum ExpressionKind {
	Binary = "Binary",
	Unary = "Unary",
	Literal = "Literal",
	Identifier = "Identifier",
	Call = "Call",
	MemberAccess = "MemberAccess",
	ArrayLiteral = "ArrayLiteral",
	ObjectLiteral = "ObjectLiteral",
	Ternary = "Ternary" // New: ternary expressions
}

/**
 * Enum representing common operators in expressions.
 * Extend this enum as new operators get supported.
 *
 * @example
 * if(operator === Operator.Plus) { ... }
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
 * Tokens serve as the basic units inserted into the parser.
 *
 * @property text - The exact text of the token.
 * @property type - A numeric code identifying the token type.
 * @property line - The line number in the source where the token occurs (1-indexed).
 * @property column - The column position (0-indexed) where the token starts.
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
 * Represents an input stream for the parser.
 * Provides facilities for looking ahead and retrieving tokens.
 *
 * @example
 * const lookahead = parserInput.LA(1);
 */
export interface ParserInput {
	/**
	 * Look ahead by the given offset.
	 * @param offset - The number of tokens to look ahead (1 returns the next token).
	 * @returns The token type code at that offset.
	 */
	LA(offset: number): number;
	/**
	 * Get the token at the given lookahead offset.
	 * @param offset - The number of tokens to look ahead.
	 * @returns The Token object.
	 */
	LT(offset: number): Token;
}

/**
 * Base interface for all nodes in the Abstract Syntax Tree (AST).
 *
 * @property type - Discriminator for the node type.
 * @property line - The line in the source code where the node begins.
 * @property column - The column in the source code where the node begins.
 */
export interface ASTNode {
	/** A string identifying the type of AST node. */
	type: string;
	/** Line number where the node starts. */
	line: number;
	/** Column number where the node starts. */
	column: number;
	/** Subject expression for match expressions. */
	subject?: Expression;
	/** Arms for match expressions. */
	arms?: MatchArm[];
}

/**
 * Represents a match arm in a match expression.
 *
 * @property pattern - The pattern to match against.
 * @property body - The statements to execute if the pattern matches.
 */
export interface MatchArm {
	/** The pattern expression to match against. */
	pattern: Expression;
	/** The statements to execute if the pattern matches. */
	body: Statement[];
}

/**
 * Represents the root of the AST, corresponding to an entire program.
 *
 * @property type - Always the literal 'Program'.
 * @property body - An array of statement nodes composing the program.
 */
export interface Program extends ASTNode {
	/** Constant discriminant for a program node. */
	type: 'Program';
	/** An array of statements that make up the program. */
	body: Statement[];
}

/**
 * Represents a statement node in the AST.
 * A statement can be a variable declaration, function declaration, decorator, or expression.
 */
export interface Statement extends ASTNode {
	/** Discriminated type identifying the statement kind. */
	type: 'VariableDeclaration' | 'FunctionDeclaration' | 'Decorator' | 'Expression';
}

/**
 * Represents an expression node in the AST.
 *
 * @property kind - Specifies the particular kind of expression (see ExpressionKind).
 * @property operator - For binary and unary expressions, this holds the operator used.
 * @property left - For binary or unary expressions, the operand on the left.
 * @property right - For binary expressions, the operand on the right.
 * @property value - For literal expressions, the actual value (string, number, boolean, or null).
 * @property name - For identifier expressions, the variable or function name.
 * @property arguments - For call expressions, the list of argument expressions.
 * @property object - For member access expressions, the object being accessed.
 * @property member - For member access expressions, the property name.
 * @property elements - For array literals, the elements contained in the array.
 * @property properties - For object literals, key-value pairs.
 * @property callee - For call expressions, the function being called.
 */
export interface Expression extends ASTNode {
	/** Constant discriminant for an expression node. */
	type: 'Expression';
	/** The kind of expression. */
	kind: ExpressionKind;
	/** Operator used (if applicable). */
	operator?: Operator | '??=';
	/** Left-hand side expression (if applicable). */
	left?: Expression;
	/** Right-hand side expression (if applicable). */
	right?: Expression;
	/**
	 * The literal value of the expression.
	 * Allowed types: string, number, boolean, or null.
	 */
	value?: string | number | boolean | null; // Updated to include null
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
	/** Condition for ternary expressions. */
	condition?: Expression;
	/** True expression for ternary expressions. */
	trueExpr?: Expression;
	/** False expression for ternary expressions. */
	falseExpr?: Expression;
}

/**
 * Represents a variable declaration statement.
 *
 * @property name - The identifier for the variable being declared.
 * @property varType - A string representation of the variable's type, if specified.
 * @property initializer - The expression assigned to the variable, if any.
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
 * Decorators can modify or annotate classes, methods, or properties.
 *
 * @property name - The decorator's identifier name.
 * @property arguments - Optional arguments passed to the decorator.
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
 * Interface for representing errors or diagnostic messages in the AST.
 * Useful during parsing and type checking for reporting malformed syntax.
 *
 * @property message - A human-readable description of the error.
 * @property line - The line number in the source where the error was detected.
 * @property column - The column in the source where the error was detected.
 * @property details - Optional additional context or data regarding the error.
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
	/** Optional error code for categorizing the error. */
	errorCode?: string;
	/** Optional suggestions for fixing the error. */
	suggestions?: string[];
	/** Optional source of the error. */
	source?: string;
}

/**
 * Represents a function declaration in the AST.
 * Supports generic type parameters and async functions.
 */
export interface FunctionDeclaration extends Statement {
	type: 'FunctionDeclaration';
	name: string;
	generics?: GenericParameter[];
	params: Parameter[];
	returnType: TypeReference;
	body: Statement[];
	isAsync: boolean;
}

/**
 * Represents a generic type parameter with optional constraints.
 */
export interface GenericParameter {
	name: string;
	constraint?: TypeReference;
	default?: TypeReference;
}

/**
 * Represents a parameter in a function declaration.
 */
export interface Parameter {
	name: string;
	type: TypeReference;
	optional: boolean;
	defaultValue?: Expression;
}

/**
 * Represents a type reference which can be a simple type name
 * or a complex generic type with type arguments.
 */
export interface TypeReference {
	name: string;
	typeArguments?: TypeReference[];
	isArray?: boolean;
	isUnion?: boolean;
	unionTypes?: TypeReference[];
}
