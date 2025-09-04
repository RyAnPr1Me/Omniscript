import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { debug } from "../debug";

export interface DocComment {
  description?: string;
  params?: Array<{ name: string; type: string; description?: string }>;
  returns?: { type: string; description?: string };
  example?: string;
  since?: string;
  deprecated?: string;
}

export interface APIMethod {
  name: string;
  signature: string;
  visibility: "public" | "private" | "protected";
  static: boolean;
  async: boolean;
  parameters: Array<{ name: string; type: string; optional: boolean }>;
  returnType: string;
  documentation: DocComment;
}

export interface APIProperty {
  name: string;
  type: string;
  visibility: "public" | "private" | "protected";
  static: boolean;
  readonly: boolean;
  documentation: DocComment;
}

export interface APIClass {
  name: string;
  extends?: string;
  implements: string[];
  abstract: boolean;
  exported: boolean;
  methods: APIMethod[];
  properties: APIProperty[];
  documentation: DocComment;
}

export interface APIInterface {
  name: string;
  extends: string[];
  exported: boolean;
  methods: APIMethod[];
  properties: APIProperty[];
  documentation: DocComment;
}

export interface APIFunction {
  name: string;
  signature: string;
  async: boolean;
  parameters: Array<{ name: string; type: string; optional: boolean }>;
  returnType: string;
  exported: boolean;
  documentation: DocComment;
}

export interface APIModule {
  name: string;
  path: string;
  classes: APIClass[];
  interfaces: APIInterface[];
  functions: APIFunction[];
  exports: string[];
}

export class TypeScriptDocGenerator {
  private program!: ts.Program;
  private checker!: ts.TypeChecker;
  private sourceFiles: ts.SourceFile[] = [];

  constructor(private configPath: string = "./tsconfig.json") {
    this.initializeProgram();
  }

  private initializeProgram(): void {
    const configFile = ts.readConfigFile(this.configPath, ts.sys.readFile);
    const compilerOptions = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(this.configPath),
    );

    this.program = ts.createProgram(
      compilerOptions.fileNames,
      compilerOptions.options,
    );
    this.checker = this.program.getTypeChecker();
    this.sourceFiles = this.program
      .getSourceFiles()
      .filter(
        (sf) => !sf.isDeclarationFile && !sf.fileName.includes("node_modules"),
      );

