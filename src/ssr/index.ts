import * as fs from 'fs';
import * as path from 'path';
import { debug } from '../debug';
import { Runtime } from '../runtime';

export interface SSRConfig {
  entry: string;
  outputDir: string;
  templatePath?: string;
  staticDir?: string;
  enableHydration: boolean;
  minify: boolean;
  generateSitemap: boolean;
  routes?: string[];
}

export interface RenderContext {
  url: string;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  state?: any;
}

export interface RenderResult {
  html: string;
  css?: string;
  js?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
    og?: Record<string, string>;
  };
  statusCode: number;
  redirectTo?: string;
}

export class SSRRenderer {
  private runtime: Runtime;
  private config: SSRConfig;
  private componentCache: Map<string, any> = new Map();
  private templateCache: Map<string, string> = new Map();

  constructor(config: SSRConfig) {
    this.config = config;
    this.runtime = new Runtime();
    this.initializeRenderer();
  }

  private initializeRenderer(): void {
    debug.debug('SSR', `Initializing SSR renderer with entry: ${this.config.entry}`);
    
    // Set up runtime for SSR
    this.runtime.setVar('__SSR__', true);
    this.runtime.setVar('__CLIENT__', false);
    this.runtime.setVar('window', undefined);
    this.runtime.setVar('document', this.createServerDocument());
    
    // Load global SSR utilities
    this.setupSSRGlobals();
  }

