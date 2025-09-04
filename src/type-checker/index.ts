import { OmniscriptError, TypeMismatchError } from "../errors";

// Advanced type system for Omniscript
export interface Type {
  kind:
    | "primitive"
    | "union"
    | "intersection"
    | "generic"
    | "function"
    | "object"
    | "array";
  name?: string;
  types?: Type[];
  parameters?: Type[];
  returnType?: Type;
  properties?: Record<string, Type>;
  elementType?: Type;
  constraints?: Type[];
}

export class TypeInferenceEngine {
  private symbolTable: Map<string, Type> = new Map();
  private genericConstraints: Map<string, Type[]> = new Map();

  inferType(expr: any, context: Map<string, Type> = new Map()): Type {
    if (!expr) return { kind: "primitive", name: "unknown" };

    switch (expr.type || expr.kind) {
      case "Literal":
        return this.inferLiteralType(expr);
      case "Identifier":
        return (
          context.get(expr.name) ||
          this.symbolTable.get(expr.name) || {
            kind: "primitive",
            name: "unknown",
          }
        );
      case "Binary":
        return this.inferBinaryType(expr, context);
      case "Call":
        return this.inferCallType(expr, context);
      case "ObjectLiteral":
        return this.inferObjectType(expr, context);
      case "ArrayLiteral":
        return this.inferArrayType(expr, context);
      default:
        return { kind: "primitive", name: "unknown" };
    }
  }

  private inferLiteralType(expr: any): Type {
    const value = expr.value;
    if (typeof value === "number") return { kind: "primitive", name: "number" };
    if (typeof value === "string") return { kind: "primitive", name: "string" };
    if (typeof value === "boolean")
      return { kind: "primitive", name: "boolean" };
    if (value === null) return { kind: "primitive", name: "null" };
    if (value === undefined) return { kind: "primitive", name: "undefined" };
    return { kind: "primitive", name: "unknown" };
  }

  private inferBinaryType(expr: any, context: Map<string, Type>): Type {
    const leftType = this.inferType(expr.left, context);
    const rightType = this.inferType(expr.right, context);

    switch (expr.operator) {
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
        // Numeric operations - check for type coercion
        if (this.isNumericType(leftType) && this.isNumericType(rightType)) {
          return { kind: "primitive", name: "number" };
        }
        if (
          expr.operator === "+" &&
          (this.isStringType(leftType) || this.isStringType(rightType))
        ) {
          return { kind: "primitive", name: "string" };
        }
        return {
          kind: "union",
          types: [
            { kind: "primitive", name: "number" },
            { kind: "primitive", name: "string" },
          ],
        };
      case "==":
      case "!=":
      case "<":
      case ">":
      case "<=":
      case ">=":
        return { kind: "primitive", name: "boolean" };
      case "&&":
      case "||":
        return { kind: "union", types: [leftType, rightType] };
      default:
        return { kind: "primitive", name: "unknown" };
    }
  }

  private inferCallType(expr: any, context: Map<string, Type>): Type {
    const calleeType = this.inferType(expr.callee, context);
    if (calleeType.kind === "function" && calleeType.returnType) {
      return calleeType.returnType;
    }
    return { kind: "primitive", name: "unknown" };
  }

  private inferObjectType(expr: any, context: Map<string, Type>): Type {
    const properties: Record<string, Type> = {};
    if (expr.properties) {
      for (const prop of expr.properties) {
        properties[prop.key] = this.inferType(prop.value, context);
      }
    }
    return { kind: "object", properties };
  }

  private inferArrayType(expr: any, context: Map<string, Type>): Type {
    if (expr.elements && expr.elements.length > 0) {
      const elementTypes = expr.elements.map((el: any) =>
        this.inferType(el, context),
      );
      // Find common type or create union
      const commonType = this.findCommonType(elementTypes);
      return { kind: "array", elementType: commonType };
    }
    return {
      kind: "array",
      elementType: { kind: "primitive", name: "unknown" },
    };
  }

