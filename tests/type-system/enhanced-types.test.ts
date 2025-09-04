import { TypeInferenceEngine, Type, TypeCheckOptions } from "../../src/type-checker";

describe("Enhanced Type System", () => {
  let typeEngine: TypeInferenceEngine;

  beforeEach(() => {
    typeEngine = new TypeInferenceEngine();
  });

  describe("Recursive Type Definitions", () => {
    test("should handle recursive types", () => {
      // Define a recursive LinkedList type
      const nodeType: Type = {
        kind: "object",
        properties: {
          value: { kind: "primitive", name: "number" },
          next: { kind: "recursive", typeVar: "LinkedList" }
        }
      };

      typeEngine.addRecursiveType("LinkedList", nodeType);

      const listExpr = {
        type: "ObjectLiteral",
        properties: [
          { key: "value", value: { type: "Literal", value: 42 } },
          { key: "next", value: { type: "Identifier", name: "LinkedList" } }
        ]
      };

      const inferredType = typeEngine.inferType(listExpr);
      expect(inferredType.kind).toBe("object");
      expect(inferredType.properties).toHaveProperty("value");
      expect(inferredType.properties).toHaveProperty("next");
    });

    test("should prevent infinite recursion", () => {
      const options: TypeCheckOptions = {
        strictMode: true,
        nominalTyping: false,
        recursiveDepthLimit: 5,
        enableTypeInference: true
      };

      const engine = new TypeInferenceEngine(options);

      // Create a deeply nested expression that would cause infinite recursion
      const deepExpr = {
        type: "MemberAccess",
        object: {
          type: "MemberAccess",
          object: {
            type: "MemberAccess",
            object: {
              type: "MemberAccess",
              object: {
                type: "MemberAccess",
                object: {
                  type: "MemberAccess",
                  object: { type: "Identifier", name: "obj" },
                  property: { name: "nested" }
                },
                property: { name: "deeper" }
              },
              property: { name: "evenDeeper" }
            },
            property: { name: "tooDeep" }
          },
          property: { name: "wayTooDeep" }
        },
        property: { name: "impossiblyDeep" }
      };

      expect(() => {
        engine.inferType(deepExpr);
      }).toThrow("Type inference depth limit exceeded");
    });
  });

  describe("Nominal vs Structural Typing", () => {
    test("should support nominal typing mode", () => {
      const options: TypeCheckOptions = {
        strictMode: true,
        nominalTyping: true,
        recursiveDepthLimit: 50,
        enableTypeInference: true
      };

      const engine = new TypeInferenceEngine(options);

      // Define a nominal type
      const personType: Type = {
        kind: "object",
        properties: {
          name: { kind: "primitive", name: "string" },
          age: { kind: "primitive", name: "number" }
        }
      };

      engine.addNominalType("Person", personType);

      const personExpr = {
        type: "ObjectLiteral",
        properties: [
          { key: "name", value: { type: "Literal", value: "John" } },
          { key: "age", value: { type: "Literal", value: 30 } }
        ]
      };

      const inferredType = engine.inferType(personExpr);
      expect(inferredType.kind).toBe("nominal");
      expect(inferredType.name).toBe("Person");
    });

    test("should distinguish between nominally different types", () => {
      const options: TypeCheckOptions = {
        strictMode: true,
        nominalTyping: true,
        recursiveDepthLimit: 50,
        enableTypeInference: true
      };

      const engine = new TypeInferenceEngine(options);

      // Two structurally identical but nominally different types
      const pointType: Type = {
        kind: "object",
        properties: {
          x: { kind: "primitive", name: "number" },
          y: { kind: "primitive", name: "number" }
        }
      };

      const vectorType: Type = {
        kind: "object",
        properties: {
          x: { kind: "primitive", name: "number" },
          y: { kind: "primitive", name: "number" }
        }
      };

      engine.addNominalType("Point", pointType);
      engine.addNominalType("Vector", vectorType);

      const pointExpr = {
        type: "ObjectLiteral",
        properties: [
          { key: "x", value: { type: "Literal", value: 10 } },
          { key: "y", value: { type: "Literal", value: 20 } }
        ]
      };

      const inferredType = engine.inferType(pointExpr);
      
      // Should infer as Point (first matching nominal type)
      expect(inferredType.kind).toBe("nominal");
      expect(inferredType.name).toBe("Point");
    });
  });

  describe("Advanced Type Inference", () => {
    test("should infer function types with parameters", () => {
      const funcExpr = {
        type: "Function",
        parameters: [
          { name: "x", typeAnnotation: { type: "NumberKeyword" } },
          { name: "y", typeAnnotation: { type: "StringKeyword" } }
        ],
        body: { type: "Literal", value: "result" }
      };

      const inferredType = typeEngine.inferType(funcExpr);
      
      expect(inferredType.kind).toBe("function");
      expect(inferredType.parameters).toHaveLength(2);
      expect(inferredType.parameters![0]).toEqual({ kind: "primitive", name: "number" });
      expect(inferredType.parameters![1]).toEqual({ kind: "primitive", name: "string" });
      expect(inferredType.returnType).toEqual({ kind: "primitive", name: "string" });
    });

    test("should infer conditional types", () => {
      const conditionalExpr = {
        type: "Conditional",
        condition: { type: "Literal", value: true },
        trueType: { type: "Literal", value: "string result" },
        falseType: { type: "Literal", value: 42 }
      };

      const inferredType = typeEngine.inferType(conditionalExpr);
      
      expect(inferredType.kind).toBe("conditional");
      expect(inferredType.condition).toEqual({ kind: "primitive", name: "boolean" });
      expect(inferredType.trueType).toEqual({ kind: "primitive", name: "string" });
      expect(inferredType.falseType).toEqual({ kind: "primitive", name: "number" });
    });

    test("should infer member access types", () => {
      const context = new Map<string, Type>();
      context.set("obj", {
        kind: "object",
        properties: {
          name: { kind: "primitive", name: "string" },
          items: { 
            kind: "array", 
            elementType: { kind: "primitive", name: "number" } 
          }
        }
      });

      const memberExpr = {
        type: "MemberAccess",
        object: { type: "Identifier", name: "obj" },
        property: { name: "name" }
      };

      const inferredType = typeEngine.inferType(memberExpr, context);
      expect(inferredType).toEqual({ kind: "primitive", name: "string" });

      const arrayLengthExpr = {
        type: "MemberAccess",
        object: {
          type: "MemberAccess",
          object: { type: "Identifier", name: "obj" },
          property: { name: "items" }
        },
        property: { name: "length" }
      };

      const lengthType = typeEngine.inferType(arrayLengthExpr, context);
      expect(lengthType).toEqual({ kind: "primitive", name: "number" });
    });

    test("should handle union types in binary operations", () => {
      const unionExpr = {
        type: "Binary",
        operator: "+",
        left: { type: "Literal", value: 5 },
        right: {
          type: "Conditional",
          condition: { type: "Literal", value: true },
          trueType: { type: "Literal", value: 10 },
          falseType: { type: "Literal", value: "text" }
        }
      };

      const inferredType = typeEngine.inferType(unionExpr);
      
      // Should create a union type for the possible results
      expect(inferredType.kind).toBe("union");
      expect(inferredType.types).toHaveLength(2);
    });

    test("should infer array types with heterogeneous elements", () => {
      const arrayExpr = {
        type: "ArrayLiteral",
        elements: [
          { type: "Literal", value: 42 },
          { type: "Literal", value: "hello" },
          { type: "Literal", value: true }
        ]
      };

      const inferredType = typeEngine.inferType(arrayExpr);
      
      expect(inferredType.kind).toBe("array");
      expect(inferredType.elementType!.kind).toBe("union");
      expect(inferredType.elementType!.types).toHaveLength(3);
    });
  });

  describe("Strict vs Non-Strict Mode", () => {
    test("should enforce stricter type checking in strict mode", () => {
      const strictEngine = new TypeInferenceEngine({
        strictMode: true,
        nominalTyping: false,
        recursiveDepthLimit: 50,
        enableTypeInference: true
      });

      const logicalExpr = {
        type: "Binary",
        operator: "&&",
        left: { type: "Literal", value: "string" },
        right: { type: "Literal", value: true }
      };

      const strictType = strictEngine.inferType(logicalExpr);
      expect(strictType).toEqual({ kind: "primitive", name: "unknown" });

      const nonStrictEngine = new TypeInferenceEngine({
        strictMode: false,
        nominalTyping: false,
        recursiveDepthLimit: 50,
        enableTypeInference: true
      });

      const nonStrictType = nonStrictEngine.inferType(logicalExpr);
      expect(nonStrictType).toEqual({ kind: "primitive", name: "boolean" });
    });
  });

  describe("Generic Type Substitution", () => {
    test("should substitute generic types in function calls", () => {
      const context = new Map<string, Type>();
      context.set("identity", {
        kind: "function",
        parameters: [{ kind: "generic", name: "T" }],
        returnType: { kind: "generic", name: "T" }
      });

      const callExpr = {
        type: "Call",
        callee: { type: "Identifier", name: "identity" },
        arguments: [{ type: "Literal", value: "hello" }]
      };

      const inferredType = typeEngine.inferType(callExpr, context);
      expect(inferredType).toEqual({ kind: "primitive", name: "string" });
    });
  });
});