  private createServerDocument(): any {
    // Mock document object for server-side rendering
    return {
      createElement: (tagName: string) => ({
        tagName: tagName.toUpperCase(),
        attributes: {} as Record<string, string>,
        children: [] as any[],
        innerHTML: '',
        setAttribute: function(name: string, value: string) {
          this.attributes[name] = value;
        },
        getAttribute: function(name: string) {
          return this.attributes[name];
        },
        appendChild: function(child: any) {
          this.children.push(child);
        },
        toString: function() {
          const attrs = Object.entries(this.attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
          const attrsStr = attrs ? ` ${attrs}` : '';
          const childrenStr = this.children.map((c: any) => c.toString()).join('');
          
          const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
          if (selfClosing.includes(tagName.toLowerCase())) {
            return `<${tagName}${attrsStr} />`;
          }
          
          return `<${tagName}${attrsStr}>${this.innerHTML}${childrenStr}</${tagName}>`;
        }
      }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      title: '',
      head: {
        appendChild: () => {},
        children: []
      },
      body: {
        appendChild: () => {},
        children: []
      }
    };
  }

  private setupSSRGlobals(): void {
    // Set up global functions for SSR
    this.runtime.setVar('renderToString', (component: any) => {
      return this.renderComponentToString(component);
    });

    this.runtime.setVar('generateMetaTags', (meta: any) => {
      return this.generateMetaTags(meta);
    });

    this.runtime.setVar('createServerApp', (appConfig: any) => {
      return this.createServerApp(appConfig);
    });
  }

  async render(context: RenderContext): Promise<RenderResult> {
    try {
      debug.debug('SSR', `Rendering URL: ${context.url}`);
      
      const startTime = Date.now();
      
      // Load and execute the entry file
      const entryCode = await this.loadEntryFile();
      // For SSR, we need to simulate execution rather than using bytecode
      // In a real implementation, this would use the Omniscript parser/compiler
      const mockApp = { render: () => ({ toString: () => '<div>SSR App</div>' }) };
      const app = mockApp;
      
      // Render the application
      const renderResult = await this.renderApp(app, context);
      
      const renderTime = Date.now() - startTime;
      debug.debug('SSR', `Rendered in ${renderTime}ms`);
      
      return renderResult;
    } catch (error) {
      debug.error('SSR', `Rendering failed: ${error}`);
      return {
        html: this.renderErrorPage(error),
        statusCode: 500
      };
    }
  }

  private async loadEntryFile(): Promise<string> {
    const entryPath = path.resolve(this.config.entry);
    
    if (!fs.existsSync(entryPath)) {
      throw new Error(`Entry file not found: ${entryPath}`);
    }
    
    return fs.readFileSync(entryPath, 'utf-8');
  }

  private async renderApp(app: any, context: RenderContext): Promise<RenderResult> {
    // Set up rendering context
    this.runtime.setVar('__RENDER_CONTEXT__', context);
    
    // Route matching
    const route = this.matchRoute(context.url);
    if (route?.redirect) {
      return {
        html: '',
        statusCode: 302,
        redirectTo: route.redirect
      };
    }

    // Render component tree
    const component = await this.getComponent(route?.component || 'App');
    const html = await this.renderComponentTree(component, context);
    
    // Extract CSS and JS
    const { css, js } = this.extractAssets();
    
    // Generate meta tags
    const meta = this.extractMeta(component);
    
    // Apply template
    const finalHtml = this.applyTemplate(html, { css, js, meta });
    
    return {
      html: finalHtml,
      css,
      js,
      meta,
      statusCode: 200
    };
  }

  private matchRoute(url: string): { component?: string; redirect?: string } | null {
    // Simple route matching - in production, use a proper router
    const routes: Record<string, any> = {
      '/': { component: 'HomePage' },
      '/about': { component: 'AboutPage' },
      '/contact': { component: 'ContactPage' },
      '/old-url': { redirect: '/new-url' }
    };
    
    return routes[url] || { component: 'NotFoundPage' };
  }

  private async getComponent(componentName: string): Promise<any> {
    if (this.componentCache.has(componentName)) {
      return this.componentCache.get(componentName);
    }
    
    // In a real implementation, this would load components from files
    const component = this.createMockComponent(componentName);
    this.componentCache.set(componentName, component);
    
    return component;
  }

  private createMockComponent(name: string): any {
    // Mock component for demonstration
    return {
      name,
      render: (props: any = {}) => {
        const doc = this.runtime.getVar('document') as any;
        const element = doc.createElement('div');
        element.setAttribute('id', `${name.toLowerCase()}-root`);
        element.innerHTML = `<h1>${name} Component</h1><p>Rendered on server</p>`;
        return element;
      },
      getInitialProps: async (context: RenderContext) => {
        return { serverRendered: true, url: context.url };
      }
    };
  }

  private async renderComponentTree(component: any, context: RenderContext): Promise<string> {
    // Get initial props
    const props = component.getInitialProps ? 
      await component.getInitialProps(context) : {};
    
    // Render component
    const element = component.render(props);
    
    // Convert to HTML string
    return element.toString();
  }

  private renderComponentToString(component: any): string {
    if (typeof component.toString === 'function') {
      return component.toString();
    }
    
    if (typeof component.render === 'function') {
      const element = component.render();
      return element.toString();
    }
    
    return String(component);
  }

  private extractAssets(): { css: string; js: string } {
    // In a real implementation, this would extract CSS and JS from the build
    return {
      css: '/* SSR-generated CSS */',
      js: `
        // Hydration script
        window.__SSR_DATA__ = ${JSON.stringify({ hydrated: true })};
        console.log('Hydrating SSR application...');
      `
    };
  }

  private extractMeta(component: any): any {
    // Extract meta information from component
    return {
      title: `${component.name} - Omniscript SSR`,
      description: 'Server-side rendered page using Omniscript',
      keywords: ['omniscript', 'ssr', 'server-side-rendering']
    };
  }

  private generateMetaTags(meta: any): string {
    const tags: string[] = [];
    
    if (meta.title) {
      tags.push(`<title>${meta.title}</title>`);
    }
    
    if (meta.description) {
      tags.push(`<meta name="description" content="${meta.description}">`);
    }
    
    if (meta.keywords) {
      tags.push(`<meta name="keywords" content="${meta.keywords.join(', ')}">`);
    }
    
    if (meta.og) {
      for (const [key, value] of Object.entries(meta.og)) {
        tags.push(`<meta property="og:${key}" content="${value}">`);
      }
    }
    
    return tags.join('\n');
  }

  private applyTemplate(html: string, assets: { css?: string; js?: string; meta?: any }): string {
    let template = this.getTemplate();
    
    template = template.replace('{{CONTENT}}', html);
    template = template.replace('{{TITLE}}', assets.meta?.title || 'Omniscript SSR');
    template = template.replace('{{META}}', this.generateMetaTags(assets.meta || {}));
    template = template.replace('{{CSS}}', assets.css ? `<style>${assets.css}</style>` : '');
    template = template.replace('{{JS}}', assets.js ? `<script>${assets.js}</script>` : '');
    
    return template;
  }

  private getTemplate(): string {
    if (this.config.templatePath) {
      const templatePath = path.resolve(this.config.templatePath);
      if (this.templateCache.has(templatePath)) {
        return this.templateCache.get(templatePath)!;
      }
      
      const template = fs.readFileSync(templatePath, 'utf-8');
      this.templateCache.set(templatePath, template);
      return template;
    }
    
    // Default template
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  {{META}}
  {{CSS}}
</head>
<body>
  <div id="app">{{CONTENT}}</div>
  {{JS}}
</body>
</html>
    `.trim();
  }

  private renderErrorPage(error: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Error - Omniscript SSR</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 4px; }
    .error h1 { margin-top: 0; }
    .error pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="error">
    <h1>Server Rendering Error</h1>
    <p>An error occurred while rendering this page on the server.</p>
    <pre>${error.stack || error.message || error}</pre>
  </div>
</body>
</html>
    `.trim();
  }

  private createServerApp(config: any): any {
    return {
      config,
      render: (context: RenderContext) => this.render(context),
      generate: () => this.generateStaticSite(),
      middleware: this.createSSRMiddleware()
    };
  }

  createSSRMiddleware() {
    return async (req: any, res: any, next: any) => {
      try {
        const context: RenderContext = {
          url: req.url,
          params: req.params || {},
          query: req.query || {},
          headers: req.headers || {}
        };
        
        const result = await this.render(context);
        
        if (result.redirectTo) {
          res.redirect(result.statusCode, result.redirectTo);
          return;
        }
        
        res.status(result.statusCode);
        res.set('Content-Type', 'text/html');
        res.send(result.html);
      } catch (error) {
        debug.error('SSR', `Middleware error: ${error}`);
        next(error);
      }
    };
  }

  async generateStaticSite(): Promise<void> {
    if (!this.config.routes) {
      debug.warn('SSR', 'No routes specified for static site generation');
      return;
    }
    
    debug.debug('SSR', `Generating static site with ${this.config.routes.length} routes`);
    
    // Ensure output directory exists
    const outputDir = path.resolve(this.config.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate pages for each route
    for (const route of this.config.routes) {
      await this.generateStaticPage(route, outputDir);
    }
    
    // Copy static files
    if (this.config.staticDir) {
      await this.copyStaticFiles(outputDir);
    }
    
    // Generate sitemap
    if (this.config.generateSitemap) {
      await this.generateSitemap(outputDir);
    }
    
    debug.debug('SSR', 'Static site generation complete');
  }

  private async generateStaticPage(route: string, outputDir: string): Promise<void> {
    try {
      const context: RenderContext = {
        url: route,
        params: {},
        query: {},
        headers: {}
      };
      
      const result = await this.render(context);
      
      if (result.redirectTo) {
        debug.debug('SSR', `Skipping redirect route: ${route} -> ${result.redirectTo}`);
        return;
      }
      
      const fileName = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
      const filePath = path.join(outputDir, fileName);
      
      // Ensure directory exists
      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, result.html, 'utf-8');
      debug.debug('SSR', `Generated static page: ${filePath}`);
    } catch (error) {
      debug.error('SSR', `Failed to generate static page for ${route}: ${error}`);
    }
  }

  private async copyStaticFiles(outputDir: string): Promise<void> {
    const staticDir = path.resolve(this.config.staticDir!);
    if (!fs.existsSync(staticDir)) {
      debug.warn('SSR', `Static directory not found: ${staticDir}`);
      return;
    }
    
    // Simple file copying - in production, use a more robust solution
    const files = fs.readdirSync(staticDir, { recursive: true });
    for (const file of files) {
      const srcPath = path.join(staticDir, file as string);
      const destPath = path.join(outputDir, file as string);
      
      if (fs.statSync(srcPath).isFile()) {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
      }
    }
    
    debug.debug('SSR', 'Static files copied');
  }

  private async generateSitemap(outputDir: string): Promise<void> {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${this.config.routes!.map(route => `
  <url>
    <loc>https://example.com${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`).join('')}
</urlset>`;
    
    const sitemapPath = path.join(outputDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
    debug.debug('SSR', `Generated sitemap: ${sitemapPath}`);
  }
}

export class SSRBuilder {
  private config: SSRConfig;
  
  constructor(config: SSRConfig) {
    this.config = config;
  }
  
  async build(): Promise<void> {
    debug.debug('SSR', 'Building SSR application...');
    
    const renderer = new SSRRenderer(this.config);
    await renderer.generateStaticSite();
    
    debug.debug('SSR', 'SSR build complete');
  }
  
  createDevelopmentServer(): any {
    const renderer = new SSRRenderer(this.config);
    return {
      middleware: renderer.createSSRMiddleware(),
      render: (context: RenderContext) => renderer.render(context)
    };
  }
}

export { SSRRenderer as default };