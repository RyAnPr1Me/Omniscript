"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operator = exports.ExpressionKind = void 0;
/**
 * Enum representing the allowed kinds of expressions in the AST.
 * Use these values to discriminate expression nodes.
 *
 * @example
 * if(node.kind === ExpressionKind.Literal) { ... }
 */
var ExpressionKind;
(function (ExpressionKind) {
    ExpressionKind["Binary"] = "Binary";
    ExpressionKind["Unary"] = "Unary";
    ExpressionKind["Literal"] = "Literal";
    ExpressionKind["Identifier"] = "Identifier";
    ExpressionKind["Call"] = "Call";
    ExpressionKind["MemberAccess"] = "MemberAccess";
    ExpressionKind["ArrayLiteral"] = "ArrayLiteral";
    ExpressionKind["ObjectLiteral"] = "ObjectLiteral";
})(ExpressionKind || (exports.ExpressionKind = ExpressionKind = {}));
/**
 * Enum representing common operators in expressions.
 * Extend this enum as new operators get supported.
 *
 * @example
 * if(operator === Operator.Plus) { ... }
 */
var Operator;
(function (Operator) {
    Operator["Plus"] = "+";
    Operator["Minus"] = "-";
    Operator["Multiply"] = "*";
    Operator["Divide"] = "/";
    Operator["Modulo"] = "%";
    Operator["Equal"] = "==";
    Operator["NotEqual"] = "!=";
    Operator["LessThan"] = "<";
    Operator["GreaterThan"] = ">";
    Operator["And"] = "&&";
    Operator["Or"] = "||";
})(Operator || (exports.Operator = Operator = {}));
