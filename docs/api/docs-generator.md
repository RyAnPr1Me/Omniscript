# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [docs-generator](#docs-generator)

## docs-generator

**File**: `/home/runner/work/Omniscript/Omniscript/src/docs-generator/index.ts`

### Classes

#### TypeScriptDocGenerator

**Properties**:

- `program: ts.Program` - 
- `checker: ts.TypeChecker` - 
- `sourceFiles: ts.SourceFile[]` - 

**Methods**:

##### initializeProgram

**Signature**: `private initializeProgram(): void`

##### generateDocumentation

**Signature**: `generateDocumentation(): APIModule[]`

##### processSourceFile

**Signature**: `private processSourceFile(sourceFile: ts.SourceFile): APIModule`

##### processClass

**Signature**: `private processClass(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): APIClass | null`

##### processInterface

**Signature**: `private processInterface(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): APIInterface | null`

##### processFunction

**Signature**: `private processFunction(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): APIFunction | null`

##### processMethod

**Signature**: `private processMethod(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): APIMethod | null`

##### processProperty

**Signature**: `private processProperty(node: ts.PropertyDeclaration, sourceFile: ts.SourceFile): APIProperty | null`

##### processMethodSignature

**Signature**: `private processMethodSignature(node: ts.MethodSignature, sourceFile: ts.SourceFile): APIMethod | null`

##### processPropertySignature

**Signature**: `private processPropertySignature(node: ts.PropertySignature, sourceFile: ts.SourceFile): APIProperty | null`

##### extractDocumentation

**Signature**: `private extractDocumentation(node: ts.Node, sourceFile: ts.SourceFile): DocComment`

##### getJSDocComments

**Signature**: `private getJSDocComments(node: ts.Node, sourceFile: ts.SourceFile): string | null`

##### extractDescription

**Signature**: `private extractDescription(jsDoc: string): string`

##### extractParams

**Signature**: `private extractParams(jsDoc: string): Array<`

##### extractReturns

**Signature**: `private extractReturns(jsDoc: string):`

##### extractExample

**Signature**: `private extractExample(jsDoc: string): string | undefined`

##### extractTag

**Signature**: `private extractTag(jsDoc: string, tagName: string): string | undefined`

##### getModuleName

**Signature**: `private getModuleName(sourceFile: ts.SourceFile): string`

##### getExtendsClause

**Signature**: `private getExtendsClause(node: ts.ClassDeclaration): string | undefined`

##### getImplementsClauses

**Signature**: `private getImplementsClauses(node: ts.ClassDeclaration): string[]`

##### getInterfaceExtends

**Signature**: `private getInterfaceExtends(node: ts.InterfaceDeclaration): string[]`

##### getVisibility

**Signature**: `private getVisibility(node: ts.ClassElement): 'public' | 'private' | 'protected'`

##### hasModifier

**Signature**: `private hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean`

##### isExported

**Signature**: `private isExported(node: ts.Node): boolean`

##### getParameters

**Signature**: `private getParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>): Array<`

##### getReturnType

**Signature**: `private getReturnType(node: ts.FunctionLikeDeclaration): string`

##### getTypeString

**Signature**: `private getTypeString(type: ts.TypeNode | undefined): string`

##### getFunctionSignature

**Signature**: `private getFunctionSignature(node: ts.FunctionDeclaration): string`

##### getMethodSignature

**Signature**: `private getMethodSignature(node: ts.MethodDeclaration): string`

##### getMethodSignatureString

**Signature**: `private getMethodSignatureString(node: ts.MethodSignature): string`

##### processExports

**Signature**: `private processExports(node: ts.ExportDeclaration, module: APIModule): void`

#### MarkdownDocGenerator

**Methods**:

##### generateMarkdown

**Signature**: `static generateMarkdown(modules: APIModule[]): string`

##### generateModuleMarkdown

**Signature**: `private static generateModuleMarkdown(module: APIModule): string`

##### generateClassMarkdown

**Signature**: `private static generateClassMarkdown(cls: APIClass): string`

##### generateInterfaceMarkdown

**Signature**: `private static generateInterfaceMarkdown(iface: APIInterface): string`

##### generateFunctionMarkdown

**Signature**: `private static generateFunctionMarkdown(func: APIFunction): string`

##### generateMethodMarkdown

**Signature**: `private static generateMethodMarkdown(method: APIMethod): string`

##### toAnchor

**Signature**: `private static toAnchor(text: string): string`

### Interfaces

#### DocComment

**Properties**:

- `description: string` - 
- `params: Array<{ name: string; type: string; description?: string }>` - 
- `returns: { type: string; description?: string }` - 
- `example: string` - 
- `since: string` - 
- `deprecated: string` - 

#### APIMethod

**Properties**:

- `name: string` - 
- `signature: string` - 
- `visibility: 'public' | 'private' | 'protected'` - 
- `static: boolean` - 
- `async: boolean` - 
- `parameters: Array<{ name: string; type: string; optional: boolean }>` - 
- `returnType: string` - 
- `documentation: DocComment` - 

#### APIProperty

**Properties**:

- `name: string` - 
- `type: string` - 
- `visibility: 'public' | 'private' | 'protected'` - 
- `static: boolean` - 
- `readonly: boolean` - 
- `documentation: DocComment` - 

#### APIClass

**Properties**:

- `name: string` - 
- `extends: string` - 
- `implements: string[]` - 
- `abstract: boolean` - 
- `exported: boolean` - 
- `methods: APIMethod[]` - 
- `properties: APIProperty[]` - 
- `documentation: DocComment` - 

#### APIInterface

**Properties**:

- `name: string` - 
- `extends: string[]` - 
- `exported: boolean` - 
- `methods: APIMethod[]` - 
- `properties: APIProperty[]` - 
- `documentation: DocComment` - 

#### APIFunction

**Properties**:

- `name: string` - 
- `signature: string` - 
- `async: boolean` - 
- `parameters: Array<{ name: string; type: string; optional: boolean }>` - 
- `returnType: string` - 
- `exported: boolean` - 
- `documentation: DocComment` - 

#### APIModule

**Properties**:

- `name: string` - 
- `path: string` - 
- `classes: APIClass[]` - 
- `interfaces: APIInterface[]` - 
- `functions: APIFunction[]` - 
- `exports: string[]` - 