    debug.debug(
      "DocGenerator",
      `Initialized with ${this.sourceFiles.length} source files`,
    );
  }

  generateDocumentation(): APIModule[] {
    const modules: APIModule[] = [];

    for (const sourceFile of this.sourceFiles) {
      const module = this.processSourceFile(sourceFile);
      if (
        module.classes.length > 0 ||
        module.interfaces.length > 0 ||
        module.functions.length > 0
      ) {
        modules.push(module);
      }
    }

    debug.debug(
      "DocGenerator",
      `Generated documentation for ${modules.length} modules`,
    );
    return modules;
  }

  private processSourceFile(sourceFile: ts.SourceFile): APIModule {
    const module: APIModule = {
      name: this.getModuleName(sourceFile),
      path: sourceFile.fileName,
      classes: [],
      interfaces: [],
      functions: [],
      exports: [],
    };

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        const apiClass = this.processClass(node, sourceFile);
        if (apiClass) {
          module.classes.push(apiClass);
        }
      } else if (ts.isInterfaceDeclaration(node)) {
        const apiInterface = this.processInterface(node, sourceFile);
        if (apiInterface) {
          module.interfaces.push(apiInterface);
        }
      } else if (ts.isFunctionDeclaration(node)) {
        const apiFunction = this.processFunction(node, sourceFile);
        if (apiFunction) {
          module.functions.push(apiFunction);
        }
      } else if (ts.isExportDeclaration(node)) {
        this.processExports(node, module);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return module;
  }

  private processClass(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
  ): APIClass | null {
    if (!node.name) return null;

    const apiClass: APIClass = {
      name: node.name.text,
      extends: this.getExtendsClause(node),
      implements: this.getImplementsClauses(node),
      abstract: this.hasModifier(node, ts.SyntaxKind.AbstractKeyword),
      exported: this.isExported(node),
      methods: [],
      properties: [],
      documentation: this.extractDocumentation(node, sourceFile),
    };

    // Process methods and properties
    for (const member of node.members) {
      if (ts.isMethodDeclaration(member)) {
        const method = this.processMethod(member, sourceFile);
        if (method) {
          apiClass.methods.push(method);
        }
      } else if (ts.isPropertyDeclaration(member)) {
        const property = this.processProperty(member, sourceFile);
        if (property) {
          apiClass.properties.push(property);
        }
      }
    }

    return apiClass;
  }

  private processInterface(
    node: ts.InterfaceDeclaration,
    sourceFile: ts.SourceFile,
  ): APIInterface | null {
    const apiInterface: APIInterface = {
      name: node.name.text,
      extends: this.getInterfaceExtends(node),
      exported: this.isExported(node),
      methods: [],
      properties: [],
      documentation: this.extractDocumentation(node, sourceFile),
    };

    // Process interface members
    for (const member of node.members) {
      if (ts.isMethodSignature(member)) {
        const method = this.processMethodSignature(member, sourceFile);
        if (method) {
          apiInterface.methods.push(method);
        }
      } else if (ts.isPropertySignature(member)) {
        const property = this.processPropertySignature(member, sourceFile);
        if (property) {
          apiInterface.properties.push(property);
        }
      }
    }

    return apiInterface;
  }

  private processFunction(
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile,
  ): APIFunction | null {
    if (!node.name) return null;

    return {
      name: node.name.text,
      signature: this.getFunctionSignature(node),
      async: this.hasModifier(node, ts.SyntaxKind.AsyncKeyword),
      parameters: this.getParameters(node.parameters),
      returnType: this.getReturnType(node),
      exported: this.isExported(node),
      documentation: this.extractDocumentation(node, sourceFile),
    };
  }

  private processMethod(
    node: ts.MethodDeclaration,
    sourceFile: ts.SourceFile,
  ): APIMethod | null {
    if (!node.name || !ts.isIdentifier(node.name)) return null;

    return {
      name: node.name.text,
      signature: this.getMethodSignature(node),
      visibility: this.getVisibility(node),
      static: this.hasModifier(node, ts.SyntaxKind.StaticKeyword),
      async: this.hasModifier(node, ts.SyntaxKind.AsyncKeyword),
      parameters: this.getParameters(node.parameters),
      returnType: this.getReturnType(node),
      documentation: this.extractDocumentation(node, sourceFile),
    };
  }

  private processProperty(
    node: ts.PropertyDeclaration,
    sourceFile: ts.SourceFile,
  ): APIProperty | null {
    if (!node.name || !ts.isIdentifier(node.name)) return null;

    return {
      name: node.name.text,
      type: this.getTypeString(node.type),
      visibility: this.getVisibility(node),
      static: this.hasModifier(node, ts.SyntaxKind.StaticKeyword),
      readonly: this.hasModifier(node, ts.SyntaxKind.ReadonlyKeyword),
      documentation: this.extractDocumentation(node, sourceFile),
    };
  }

  private processMethodSignature(
    node: ts.MethodSignature,
    sourceFile: ts.SourceFile,
  ): APIMethod | null {
    if (!node.name || !ts.isIdentifier(node.name)) return null;

    return {
      name: node.name.text,
      signature: this.getMethodSignatureString(node),
      visibility: "public",
      static: false,
      async: false,
      parameters: this.getParameters(node.parameters),
      returnType: node.type ? this.getTypeString(node.type) : "void",
      documentation: this.extractDocumentation(node, sourceFile),
    };
  }

  private processPropertySignature(
    node: ts.PropertySignature,
    sourceFile: ts.SourceFile,
  ): APIProperty | null {
    if (!node.name || !ts.isIdentifier(node.name)) return null;

    return {
      name: node.name.text,
      type: this.getTypeString(node.type),
      visibility: "public",
      static: false,
      readonly: this.hasModifier(node, ts.SyntaxKind.ReadonlyKeyword),
      documentation: this.extractDocumentation(node, sourceFile),
    };
  }

  private extractDocumentation(
    node: ts.Node,
    sourceFile: ts.SourceFile,
  ): DocComment {
    const doc: DocComment = {};
    const jsDoc = this.getJSDocComments(node, sourceFile);

    if (jsDoc) {
      doc.description = this.extractDescription(jsDoc);
      doc.params = this.extractParams(jsDoc);
      doc.returns = this.extractReturns(jsDoc);
      doc.example = this.extractExample(jsDoc);
      doc.since = this.extractTag(jsDoc, "since");
      doc.deprecated = this.extractTag(jsDoc, "deprecated");
    }

    return doc;
  }

  private getJSDocComments(
    node: ts.Node,
    sourceFile: ts.SourceFile,
  ): string | null {
    const commentRanges = ts.getLeadingCommentRanges(
      sourceFile.text,
      node.getFullStart(),
    );
    if (!commentRanges || commentRanges.length === 0) return null;

    const lastComment = commentRanges[commentRanges.length - 1];
    if (lastComment.kind !== ts.SyntaxKind.MultiLineCommentTrivia) return null;

    const commentText = sourceFile.text.substring(
      lastComment.pos,
      lastComment.end,
    );
    if (!commentText.startsWith("/**")) return null;

    return commentText;
  }

  private extractDescription(jsDoc: string): string {
    const lines = jsDoc.split("\n");
    const descriptionLines: string[] = [];
    let inDescription = true;

    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i].trim().replace(/^\*\s?/, "");

      if (line.startsWith("@")) {
        inDescription = false;
      }

      if (inDescription && line) {
        descriptionLines.push(line);
      }
    }

    return descriptionLines.join("\n").trim();
  }

  private extractParams(
    jsDoc: string,
  ): Array<{ name: string; type: string; description?: string }> {
    const params: Array<{ name: string; type: string; description?: string }> =
      [];
    const paramRegex = /@param\s+\{([^}]+)\}\s+(\w+)\s*(.*)/g;
    let match;

    while ((match = paramRegex.exec(jsDoc)) !== null) {
      params.push({
        name: match[2],
        type: match[1],
        description: match[3].trim() || undefined,
      });
    }

    return params;
  }

  private extractReturns(
    jsDoc: string,
  ): { type: string; description?: string } | undefined {
    const returnRegex = /@returns?\s+\{([^}]+)\}\s*(.*)/;
    const match = jsDoc.match(returnRegex);

    if (match) {
      return {
        type: match[1],
        description: match[2].trim() || undefined,
      };
    }

    return undefined;
  }

  private extractExample(jsDoc: string): string | undefined {
    const exampleRegex = /@example\s*([\s\S]*?)(?=@\w+|$)/;
    const match = jsDoc.match(exampleRegex);

    if (match) {
      return match[1]
        .trim()
        .replace(/\n\s*\*/g, "\n")
        .trim();
    }

    return undefined;
  }

  private extractTag(jsDoc: string, tagName: string): string | undefined {
    const tagRegex = new RegExp(`@${tagName}\\s+(.*)`, "i");
    const match = jsDoc.match(tagRegex);
    return match ? match[1].trim() : undefined;
  }

  // Helper methods for AST processing
  private getModuleName(sourceFile: ts.SourceFile): string {
    const fileName = path.basename(
      sourceFile.fileName,
      path.extname(sourceFile.fileName),
    );
    return fileName === "index"
      ? path.basename(path.dirname(sourceFile.fileName))
      : fileName;
  }

  private getExtendsClause(node: ts.ClassDeclaration): string | undefined {
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          return clause.types[0]?.expression.getText();
        }
      }
    }
    return undefined;
  }

  private getImplementsClauses(node: ts.ClassDeclaration): string[] {
    const implementsTypes: string[] = [];
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
          for (const type of clause.types) {
            implementsTypes.push(type.expression.getText());
          }
        }
      }
    }
    return implementsTypes;
  }

  private getInterfaceExtends(node: ts.InterfaceDeclaration): string[] {
    const extendsTypes: string[] = [];
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          for (const type of clause.types) {
            extendsTypes.push(type.expression.getText());
          }
        }
      }
    }
    return extendsTypes;
  }

  private getVisibility(
    node: ts.ClassElement,
  ): "public" | "private" | "protected" {
    if (this.hasModifier(node, ts.SyntaxKind.PrivateKeyword)) return "private";
    if (this.hasModifier(node, ts.SyntaxKind.ProtectedKeyword))
      return "protected";
    return "public";
  }

  private hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
    const nodeWithModifiers = node as any;
    return (
      nodeWithModifiers.modifiers?.some(
        (modifier: any) => modifier.kind === kind,
      ) ?? false
    );
  }

  private isExported(node: ts.Node): boolean {
    return this.hasModifier(node, ts.SyntaxKind.ExportKeyword);
  }

  private getParameters(
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
  ): Array<{ name: string; type: string; optional: boolean }> {
    return parameters.map((param) => ({
      name: param.name.getText(),
      type: this.getTypeString(param.type),
      optional: !!param.questionToken,
    }));
  }

  private getReturnType(node: ts.FunctionLikeDeclaration): string {
    if (node.type) {
      return this.getTypeString(node.type);
    }
    return "void";
  }

  private getTypeString(type: ts.TypeNode | undefined): string {
    if (!type) return "any";
    return type.getText();
  }

  private getFunctionSignature(node: ts.FunctionDeclaration): string {
    return node.getText().split("{")[0].trim();
  }

  private getMethodSignature(node: ts.MethodDeclaration): string {
    return node.getText().split("{")[0].trim();
  }

  private getMethodSignatureString(node: ts.MethodSignature): string {
    return node.getText().trim();
  }

  private processExports(node: ts.ExportDeclaration, module: APIModule): void {
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements) {
        module.exports.push(element.name.text);
      }
    }
  }
}

