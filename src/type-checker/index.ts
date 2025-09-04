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
    | "array"
    | "recursive"
    | "nominal"
    | "conditional";
  name?: string;
  types?: Type[];
  parameters?: Type[];
  returnType?: Type;
  properties?: Record<string, Type>;
  elementType?: Type;
  constraints?: Type[];
  // Recursive type support
  typeVar?: string;
  definition?: Type;
  // Nominal typing support
  nominalId?: string;
  structuralType?: Type;
  // Conditional type support
  condition?: Type;
  trueType?: Type;
  falseType?: Type;
}

export interface TypeCheckOptions {
  strictMode: boolean;
  nominalTyping: boolean;
  recursiveDepthLimit: number;
  enableTypeInference: boolean;
}

export class TypeInferenceEngine {
  private symbolTable: Map<string, Type> = new Map();
  private genericConstraints: Map<string, Type[]> = new Map();
  private recursiveTypes: Map<string, Type> = new Map();
  private nominalTypes: Map<string, Type> = new Map();
  private options: TypeCheckOptions;

  constructor(options: Partial<TypeCheckOptions> = {}) {
    this.options = {
      strictMode: options.strictMode ?? true,
      nominalTyping: options.nominalTyping ?? false,
      recursiveDepthLimit: options.recursiveDepthLimit ?? 50,
      enableTypeInference: options.enableTypeInference ?? true,
    };
  }

  // Add recursive type definition
  addRecursiveType(name: string, definition: Type): void {
    const recursiveType: Type = {
      kind: "recursive",
      typeVar: name,
      definition,
    };
    this.recursiveTypes.set(name, recursiveType);
  }

  // Add nominal type definition
  addNominalType(name: string, structuralType: Type): void {
    const nominalType: Type = {
      kind: "nominal",
      name,
      nominalId: `nominal_${name}_${Date.now()}`,
      structuralType,
    };
    this.nominalTypes.set(name, nominalType);
  }

