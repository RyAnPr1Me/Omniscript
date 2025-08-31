grammar OmniscriptParser;

program
    : moduleDeclaration? importDeclaration* statement* EOF
    ;

moduleDeclaration
    : MODULE qualifiedName SEMICOLON
    ;

importDeclaration
    : USE (LBRACE IDENTIFIER (COMMA IDENTIFIER)* RBRACE FROM)? STRING SEMICOLON
    ;

statement
    : variableDeclaration
    | functionDeclaration
    | classDeclaration
    | interfaceDeclaration
    | decorator
    | expression
    | returnStatement
    | ifStatement
    | whileStatement
    | forStatement
    | tryStatement
    | throwStatement
    | SEMICOLON                                 // Empty statement
    ;

variableDeclaration
    : (VAR | DEF) IDENTIFIER typeAnnotation? (ASSIGN expression)? SEMICOLON
    ;

decorator
    : AT qualifiedName (LPAREN argumentList? RPAREN)?
    ;

typeAnnotation
    : DOUBLE_COLON type
    ;

type
    : primitiveType
    | arrayType
    | functionType
    | objectType
    | IDENTIFIER
    ;

primitiveType
    : 'number'
    | 'string'
    | 'boolean'
    | 'any'
    | 'void'
    ;

arrayType
    : type LBRACKET RBRACKET
    ;

functionType
    : LPAREN (type (COMMA type)*)? RPAREN ARROW type
    ;

objectType
    : LBRACE (objectTypeProperty (COMMA objectTypeProperty)*)? RBRACE
    ;

objectTypeProperty
    : IDENTIFIER typeAnnotation
    ;

qualifiedName
    : IDENTIFIER (DOT IDENTIFIER)*
    ;

argumentList
    : expression (COMMA expression)*
    ;

expression
    : primary
    | expression DOT IDENTIFIER                          // Member access
    | expression LPAREN argumentList? RPAREN                   // Function call
    | AWAIT expression                                // Await expression
    | NEW IDENTIFIER LPAREN argumentList? RPAREN            // Object creation
    | expression binaryOperator expression              // Binary operation
    | unaryOperator expression                          // Unary operation
    | expression QUESTION expression COLON expression          // Ternary
    | expression NULLISH_COALESCING expression                        // Nullish coalescing
    | expression LOGICAL_OR expression                        // Logical OR
    | expression LOGICAL_AND expression                        // Logical AND
    ;

primary
    : literal
    | IDENTIFIER
    | arrayLiteral
    | objectLiteral
    | templateString
    | LPAREN expression RPAREN
    ;

templateString
    : BACKTICK templateStringContent* BACKTICK
    ;

templateStringContent
    : TEXT
    | DOLLAR_LBRACE expression RBRACE
    ;

arrayLiteral
    : LBRACKET (expression (COMMA expression)*)? RBRACKET
    ;

objectLiteral
    : LBRACE (objectProperty (COMMA objectProperty)*)? RBRACE
    ;

objectProperty
    : IDENTIFIER COLON expression
    | IDENTIFIER
    ;

// Missing rule definitions
literal
    : NUMBER
    | STRING
    | TRUE
    | FALSE
    | NULL
    | UNDEFINED
    ;

binaryOperator
    : PLUS
    | MINUS 
    | MULTIPLY
    | DIVIDE
    | MODULO
    | EQUALS
    | NOT_EQUALS
    | STRICT_EQUALS
    | STRICT_NOT_EQUALS
    | LESS_THAN
    | LESS_EQUAL
    | GREATER_THAN
    | GREATER_EQUAL
    | LOGICAL_AND
    | LOGICAL_OR
    | NULLISH_COALESCING
    ;

unaryOperator
    : NOT
    | MINUS
    | BITWISE_NOT
    | INCREMENT
    | DECREMENT
    | TYPEOF
    ;

functionDeclaration
    : ASYNC? FN IDENTIFIER LPAREN parameterList? RPAREN typeAnnotation? blockStatement
    ;

parameterList
    : parameter (COMMA parameter)*
    ;

parameter
    : IDENTIFIER typeAnnotation?
    ;

blockStatement
    : LBRACE statement* RBRACE
    ;

classDeclaration
    : decorator* OBJECT IDENTIFIER (EXTENDS IDENTIFIER)? LBRACE classMember* RBRACE
    ;