export class MarkdownDocGenerator {
  static generateMarkdown(modules: APIModule[]): string {
    let markdown = "# API Documentation\n\n";
    markdown += "Auto-generated API documentation for Omniscript.\n\n";
    markdown += "## Table of Contents\n\n";

    // Generate table of contents
    for (const module of modules) {
      markdown += `- [${module.name}](#${this.toAnchor(module.name)})\n`;
    }
    markdown += "\n";

    // Generate module documentation
    for (const module of modules) {
      markdown += this.generateModuleMarkdown(module);
    }

    return markdown;
  }

  private static generateModuleMarkdown(module: APIModule): string {
    let markdown = `## ${module.name}\n\n`;
    markdown += `**File**: \`${module.path}\`\n\n`;

    if (module.classes.length > 0) {
      markdown += "### Classes\n\n";
      for (const cls of module.classes) {
        markdown += this.generateClassMarkdown(cls);
      }
    }

    if (module.interfaces.length > 0) {
      markdown += "### Interfaces\n\n";
      for (const iface of module.interfaces) {
        markdown += this.generateInterfaceMarkdown(iface);
      }
    }

    if (module.functions.length > 0) {
      markdown += "### Functions\n\n";
      for (const func of module.functions) {
        markdown += this.generateFunctionMarkdown(func);
      }
    }

    return markdown + "\n";
  }