  // Enhanced type inference with depth tracking
  inferType(
    expr: any,
    context: Map<string, Type> = new Map(),
    depth = 0,
  ): Type {
    if (depth > this.options.recursiveDepthLimit) {
      throw new OmniscriptError(
        "Type inference depth limit exceeded (recursive type?)",
      );
    }

    if (!expr) return { kind: "primitive", name: "unknown" };

    switch (expr.type || expr.kind) {
      case "Literal":
        return this.inferLiteralType(expr);
      case "Identifier":
        return this.inferIdentifierType(expr, context);
      case "Binary":
        return this.inferBinaryType(expr, context, depth);
      case "Call":
        return this.inferCallType(expr, context, depth);
      case "ObjectLiteral":
        return this.inferObjectType(expr, context, depth);
      case "ArrayLiteral":
        return this.inferArrayType(expr, context, depth);
      case "Function":
        return this.inferFunctionType(expr, context, depth);
      case "Conditional":
        return this.inferConditionalType(expr, context, depth);
      case "MemberAccess":
        return this.inferMemberAccessType(expr, context, depth);
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

  private inferIdentifierType(expr: any, context: Map<string, Type>): Type {
    const name = expr.name;

    // Check local context first
    if (context.has(name)) {
      return context.get(name)!;
    }

    // Check symbol table
    if (this.symbolTable.has(name)) {
      return this.symbolTable.get(name)!;
    }

    // Check recursive types
    if (this.recursiveTypes.has(name)) {
      return this.recursiveTypes.get(name)!;
    }

    // Check nominal types
    if (this.nominalTypes.has(name)) {
      return this.nominalTypes.get(name)!;
    }

    return { kind: "primitive", name: "unknown" };
  }

  private inferBinaryType(
    expr: any,
    context: Map<string, Type>,
    depth: number,
  ): Type {
    const leftType = this.inferType(expr.left, context, depth + 1);
    const rightType = this.inferType(expr.right, context, depth + 1);

    switch (expr.operator) {
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
      case "**":
        // Enhanced numeric operations with better type inference
        if (this.isNumericType(leftType) && this.isNumericType(rightType)) {
          return { kind: "primitive", name: "number" };
        }
        if (
          expr.operator === "+" &&
          (this.isStringType(leftType) || this.isStringType(rightType))
        ) {
          return { kind: "primitive", name: "string" };
        }
        // Handle union types
        if (leftType.kind === "union" || rightType.kind === "union") {
          return this.inferUnionBinaryType(expr.operator, leftType, rightType);
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
      case "===":
      case "!==":
      case "<":
      case ">":
      case "<=":
      case ">=":
        return { kind: "primitive", name: "boolean" };
      case "&&":
      case "||":
        return this.inferLogicalType(expr.operator, leftType, rightType);
      case "&":
      case "|":
      case "^":
      case "<<":
      case ">>":
      case ">>>":
        // Bitwise operations
        return { kind: "primitive", name: "number" };
      default:
        return { kind: "primitive", name: "unknown" };
    }
  }

  private inferCallType(
    expr: any,
    context: Map<string, Type>,
    depth: number,
  ): Type {
    const calleeType = this.inferType(expr.callee, context, depth + 1);

    if (calleeType.kind === "function" && calleeType.returnType) {
      // Type substitution for generic functions
      if (calleeType.parameters && expr.arguments) {
        return this.substituteGenericTypes(
          calleeType.returnType,
          calleeType.parameters,
          expr.arguments,
          context,
          depth,
        );
      }
      return calleeType.returnType;
    }

    // Handle constructor calls
    if (expr.isConstructor && calleeType.kind === "function") {
      return { kind: "object", name: expr.callee.name };
    }

    return { kind: "primitive", name: "unknown" };
  }

  private inferObjectType(
    expr: any,
    context: Map<string, Type>,
    depth: number,
  ): Type {
    const properties: Record<string, Type> = {};
    if (expr.properties) {
      for (const prop of expr.properties) {
        const keyName = typeof prop.key === "string" ? prop.key : prop.key.name;
        properties[keyName] = this.inferType(prop.value, context, depth + 1);
      }
    }

    // Check if this matches a nominal type
    if (this.options.nominalTyping) {
      for (const [name, nominalType] of this.nominalTypes.entries()) {
        if (
          this.isStructurallyCompatible(
            { kind: "object", properties },
            nominalType.structuralType!,
          )
        ) {
          return nominalType;
        }
      }
    }

    return { kind: "object", properties };
  }

  private inferArrayType(
    expr: any,
    context: Map<string, Type>,
    depth: number,
  ): Type {
    if (expr.elements && expr.elements.length > 0) {
      const elementTypes = expr.elements.map((el: any) =>
        this.inferType(el, context, depth + 1),
      );
      // Enhanced common type finding
      const commonType = this.findCommonType(elementTypes);
      return { kind: "array", elementType: commonType };
    }
    return {
      kind: "array",
      elementType: { kind: "primitive", name: "unknown" },
    };
  }

  private inferFunctionType(
    expr: any,
    context: Map<string, Type>,
    depth: number,
  ): Type {
    const parameters: Type[] = [];
    const newContext = new Map(context);

    // Infer parameter types
    if (expr.parameters) {
      for (const param of expr.parameters) {
        let paramType: Type = { kind: "primitive", name: "unknown" };

        // Check for type annotations
        if (param.typeAnnotation) {
          paramType = this.parseTypeAnnotation(param.typeAnnotation);
        }

        parameters.push(paramType);
        newContext.set(param.name, paramType);
      }
    }

    // Infer return type from function body
    let returnType: Type = { kind: "primitive", name: "void" };
    if (expr.body) {
      returnType = this.inferType(expr.body, newContext, depth + 1);
    }

    return {
      kind: "function",
      parameters,
      returnType,
    };
  }

  private inferConditionalType(
    expr: any,
    context: Map<string, Type>,
    depth: number,
  ): Type {
    const conditionType = this.inferType(expr.condition, context, depth + 1);
    const trueType = this.inferType(expr.trueType, context, depth + 1);
    const falseType = this.inferType(expr.falseType, context, depth + 1);

    return {
      kind: "conditional",
      condition: conditionType,
      trueType,
      falseType,
    };
  }

  private inferMemberAccessType(
    expr: any,
    context: Map<string, Type>,
    depth: number,
  ): Type {
    const objectType = this.inferType(expr.object, context, depth + 1);
    const propertyName = expr.property.name || expr.property.value;

    if (objectType.kind === "object" && objectType.properties) {
      return (
        objectType.properties[propertyName] || {
          kind: "primitive",
          name: "unknown",
        }
      );
    }

    if (objectType.kind === "array" && propertyName === "length") {
      return { kind: "primitive", name: "number" };
    }

    return { kind: "primitive", name: "unknown" };
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

  // Additional helper methods for enhanced type system
  private inferUnionBinaryType(
    operator: string,
    leftType: Type,
    rightType: Type,
  ): Type {
    const leftTypes = leftType.kind === "union" ? leftType.types! : [leftType];
    const rightTypes =
      rightType.kind === "union" ? rightType.types! : [rightType];

    const resultTypes: Type[] = [];

    for (const left of leftTypes) {
      for (const right of rightTypes) {
        const result = this.inferBinaryType(
          { operator, left, right },
          new Map(),
          0,
        );
        if (!this.typeExists(resultTypes, result)) {
          resultTypes.push(result);
        }
      }
    }

    return resultTypes.length === 1
      ? resultTypes[0]
      : { kind: "union", types: resultTypes };
  }

  private inferLogicalType(
    operator: string,
    leftType: Type,
    rightType: Type,
  ): Type {
    if (operator === "&&") {
      // In strict mode, both operands must be boolean
      if (this.options.strictMode) {
        if (this.isBooleanType(leftType) && this.isBooleanType(rightType)) {
          return { kind: "primitive", name: "boolean" };
        }
        return { kind: "primitive", name: "unknown" };
      }
      // Non-strict: return right type if left is truthy
      return rightType;
    }

    if (operator === "||") {
      // Return union of both types
      return { kind: "union", types: [leftType, rightType] };
    }

    return { kind: "primitive", name: "boolean" };
  }

  private substituteGenericTypes(
    type: Type,
    paramTypes: Type[],
    args: any[],
    context: Map<string, Type>,
    depth: number,
  ): Type {
    // Simple generic substitution - can be enhanced for more complex scenarios
    if (type.kind === "generic" && type.name) {
      const paramIndex = paramTypes.findIndex((p) => p.name === type.name);
      if (paramIndex >= 0 && args[paramIndex]) {
        return this.inferType(args[paramIndex], context, depth + 1);
      }
    }

    if (type.kind === "array" && type.elementType) {
      const substitutedElementType = this.substituteGenericTypes(
        type.elementType,
        paramTypes,
        args,
        context,
        depth,
      );
      return { ...type, elementType: substitutedElementType };
    }

    return type;
  }

  private parseTypeAnnotation(annotation: any): Type {
    if (!annotation) return { kind: "primitive", name: "unknown" };

    switch (annotation.type) {
      case "NumberKeyword":
        return { kind: "primitive", name: "number" };
      case "StringKeyword":
        return { kind: "primitive", name: "string" };
      case "BooleanKeyword":
        return { kind: "primitive", name: "boolean" };
      case "ArrayType":
        return {
          kind: "array",
          elementType: this.parseTypeAnnotation(annotation.elementType),
        };
      case "UnionType":
        return {
          kind: "union",
          types: annotation.types.map((t: any) => this.parseTypeAnnotation(t)),
        };
      default:
        return { kind: "primitive", name: annotation.typeName || "unknown" };
    }
  }

  private isStructurallyCompatible(type1: Type, type2: Type): boolean {
    if (type1.kind !== type2.kind) return false;

    if (type1.kind === "object" && type2.kind === "object") {
      const props1 = type1.properties || {};
      const props2 = type2.properties || {};

      // Check if all properties in type2 exist in type1 with compatible types
      for (const [key, propType2] of Object.entries(props2)) {
        const propType1 = props1[key];
        if (!propType1 || !this.isAssignable(propType1, propType2)) {
          return false;
        }
      }
      return true;
    }

    return this.isAssignable(type1, type2);
  }

  private isAssignable(from: Type, to: Type): boolean {
    // Basic assignability check
    if (from.kind === to.kind && from.name === to.name) return true;

    // Any can be assigned to anything in non-strict mode
    if (
      !this.options.strictMode &&
      (from.name === "any" || to.name === "any")
    ) {
      return true;
    }

    // Union type assignability
    if (to.kind === "union") {
      return to.types?.some((t) => this.isAssignable(from, t)) ?? false;
    }

    if (from.kind === "union") {
      return from.types?.every((t) => this.isAssignable(t, to)) ?? false;
    }

    return false;
  }

  private typeExists(types: Type[], target: Type): boolean {
    return types.some((type) => this.isTypeEqual(type, target));
  }

  private isTypeEqual(type1: Type, type2: Type): boolean {
    if (type1.kind !== type2.kind) return false;
    if (type1.name !== type2.name) return false;

    if (type1.kind === "array" && type2.kind === "array") {
      return this.isTypeEqual(type1.elementType!, type2.elementType!);
    }

    if (type1.kind === "union" && type2.kind === "union") {
      const types1 = type1.types || [];
      const types2 = type2.types || [];

      return (
        types1.length === types2.length &&
        types1.every((t1) => types2.some((t2) => this.isTypeEqual(t1, t2)))
      );
    }

    return true;
  }

  private isBooleanType(type: Type): boolean {
    return type.kind === "primitive" && type.name === "boolean";
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
