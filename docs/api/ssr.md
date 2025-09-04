# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [ssr](#ssr)

## ssr

**File**: `src/ssr/index.ts`

### Classes

#### SSRRenderer

**Properties**:

- `runtime: Runtime` - 
- `config: SSRConfig` - 
- `componentCache: Map<string, any>` - 
- `templateCache: Map<string, string>` - 

**Methods**:

##### initializeRenderer

**Signature**: `private initializeRenderer(): void`

##### createServerDocument

**Signature**: `private createServerDocument(): any`

##### setupSSRGlobals

**Signature**: `private setupSSRGlobals(): void`

##### render

**Signature**: `async render(context: RenderContext): Promise<RenderResult>`

##### loadEntryFile

**Signature**: `private async loadEntryFile(): Promise<string>`

##### renderApp

**Signature**: `private async renderApp(app: any, context: RenderContext): Promise<RenderResult>`

##### matchRoute

**Signature**: `private matchRoute(url: string):`

##### getComponent

**Signature**: `private async getComponent(componentName: string): Promise<any>`

##### createMockComponent

**Signature**: `private createMockComponent(name: string): any`

##### renderComponentTree

**Signature**: `private async renderComponentTree(component: any, context: RenderContext): Promise<string>`

##### renderComponentToString

**Signature**: `private renderComponentToString(component: any): string`

##### extractAssets

**Signature**: `private extractAssets():`

##### extractMeta

**Signature**: `private extractMeta(component: any): any`

##### generateMetaTags

**Signature**: `private generateMetaTags(meta: any): string`

##### applyTemplate

**Signature**: `private applyTemplate(html: string, assets:`

##### getTemplate

**Signature**: `private getTemplate(): string`

##### renderErrorPage

**Signature**: `private renderErrorPage(error: any): string`

##### createServerApp

**Signature**: `private createServerApp(config: any): any`

##### createSSRMiddleware

**Signature**: `createSSRMiddleware()`

##### generateStaticSite

**Signature**: `async generateStaticSite(): Promise<void>`

##### generateStaticPage

**Signature**: `private async generateStaticPage(route: string, outputDir: string): Promise<void>`

##### copyStaticFiles

**Signature**: `private async copyStaticFiles(outputDir: string): Promise<void>`

##### generateSitemap

**Signature**: `private async generateSitemap(outputDir: string): Promise<void>`

#### SSRBuilder

**Properties**:

- `config: SSRConfig` - 

**Methods**:

##### build

**Signature**: `async build(): Promise<void>`

##### createDevelopmentServer

**Signature**: `createDevelopmentServer(): any`

### Interfaces

#### SSRConfig

**Properties**:

- `entry: string` - 
- `outputDir: string` - 
- `templatePath: string` - 
- `staticDir: string` - 
- `enableHydration: boolean` - 
- `minify: boolean` - 
- `generateSitemap: boolean` - 
- `routes: string[]` - 

#### RenderContext

**Properties**:

- `url: string` - 
- `params: Record<string, string>` - 
- `query: Record<string, string>` - 
- `headers: Record<string, string>` - 
- `state: any` - 

#### RenderResult

**Properties**:

- `html: string` - 
- `css: string` - 
- `js: string` - 
- `meta: {
    title?: string;
    description?: string;
    keywords?: string[];
    og?: Record<string, string>;
  }` - 
- `statusCode: number` - 
- `redirectTo: string` - 