  private static generateClassMarkdown(cls: APIClass): string {
    let markdown = `#### ${cls.name}\n\n`;

    if (cls.documentation.description) {
      markdown += `${cls.documentation.description}\n\n`;
    }

    if (cls.extends) {
      markdown += `**Extends**: \`${cls.extends}\`\n\n`;
    }

    if (cls.implements.length > 0) {
      markdown += `**Implements**: ${cls.implements.map((i) => `\`${i}\``).join(", ")}\n\n`;
    }

    if (cls.properties.length > 0) {
      markdown += "**Properties**:\n\n";
      for (const prop of cls.properties) {
        markdown += `- \`${prop.name}: ${prop.type}\` - ${prop.documentation.description || ""}\n`;
      }
      markdown += "\n";
    }

    if (cls.methods.length > 0) {
      markdown += "**Methods**:\n\n";
      for (const method of cls.methods) {
        markdown += this.generateMethodMarkdown(method);
      }
    }

    if (cls.documentation.example) {
      markdown += "**Example**:\n\n";
      markdown += "```typescript\n";
      markdown += cls.documentation.example;
      markdown += "\n```\n\n";
    }

    return markdown;
  }

  private static generateInterfaceMarkdown(iface: APIInterface): string {
    let markdown = `#### ${iface.name}\n\n`;

    if (iface.documentation.description) {
      markdown += `${iface.documentation.description}\n\n`;
    }

    if (iface.extends.length > 0) {
      markdown += `**Extends**: ${iface.extends.map((e) => `\`${e}\``).join(", ")}\n\n`;
    }

    if (iface.properties.length > 0) {
      markdown += "**Properties**:\n\n";
      for (const prop of iface.properties) {
        markdown += `- \`${prop.name}: ${prop.type}\` - ${prop.documentation.description || ""}\n`;
      }
      markdown += "\n";
    }

    if (iface.methods.length > 0) {
      markdown += "**Methods**:\n\n";
      for (const method of iface.methods) {
        markdown += this.generateMethodMarkdown(method);
      }
    }

    return markdown;
  }

  private static generateFunctionMarkdown(func: APIFunction): string {
    let markdown = `#### ${func.name}\n\n`;

    if (func.documentation.description) {
      markdown += `${func.documentation.description}\n\n`;
    }

    markdown += `**Signature**: \`${func.signature}\`\n\n`;

    if (func.documentation.params && func.documentation.params.length > 0) {
      markdown += "**Parameters**:\n\n";
      for (const param of func.documentation.params) {
        markdown += `- \`${param.name}: ${param.type}\` - ${param.description || ""}\n`;
      }
      markdown += "\n";
    }

    if (func.documentation.returns) {
      markdown += `**Returns**: \`${func.documentation.returns.type}\` - ${func.documentation.returns.description || ""}\n\n`;
    }

    if (func.documentation.example) {
      markdown += "**Example**:\n\n";
      markdown += "```typescript\n";
      markdown += func.documentation.example;
      markdown += "\n```\n\n";
    }

    return markdown;
  }

  private static generateMethodMarkdown(method: APIMethod): string {
    let markdown = `##### ${method.name}\n\n`;

    if (method.documentation.description) {
      markdown += `${method.documentation.description}\n\n`;
    }

    markdown += `**Signature**: \`${method.signature}\`\n\n`;

    if (method.documentation.params && method.documentation.params.length > 0) {
      markdown += "**Parameters**:\n\n";
      for (const param of method.documentation.params) {
        markdown += `- \`${param.name}: ${param.type}\` - ${param.description || ""}\n`;
      }
      markdown += "\n";
    }

    if (method.documentation.returns) {
      markdown += `**Returns**: \`${method.documentation.returns.type}\` - ${method.documentation.returns.description || ""}\n\n`;
    }

    return markdown;
  }

  private static toAnchor(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, "-");
  }
}

export { TypeScriptDocGenerator as default };
