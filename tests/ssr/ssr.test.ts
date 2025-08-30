import { SSRRenderer, SSRBuilder, SSRConfig, RenderContext } from '../../src/ssr';
import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Server-Side Rendering (SSR)', () => {
  const testOutputDir = '/tmp/omniscript-ssr-test';
  const testEntryFile = path.join(__dirname, 'test-app.omni');
  
  beforeEach(() => {
    // Create test entry file
    const testAppCode = `
// Test Omniscript application for SSR
class HomePage {
  render(props = {}) {
    return {
      toString: () => '<div><h1>Home Page</h1><p>Server-rendered content</p></div>'
    };
  }
  
  async getInitialProps(context) {
    return { serverRendered: true, url: context.url };
  }
}

class App {
  render() {
    return new HomePage();
  }
}

export default App;
`;
    
    fs.writeFileSync(testEntryFile, testAppCode);
    
    // Clean output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });
  
  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testEntryFile)) {
      fs.unlinkSync(testEntryFile);
    }
    
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('SSRRenderer', () => {
    let config: SSRConfig;
    let renderer: SSRRenderer;

    beforeEach(() => {
      config = {
        entry: testEntryFile,
        outputDir: testOutputDir,
        enableHydration: true,
        minify: false,
        generateSitemap: false,
        routes: ['/']
      };
      
      renderer = new SSRRenderer(config);
    });

    test('should initialize renderer with config', () => {
      expect(renderer).toBeInstanceOf(SSRRenderer);
    });

    test('should render a page with basic context', async () => {
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const result = await renderer.render(context);

      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('statusCode');
      expect(result.statusCode).toBe(200);
      expect(typeof result.html).toBe('string');
      expect(result.html.length).toBeGreaterThan(0);
    });

    test('should include proper HTML structure', async () => {
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const result = await renderer.render(context);

      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html lang="en">');
      expect(result.html).toContain('<head>');
      expect(result.html).toContain('<body>');
      expect(result.html).toContain('<div id="app">');
    });

    test('should handle meta tags', async () => {
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const result = await renderer.render(context);

      expect(result.html).toContain('<title>');
      expect(result.html).toContain('<meta charset="UTF-8">');
      expect(result.html).toContain('<meta name="viewport"');
    });

    test('should include CSS and JS assets', async () => {
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const result = await renderer.render(context);

      expect(result.css).toBeDefined();
      expect(result.js).toBeDefined();
      expect(typeof result.css).toBe('string');
      expect(typeof result.js).toBe('string');
    });

    test('should handle different routes', async () => {
      const homeContext: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const aboutContext: RenderContext = {
        url: '/about',
        params: {},
        query: {},
        headers: {}
      };

      const homeResult = await renderer.render(homeContext);
      const aboutResult = await renderer.render(aboutContext);

      expect(homeResult.statusCode).toBe(200);
      expect(aboutResult.statusCode).toBe(200);
      expect(homeResult.html).toBeDefined();
      expect(aboutResult.html).toBeDefined();
    });

    test('should handle not found routes', async () => {
      const context: RenderContext = {
        url: '/nonexistent',
        params: {},
        query: {},
        headers: {}
      };

      const result = await renderer.render(context);

      expect(result.statusCode).toBe(200); // Should still render, but with NotFoundPage component
      expect(result.html).toBeDefined();
    });

    test('should handle errors gracefully', async () => {
      // Test with invalid entry file
      const badConfig: SSRConfig = {
        entry: '/nonexistent/file.omni',
        outputDir: testOutputDir,
        enableHydration: true,
        minify: false,
        generateSitemap: false
      };

      const badRenderer = new SSRRenderer(badConfig);
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const result = await badRenderer.render(context);

      expect(result.statusCode).toBe(500);
      expect(result.html).toContain('Server Rendering Error');
    });

    test('should create SSR middleware', () => {
      const middleware = renderer.createSSRMiddleware();
      
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    test('should handle middleware execution', async () => {
      const middleware = renderer.createSSRMiddleware();
      
      const mockReq = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn(),
        redirect: jest.fn()
      };
      
      const mockNext = jest.fn();

      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockRes.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle redirects in middleware', async () => {
      const middleware = renderer.createSSRMiddleware();
      
      const mockReq = {
        url: '/old-url', // This should redirect
        params: {},
        query: {},
        headers: {}
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn(),
        redirect: jest.fn()
      };
      
      const mockNext = jest.fn();

      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith(302, '/new-url');
    });

    test('should generate static site', async () => {
      const staticConfig: SSRConfig = {
        ...config,
        routes: ['/', '/about', '/contact'],
        generateSitemap: true
      };

      const staticRenderer = new SSRRenderer(staticConfig);
      await staticRenderer.generateStaticSite();

      // Check if output directory was created
      expect(fs.existsSync(testOutputDir)).toBe(true);

      // Check if index.html was generated
      const indexPath = path.join(testOutputDir, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);

      // Check if sitemap was generated
      const sitemapPath = path.join(testOutputDir, 'sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);

      // Verify content
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain('<!DOCTYPE html>');
      expect(indexContent).toContain('<div id="app">');

      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
      expect(sitemapContent).toContain('<?xml version="1.0"');
      expect(sitemapContent).toContain('<urlset');
    });
  });

  describe('SSRBuilder', () => {
    let config: SSRConfig;
    let builder: SSRBuilder;

    beforeEach(() => {
      config = {
        entry: testEntryFile,
        outputDir: testOutputDir,
        enableHydration: true,
        minify: false,
        generateSitemap: true,
        routes: ['/']
      };
      
      builder = new SSRBuilder(config);
    });

    test('should initialize builder with config', () => {
      expect(builder).toBeInstanceOf(SSRBuilder);
    });

    test('should build static site', async () => {
      await builder.build();

      expect(fs.existsSync(testOutputDir)).toBe(true);
      
      const indexPath = path.join(testOutputDir, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    test('should create development server', () => {
      const devServer = builder.createDevelopmentServer();

      expect(devServer).toHaveProperty('middleware');
      expect(devServer).toHaveProperty('render');
      expect(typeof devServer.middleware).toBe('function');
      expect(typeof devServer.render).toBe('function');
    });

    test('should render in development server', async () => {
      const devServer = builder.createDevelopmentServer();
      
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const result = await devServer.render(context);

      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('statusCode');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('SSR Configuration', () => {
    test('should handle custom template', async () => {
      const templatePath = path.join(__dirname, 'custom-template.html');
      const customTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>{{TITLE}}</title>
  {{META}}
  {{CSS}}
</head>
<body>
  <header>Custom Header</header>
  <main>{{CONTENT}}</main>
  <footer>Custom Footer</footer>
  {{JS}}
</body>
</html>
      `.trim();

      fs.writeFileSync(templatePath, customTemplate);

      const config: SSRConfig = {
        entry: testEntryFile,
        outputDir: testOutputDir,
        templatePath,
        enableHydration: true,
        minify: false,
        generateSitemap: false
      };

      const renderer = new SSRRenderer(config);
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      const result = await renderer.render(context);

      expect(result.html).toContain('Custom Header');
      expect(result.html).toContain('Custom Footer');
      expect(result.html).toContain('<main>');

      // Clean up
      fs.unlinkSync(templatePath);
    });

    test('should handle static file copying', async () => {
      const staticDir = path.join(__dirname, 'static');
      const testStaticFile = path.join(staticDir, 'test.txt');

      // Create static directory and file
      fs.mkdirSync(staticDir, { recursive: true });
      fs.writeFileSync(testStaticFile, 'Static file content');

      const config: SSRConfig = {
        entry: testEntryFile,
        outputDir: testOutputDir,
        staticDir,
        enableHydration: true,
        minify: false,
        generateSitemap: false,
        routes: ['/']
      };

      const renderer = new SSRRenderer(config);
      await renderer.generateStaticSite();

      // Check if static file was copied
      const copiedFile = path.join(testOutputDir, 'test.txt');
      expect(fs.existsSync(copiedFile)).toBe(true);
      
      const content = fs.readFileSync(copiedFile, 'utf-8');
      expect(content).toBe('Static file content');

      // Clean up
      fs.rmSync(staticDir, { recursive: true, force: true });
    });
  });

  describe('SSR Integration', () => {
    test('should handle complex rendering scenarios', async () => {
      const config: SSRConfig = {
        entry: testEntryFile,
        outputDir: testOutputDir,
        enableHydration: true,
        minify: false,
        generateSitemap: true,
        routes: ['/', '/about', '/contact']
      };

      const renderer = new SSRRenderer(config);
      
      // Test multiple contexts
      const contexts: RenderContext[] = [
        { url: '/', params: {}, query: {}, headers: {} },
        { url: '/about', params: {}, query: { tab: 'info' }, headers: { 'user-agent': 'test' } },
        { url: '/contact', params: { id: '123' }, query: {}, headers: {} }
      ];

      for (const context of contexts) {
        const result = await renderer.render(context);
        expect(result.statusCode).toBe(200);
        expect(result.html).toContain('<!DOCTYPE html>');
      }
    });

    test('should maintain consistent output', async () => {
      const config: SSRConfig = {
        entry: testEntryFile,
        outputDir: testOutputDir,
        enableHydration: true,
        minify: false,
        generateSitemap: false
      };

      const renderer = new SSRRenderer(config);
      const context: RenderContext = {
        url: '/',
        params: {},
        query: {},
        headers: {}
      };

      // Render the same page multiple times
      const result1 = await renderer.render(context);
      const result2 = await renderer.render(context);

      expect(result1.statusCode).toBe(result2.statusCode);
      expect(result1.html.length).toBe(result2.html.length);
      // Note: Exact HTML equality might vary due to timestamps, so we check structure
      expect(result1.html).toContain('<!DOCTYPE html>');
      expect(result2.html).toContain('<!DOCTYPE html>');
    });
  });
});