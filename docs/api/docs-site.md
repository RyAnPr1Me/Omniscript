# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [docs-site](#docs-site)

## docs-site

**File**: `/home/runner/work/Omniscript/Omniscript/src/docs-site/index.ts`

### Classes

#### StaticDocGenerator

**Properties**:

- `config: DocSiteConfig` - 

**Methods**:

##### generateSite

Generate complete static documentation site

**Signature**: `async generateSite(): Promise<void>`

##### createDirectoryStructure

**Signature**: `private createDirectoryStructure(): void`

##### processMarkdownFiles

**Signature**: `private async processMarkdownFiles(): Promise<void>`

##### getMarkdownFiles

**Signature**: `private getMarkdownFiles(dir: string): string[]`

##### convertMarkdownToHtml

**Signature**: `private async convertMarkdownToHtml(mdPath: string): Promise<void>`

##### markdownToHtml

**Signature**: `private markdownToHtml(markdown: string): string`

##### wrapInTemplate

**Signature**: `private wrapInTemplate(content: string, title: string): string`

##### generateNavigation

**Signature**: `private async generateNavigation(): Promise<void>`

##### generateAssets

**Signature**: `private async generateAssets(): Promise<void>`

##### generateVersionSelector

**Signature**: `private async generateVersionSelector(): Promise<void>`

##### deploy

Deploy to a static hosting service (stub for future implementation)

**Signature**: `async deploy(target: 'github-pages' | 'netlify' | 'vercel'): Promise<void>`

### Interfaces

#### DocSiteConfig

**Properties**:

- `name: string` - 
- `description: string` - 
- `baseUrl: string` - 
- `version: string` - 
- `logoUrl: string` - 
- `repository: string` - 
- `outputDir: string` - 
- `sourceDir: string` - 
- `theme: 'light' | 'dark' | 'auto'` - 

#### DocVersion

**Properties**:

- `version: string` - 
- `path: string` - 
- `isLatest: boolean` - 

### Functions

#### generateDocSite

Convenience function to generate documentation site

**Signature**: `export async function generateDocSite(config: Partial<DocSiteConfig>): Promise<void>`