  private isNumericType(type: Type): boolean {
    return type.kind === "primitive" && type.name === "number";
  }

  private isStringType(type: Type): boolean {
    return type.kind === "primitive" && type.name === "string";
  }

  private findCommonType(types: Type[]): Type {
    if (types.length === 0) return { kind: "primitive", name: "unknown" };
    if (types.length === 1) return types[0];

    const firstType = types[0];
    const allSame = types.every((t) => this.typesEqual(t, firstType));

    if (allSame) return firstType;
    return { kind: "union", types };
  }

  private typesEqual(type1: Type, type2: Type): boolean {
    if (type1.kind !== type2.kind) return false;
    if (type1.name !== type2.name) return false;
    return true; // Simplified equality check
  }

  createUnionType(types: Type[]): Type {
    return { kind: "union", types };
  }

  createIntersectionType(types: Type[]): Type {
    return { kind: "intersection", types };
  }

  createFunctionType(parameters: Type[], returnType: Type): Type {
    return { kind: "function", parameters, returnType };
  }
}

export class TypeChecker {
  private inferenceEngine = new TypeInferenceEngine();

  check(ast: any) {
    const errors: any[] = [];
    this.visitNode(ast, errors);

    if (errors.length > 0) {
      throw new OmniscriptError(
        `Type errors found: ${errors.map((e) => e.message).join(", ")}`,
      );
    }

    return {
      errors: [],
    };
  }

  private visitNode(node: any, errors: any[]): void {
    if (!node) return;

    switch (node.type) {
      case "Program":
        if (node.body) {
          node.body.forEach((stmt: any) => this.visitNode(stmt, errors));
        }
        break;
      case "VariableDeclaration":
        this.checkVariableDeclaration(node, errors);
        break;
      case "FunctionDeclaration":
        this.checkFunctionDeclaration(node, errors);
        break;
      case "ClassDeclaration":
        this.checkClassDeclaration(node, errors);
        break;
      case "BinaryExpression":
        this.checkBinaryExpression(node, errors);
        break;
      default:
        // Recursively visit nested nodes
        if (Array.isArray(node.body)) {
          node.body.forEach((stmt: any) => this.visitNode(stmt, errors));
        }
        if (node.left) this.visitNode(node.left, errors);
        if (node.right) this.visitNode(node.right, errors);
        if (node.argument) this.visitNode(node.argument, errors);
    }
  }

  private checkVariableDeclaration(node: any, errors: any[]): void {
    if (node.varType && node.initializer) {
      const expectedType = this.parseTypeString(node.varType);
      const actualType = this.inferenceEngine.inferType(node.initializer);

      if (!this.isTypeCompatible(actualType, expectedType)) {
        errors.push({
          message: `Type mismatch: expected ${this.typeToString(expectedType)} but got ${this.typeToString(actualType)}`,
          line: node.line || 0,
          column: node.column || 0,
        });
      }
    }
  }

  private checkFunctionDeclaration(node: any, errors: any[]): void {
    // Check parameter types
    if (node.params) {
      for (const param of node.params) {
        if (param.type) {
          // Parameter type checking would be done during calls
        }
      }
    }

    // Check return type consistency
    if (node.returnType && node.body) {
      const inferredReturnType = this.inferReturnType(node.body);
      const expectedReturnType = this.parseTypeString(node.returnType);

      if (!this.isTypeCompatible(inferredReturnType, expectedReturnType)) {
        errors.push({
          message: `Return type mismatch: expected ${this.typeToString(expectedReturnType)} but function returns ${this.typeToString(inferredReturnType)}`,
          line: node.line || 0,
          column: node.column || 0,
        });
      }
    }

    // Visit function body
    if (node.body) {
      node.body.forEach((stmt: any) => this.visitNode(stmt, errors));
    }
  }

  private checkClassDeclaration(node: any, errors: any[]): void {
    // Check method compatibility, inheritance, etc.
    if (node.methods) {
      node.methods.forEach((method: any) =>
        this.checkFunctionDeclaration(method, errors),
      );
    }
  }

