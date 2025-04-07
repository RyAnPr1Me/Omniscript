grammar OmniscriptParser;

program
    : moduleDeclaration? importDeclaration* statement* EOF
    ;

moduleDeclaration
    : 'module' qualifiedName ';'
    ;

importDeclaration
    : 'import' ('{' IDENTIFIER (',' IDENTIFIER)* '}' 'from')? STRING ';'
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
    | ';'                                 // Empty statement
    ;

variableDeclaration
    : ('let' | 'const') IDENTIFIER typeAnnotation? ('=' expression)? ';'
    ;

decorator
    : '@' qualifiedName ('(' argumentList? ')')?
    ;

typeAnnotation
    : ':' type
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
    : type '[]'
    ;

functionType
    : '(' (type (',' type)*)? ')' '=>' type
    ;

objectType
    : '{' (objectTypeProperty (',' objectTypeProperty)*)? '}'
    ;

objectTypeProperty
    : IDENTIFIER typeAnnotation
    ;

qualifiedName
    : IDENTIFIER ('.' IDENTIFIER)*
    ;

argumentList
    : expression (',' expression)*
    ;

expression
    : primary
    | expression '.' IDENTIFIER                          // Member access
    | expression '(' argumentList? ')'                   // Function call
    | 'await' expression                                // Await expression
    | 'new' IDENTIFIER '(' argumentList? ')'            // Object creation
    | expression binaryOperator expression              // Binary operation
    | unaryOperator expression                          // Unary operation
    | expression '?' expression ':' expression          // Ternary
    | expression '??' expression                        // Nullish coalescing
    | expression '||' expression                        // Logical OR
    | expression '&&' expression                        // Logical AND
    ;

primary
    : literal
    | IDENTIFIER
    | arrayLiteral
    | objectLiteral
    | templateString
    | '(' expression ')'
    ;

templateString
    : '`' templateStringContent* '`'
    ;

templateStringContent
    : TEXT
    | '${' expression '}'
    ;

arrayLiteral
    : '[' (expression (',' expression)*)? ']'
    ;

objectLiteral
    : '{' (objectProperty (',' objectProperty)*)? '}'
    ;

objectProperty
    : IDENTIFIER ':' expression
    | IDENTIFIER
    ;

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
