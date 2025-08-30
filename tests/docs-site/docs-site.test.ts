import { StaticDocGenerator, generateDocSite } from '../../src/docs-site';
import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('StaticDocGenerator', () => {
  const testOutputDir = '/tmp/omniscript-test-site';
  const testSourceDir = '/tmp/omniscript-test-docs';

  beforeEach(() => {
    // Clean up any existing test directories
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    if (fs.existsSync(testSourceDir)) {
      fs.rmSync(testSourceDir, { recursive: true });
    }

    // Create test source directory with sample markdown
    fs.mkdirSync(testSourceDir, { recursive: true });
    fs.writeFileSync(path.join(testSourceDir, 'README.md'), '# Test Documentation\n\nThis is a test.');
    fs.writeFileSync(path.join(testSourceDir, 'guide.md'), '## Getting Started\n\nQuick start guide.');
  });

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    if (fs.existsSync(testSourceDir)) {
      fs.rmSync(testSourceDir, { recursive: true });
    }
  });

  test('generator can be instantiated', () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'light'
    });
    
    expect(generator).toBeDefined();
  });

  test('generateSite creates required directories', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'light'
    });

    await generator.generateSite();

    // Check that required directories were created
    expect(fs.existsSync(testOutputDir)).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'css'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'js'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'api'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'guide'))).toBe(true);
  });

  test('generateSite creates required files', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'light'
    });

    await generator.generateSite();

    // Check that required files were created
    expect(fs.existsSync(path.join(testOutputDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'css', 'styles.css'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'js', 'main.js'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'versions.json'))).toBe(true);
  });

  test('generateSite converts markdown to HTML', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'light'
    });

    await generator.generateSite();

    // Check that markdown files were converted to HTML
    expect(fs.existsSync(path.join(testOutputDir, 'README.html'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'guide.html'))).toBe(true);

    // Check content of converted HTML
    const readmeHtml = fs.readFileSync(path.join(testOutputDir, 'README.html'), 'utf-8');
    expect(readmeHtml).toContain('<h1>Test Documentation</h1>');
    expect(readmeHtml).toContain('<title>README - Test Docs</title>');
  });

  test('CSS file contains required styles', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'dark'
    });

    await generator.generateSite();

    const cssContent = fs.readFileSync(path.join(testOutputDir, 'css', 'styles.css'), 'utf-8');
    expect(cssContent).toContain('--primary-color');
    expect(cssContent).toContain('.theme-dark');
    expect(cssContent).toContain('.header');
    expect(cssContent).toContain('.navigation');
  });

  test('JavaScript file contains required functionality', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'auto'
    });

    await generator.generateSite();

    const jsContent = fs.readFileSync(path.join(testOutputDir, 'js', 'main.js'), 'utf-8');
    expect(jsContent).toContain('DOMContentLoaded');
    expect(jsContent).toContain('version-select');
    expect(jsContent).toContain('prefers-color-scheme');
  });

  test('versions.json contains correct version info', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '2.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'light'
    });

    await generator.generateSite();

    const versionsContent = fs.readFileSync(path.join(testOutputDir, 'versions.json'), 'utf-8');
    const versions = JSON.parse(versionsContent);
    
    expect(versions).toHaveLength(1);
    expect(versions[0].version).toBe('2.0.0');
    expect(versions[0].isLatest).toBe(true);
  });

  test('generateDocSite convenience function works', async () => {
    await generateDocSite({
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      name: 'Convenience Test'
    });

    expect(fs.existsSync(path.join(testOutputDir, 'index.html'))).toBe(true);
    
    const indexContent = fs.readFileSync(path.join(testOutputDir, 'index.html'), 'utf-8');
    expect(indexContent).toContain('Convenience Test');
  });

  test('deploy function handles different targets', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: testSourceDir,
      theme: 'light'
    });

    // Should not throw errors for any deployment target
    await expect(generator.deploy('github-pages')).resolves.not.toThrow();
    await expect(generator.deploy('netlify')).resolves.not.toThrow();
    await expect(generator.deploy('vercel')).resolves.not.toThrow();
  });

  test('handles missing source directory gracefully', async () => {
    const generator = new StaticDocGenerator({
      name: 'Test Docs',
      description: 'Test documentation site',
      baseUrl: 'https://test.com',
      version: '1.0.0',
      outputDir: testOutputDir,
      sourceDir: '/nonexistent/directory',
      theme: 'light'
    });

    // Should not throw error, just warn
    await expect(generator.generateSite()).resolves.not.toThrow();
    
    // Should still create basic structure
    expect(fs.existsSync(path.join(testOutputDir, 'index.html'))).toBe(true);
  });
});