classMember
    : methodDeclaration
    | propertyDeclaration
    | operatorDeclaration
    ;

methodDeclaration
    : decorator* ASYNC? IDENTIFIER LPAREN parameterList? RPAREN typeAnnotation? blockStatement
    ;

propertyDeclaration
    : decorator* IDENTIFIER typeAnnotation? (ASSIGN expression)? SEMICOLON
    ;

operatorDeclaration
    : decorator* OPERATOR binaryOperator LPAREN parameterList RPAREN typeAnnotation? blockStatement
    ;

interfaceDeclaration
    : INTERFACE IDENTIFIER LBRACE interfaceMember* RBRACE
    ;

interfaceMember
    : IDENTIFIER typeAnnotation SEMICOLON
    ;

returnStatement
    : RETURN expression? SEMICOLON
    ;

ifStatement
    : IF LPAREN expression RPAREN statement (ELSE statement)?
    ;

whileStatement
    : WHILE LPAREN expression RPAREN statement
    ;

forStatement
    : FOR LPAREN variableDeclaration expression SEMICOLON expression RPAREN statement
    ;

tryStatement
    : TRY blockStatement (CATCH LPAREN IDENTIFIER RPAREN blockStatement)? (FINALLY blockStatement)?
    ;

throwStatement
    : THROW expression SEMICOLON
    ;

// Keywords (need to be defined before IDENTIFIER)
VAR: 'var';
DEF: 'def';
FN: 'fn';
OBJECT: 'object';
INTERFACE: 'interface';
EXTENDS: 'extends';
IF: 'if';
THEN: 'then';
ELSE: 'else';
MATCH: 'match';
RETURN: 'return';
THROW: 'throw';
TRY: 'try';
CATCH: 'catch';
FINALLY: 'finally';
WHILE: 'while';
FOR: 'for';
ASYNC: 'async';
AWAIT: 'await';
NEW: 'new';
USE: 'use';
FROM: 'from';
MODULE: 'module';
OPERATOR: 'operator';
TRUE: 'true';
FALSE: 'false';
NULL: 'null';
UNDEFINED: 'undefined';
TYPEOF: 'typeof';
IN: 'in';

// Operators and punctuation
ARROW: '=>';
PIPE_ARROW: '|>';
EQUALS: '==';
NOT_EQUALS: '!=';
STRICT_EQUALS: '===';
STRICT_NOT_EQUALS: '!==';
LESS_EQUAL: '<=';
GREATER_EQUAL: '>=';
LOGICAL_AND: '&&';
LOGICAL_OR: '||';
NULLISH_COALESCING: '??';
NULLISH_ASSIGN: '??=';
INCREMENT: '++';
DECREMENT: '--';
PLUS_ASSIGN: '+=';
MINUS_ASSIGN: '-=';
MULT_ASSIGN: '*=';
DIV_ASSIGN: '/=';
MOD_ASSIGN: '%=';

// Single character tokens
PLUS: '+';
MINUS: '-';
MULTIPLY: '*';
DIVIDE: '/';
MODULO: '%';
LESS_THAN: '<';
GREATER_THAN: '>';
ASSIGN: '=';
NOT: '!';
BITWISE_NOT: '~';
QUESTION: '?';
COLON: ':';
DOUBLE_COLON: '::';
SEMICOLON: ';';
COMMA: ',';
DOT: '.';
AT: '@';
LPAREN: '(';
RPAREN: ')';
LBRACE: '{';
RBRACE: '}';
LBRACKET: '[';
RBRACKET: ']';
BACKTICK: '`';
DOLLAR_LBRACE: '${';

// Tokens
IDENTIFIER: [a-zA-Z_][a-zA-Z0-9_]*;
NUMBER: [0-9]+ ('.' [0-9]+)? ([eE] [+-]? [0-9]+)?;
STRING: '"' (~["\r\n\\] | EscapeSequence)* '"';
TEXT: ~[`\\$]+ | EscapeSequence;
fragment EscapeSequence: '\\' [btnfr"'\\];
WS: [ \t\r\n]+ -> skip;
COMMENT: '//' ~[\r\n]* -> skip;
MULTILINE_COMMENT: '/*' .*? '*/' -> skip;
NESTED_COMMENT: '/*' .*? '*/' -> channel(HIDDEN);
