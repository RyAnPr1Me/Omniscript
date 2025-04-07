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

// Add generic support
typeParameters
    : '<' IDENTIFIER (',' IDENTIFIER)* '>'
    ;

// Add pattern matching
matchExpression
    : 'match' expression '{' matchArm* '}'
    ;

matchArm
    : pattern '=>' expression ','?
    ;

pattern
    : literal                            // Literal pattern
    | IDENTIFIER                         // Variable pattern
    | '_'                               // Wildcard pattern
    | pattern '|' pattern               // Or pattern
    | '{' IDENTIFIER ':' pattern '}'    // Object pattern
    | '[' pattern (',' pattern)* ']'    // Array pattern
    ;

// Add decorator support
decorator
    : '@' qualifiedName ('(' argumentList? ')')?
    ;

// Add operator overloading
operatorDeclaration
    : 'operator' ('+' | '-' | '*' | '/') '(' parameterList ')' typeAnnotation? block
    ;

// Add async/await
asyncFunctionDeclaration
    : 'async' functionDeclaration
    ;

classDeclaration
    : decorator*
      'class' IDENTIFIER typeParameters?
      ('extends' IDENTIFIER typeArguments?)?
      ('implements' IDENTIFIER typeArguments? (',' IDENTIFIER typeArguments?)*)?
      classBody
    ;

classBody
    : '{' classMember* '}'
    ;

classMember
    : modifier* (methodDeclaration | propertyDeclaration)
    ;

modifier
    : 'public'
    | 'private'
    | 'protected'
    | 'static'
    | 'async'
    ;

methodDeclaration
    : IDENTIFIER '(' parameterList? ')' typeAnnotation? block
    ;

propertyDeclaration
    : IDENTIFIER typeAnnotation? ('=' expression)? ';'
    ;

interfaceDeclaration
    : 'interface' IDENTIFIER ('extends' IDENTIFIER (',' IDENTIFIER)*)? interfaceBody
    ;

interfaceBody
    : '{' interfaceMember* '}'
    ;

interfaceMember
    : IDENTIFIER typeAnnotation ';'
    | methodSignature
    ;

methodSignature
    : IDENTIFIER '(' parameterList? ')' typeAnnotation? ';'
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

templateString
    : '`' templateStringContent* '`'
    ;

templateStringContent
    : TEXT
    | '${' expression '}'
    ;

argumentList
    : expression (',' expression)*
    ;

qualifiedName
    : IDENTIFIER ('.' IDENTIFIER)*
    ;

ifStatement
    : 'if' '(' expression ')' block ('else' (ifStatement | block))?
    ;

whileStatement
    : 'while' '(' expression ')' block
    ;

forStatement
    : 'for' '(' (variableDeclaration | expression)? ';' expression? ';' expression? ')' block
    ;

tryStatement
    : 'try' block catchClause+ finallyClause?
    ;

catchClause
    : 'catch' '(' IDENTIFIER ')' block
    ;

finallyClause
    : 'finally' block
    ;

throwStatement
    : 'throw' expression ';'
     ;

// Add type arguments
typeArguments
    : '<' type (',' type)* '>'
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