  private checkBinaryExpression(node: any, errors: any[]): void {
    const leftType = this.inferenceEngine.inferType(node.left);
    const rightType = this.inferenceEngine.inferType(node.right);

    // Check operator compatibility
    switch (node.operator) {
      case "+":
        // Allow number + number or string + string, but warn about mixed types
        if (
          !this.isTypeCompatible(leftType, rightType) &&
          !(this.isNumericType(leftType) && this.isNumericType(rightType)) &&
          !(this.isStringType(leftType) || this.isStringType(rightType))
        ) {
          errors.push({
            message: `Potentially unsafe addition: ${this.typeToString(leftType)} + ${this.typeToString(rightType)}`,
            line: node.line || 0,
            column: node.column || 0,
          });
        }
        break;
      case "-":
      case "*":
      case "/":
        // Numeric operations
        if (!this.isNumericType(leftType) || !this.isNumericType(rightType)) {
          errors.push({
            message: `Arithmetic operation requires numbers: ${this.typeToString(leftType)} ${node.operator} ${this.typeToString(rightType)}`,
            line: node.line || 0,
            column: node.column || 0,
          });
        }
        break;
    }
  }

  private parseTypeString(typeStr: string): Type {
    // Simple type parsing - could be expanded for complex types
    switch (typeStr) {
      case "number":
        return { kind: "primitive", name: "number" };
      case "string":
        return { kind: "primitive", name: "string" };
      case "boolean":
        return { kind: "primitive", name: "boolean" };
      case "void":
        return { kind: "primitive", name: "void" };
      default:
        return { kind: "primitive", name: "unknown" };
    }
  }

  private isTypeCompatible(actual: Type, expected: Type): boolean {
    if (actual.kind === "union") {
      return (
        actual.types?.some((t) => this.isTypeCompatible(t, expected)) ?? false
      );
    }
    if (expected.kind === "union") {
      return (
        expected.types?.some((t) => this.isTypeCompatible(actual, t)) ?? false
      );
    }
    return actual.kind === expected.kind && actual.name === expected.name;
  }

  private isNumericType(type: Type): boolean {
    return type.kind === "primitive" && type.name === "number";
  }

  private isStringType(type: Type): boolean {
    return type.kind === "primitive" && type.name === "string";
  }

  private inferReturnType(body: any[]): Type {
    // Find return statements and infer their types
    for (const stmt of body) {
      if (stmt.type === "ReturnStatement" && stmt.argument) {
        return this.inferenceEngine.inferType(stmt.argument);
      }
    }
    return { kind: "primitive", name: "void" };
  }

  private typeToString(type: Type): string {
    switch (type.kind) {
      case "primitive":
        return type.name || "unknown";
      case "union":
        return (
          type.types?.map((t) => this.typeToString(t)).join(" | ") || "union"
        );
      case "intersection":
        return (
          type.types?.map((t) => this.typeToString(t)).join(" & ") ||
          "intersection"
        );
      case "function": {
        const params =
          type.parameters?.map((t) => this.typeToString(t)).join(", ") || "";
        const ret = type.returnType
          ? this.typeToString(type.returnType)
          : "unknown";
        return `(${params}) => ${ret}`;
      }
      case "array":
        return `${type.elementType ? this.typeToString(type.elementType) : "unknown"}[]`;
      case "object":
        return "object";
      default:
        return "unknown";
    }
  }

  private inferType(expr: any): string {
    const type = this.inferenceEngine.inferType(expr);
    return this.typeToString(type);
  }

  validateType(
    expected: string,
    actual: string,
    line: number = 0,
    column: number = 0,
  ) {
    if (expected !== actual) {
      const location = { filename: "<unknown>", line, column };
      throw new TypeMismatchError(
        `Expected type ${expected} but got ${actual}`,
        location,
        expected,
        actual,
      );
    }
  }
}
