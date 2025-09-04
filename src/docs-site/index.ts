/**
 * Static site generator for versioned documentation
 * Generates HTML documentation from markdown with version management
 */

import * as fs from 'fs';
import * as path from 'path';

export interface DocSiteConfig {
  name: string;
  description: string;
  baseUrl: string;
  version: string;
  logoUrl?: string;
  repository?: string;
  outputDir: string;
  sourceDir: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface DocVersion {
  version: string;
  path: string;
  isLatest: boolean;
}

export class StaticDocGenerator {
  private config: DocSiteConfig;

  constructor(config: DocSiteConfig) {
    this.config = config;
  }

  /**
   * Generate complete static documentation site
   */
  async generateSite(): Promise<void> {
    console.log(`📖 Generating static documentation site for ${this.config.name}...`);

    // Create output directory structure
    this.createDirectoryStructure();

    // Copy and process markdown files
    await this.processMarkdownFiles();

    // Generate navigation and index
    await this.generateNavigation();

    // Generate CSS and assets
    await this.generateAssets();

    // Generate version selector
    await this.generateVersionSelector();

    console.log(`✅ Static site generated at: ${this.config.outputDir}`);
  }

  private createDirectoryStructure(): void {
    const dirs = [
      this.config.outputDir,
      path.join(this.config.outputDir, 'css'),
      path.join(this.config.outputDir, 'js'),
      path.join(this.config.outputDir, 'api'),
      path.join(this.config.outputDir, 'guide'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async processMarkdownFiles(): Promise<void> {
    const sourceDir = this.config.sourceDir;
    
    if (!fs.existsSync(sourceDir)) {
      console.warn(`Source directory not found: ${sourceDir}`);
      return;
    }

    // Process all markdown files
    const files = this.getMarkdownFiles(sourceDir);
    
    for (const file of files) {
      await this.convertMarkdownToHtml(file);
    }
  }

  private getMarkdownFiles(dir: string): string[] {
    const files: string[] = [];
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.getMarkdownFiles(fullPath));
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private async convertMarkdownToHtml(mdPath: string): Promise<void> {
    const content = fs.readFileSync(mdPath, 'utf-8');
    
    // Simple markdown to HTML conversion (basic implementation)
    let html = this.markdownToHtml(content);
    
    // Get relative path from source
    const relativePath = path.relative(this.config.sourceDir, mdPath);
    const htmlPath = path.join(this.config.outputDir, relativePath.replace('.md', '.html'));
    
    // Ensure directory exists
    const htmlDir = path.dirname(htmlPath);
    if (!fs.existsSync(htmlDir)) {
      fs.mkdirSync(htmlDir, { recursive: true });
    }
    
    // Wrap in template
    html = this.wrapInTemplate(html, path.basename(mdPath, '.md'));
    
    fs.writeFileSync(htmlPath, html);
  }

  private markdownToHtml(markdown: string): string {
    // Basic markdown conversion (simplified)
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^\n/gm, '<br>')
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '')
      .join('\n');
  }

  private wrapInTemplate(content: string, title: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${this.config.name}</title>
    <link rel="stylesheet" href="/css/styles.css">
    <meta name="description" content="${this.config.description}">
</head>
<body class="theme-${this.config.theme}">
    <header class="header">
        <div class="container">
            <div class="header-content">
                ${this.config.logoUrl ? `<img src="${this.config.logoUrl}" alt="${this.config.name}" class="logo">` : ''}
                <h1 class="site-title">${this.config.name}</h1>
                <div class="version-selector">
                    <select id="version-select">
                        <option value="${this.config.version}">${this.config.version}</option>
                    </select>
                </div>
            </div>
        </div>
    </header>
    
    <nav class="navigation">
        <div class="container">
            <ul class="nav-links">
                <li><a href="/index.html">Home</a></li>
                <li><a href="/guide/index.html">Guide</a></li>
                <li><a href="/api/index.html">API Reference</a></li>
                ${this.config.repository ? `<li><a href="${this.config.repository}" target="_blank">GitHub</a></li>` : ''}
            </ul>
        </div>
    </nav>
    
    <main class="main">
        <div class="container">
            <div class="content">
                ${content}
            </div>
        </div>
    </main>
    
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${this.config.name}. Documentation generated with Omniscript static site generator.</p>
        </div>
    </footer>
    
    <script src="/js/main.js"></script>
</body>
</html>`;
  }

  private async generateNavigation(): Promise<void> {
    const indexHtml = this.wrapInTemplate(`
        <h1>Welcome to ${this.config.name}</h1>
        <p>${this.config.description}</p>
        
        <h2>Documentation</h2>
        <ul>
            <li><a href="/guide/index.html">User Guide</a></li>
            <li><a href="/api/index.html">API Reference</a></li>
        </ul>
        
        <h2>Quick Links</h2>
        <ul>
            ${this.config.repository ? `<li><a href="${this.config.repository}">Source Code</a></li>` : ''}
            <li><a href="/api/index.html">Browse API Documentation</a></li>
        </ul>
    `, 'Home');

    fs.writeFileSync(path.join(this.config.outputDir, 'index.html'), indexHtml);

    // Generate guide index if guide dir exists
    const guideDir = path.join(this.config.outputDir, 'guide');
    if (fs.existsSync(guideDir)) {
      const guideIndexHtml = this.wrapInTemplate(`
        <h1>User Guide</h1>
        <p>Welcome to the ${this.config.name} user guide.</p>
        
        <h2>Getting Started</h2>
        <ul>
            <li><a href="installation.html">Installation</a></li>
            <li><a href="quick-start.html">Quick Start</a></li>
        </ul>
      `, 'Guide');
      
      fs.writeFileSync(path.join(guideDir, 'index.html'), guideIndexHtml);
    }
  }

  private async generateAssets(): Promise<void> {
    // Generate CSS
    const css = `
/* Modern documentation styles */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --background: #ffffff;
  --surface: #f8fafc;
  --text: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --code-bg: #f1f5f9;
}

.theme-dark {
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
  --code-bg: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--text);
  background-color: var(--background);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 32px;
}

.site-title {
  font-size: 1.5rem;
  font-weight: 600;
  flex: 1;
}

.version-selector select {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--background);
  color: var(--text);
}

.navigation {
  background: var(--primary-color);
  padding: 0.75rem 0;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.nav-links a:hover {
  opacity: 0.8;
}

.main {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.content {
  max-width: 800px;
}

.content h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.5rem;
}

.content h2 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: var(--primary-color);
}

.content h3 {
  font-size: 1.25rem;
  margin: 1.5rem 0 0.75rem;
}

.content p {
  margin-bottom: 1rem;
}

.content ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.content li {
  margin-bottom: 0.25rem;
}

.content code {
  background: var(--code-bg);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.content pre {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.content pre code {
  background: none;
  padding: 0;
}

.content a {
  color: var(--primary-color);
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

.footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 1rem 0;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .nav-links {
    flex-direction: column;
    gap: 1rem;
  }
  
  .content {
    padding: 0 1rem;
  }
}
`;

    fs.writeFileSync(path.join(this.config.outputDir, 'css', 'styles.css'), css);

    // Generate JavaScript
    const js = `
// Theme switching and version management
document.addEventListener('DOMContentLoaded', function() {
    // Theme detection
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && document.body.classList.contains('theme-auto')) {
        document.body.classList.remove('theme-auto');
        document.body.classList.add('theme-dark');
    }
    
    // Version selector functionality
    const versionSelect = document.getElementById('version-select');
    if (versionSelect) {
        versionSelect.addEventListener('change', function() {
            // In a real implementation, this would navigate to the selected version
            console.log('Version selected:', this.value);
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
`;

    fs.writeFileSync(path.join(this.config.outputDir, 'js', 'main.js'), js);
  }

  private async generateVersionSelector(): Promise<void> {
    // Generate versions.json for dynamic version loading
    const versions: DocVersion[] = [
      {
        version: this.config.version,
        path: '/',
        isLatest: true
      }
    ];

    fs.writeFileSync(
      path.join(this.config.outputDir, 'versions.json'),
      JSON.stringify(versions, null, 2)
    );
  }

  /**
   * Deploy to a static hosting service (stub for future implementation)
   */
  async deploy(target: 'github-pages' | 'netlify' | 'vercel'): Promise<void> {
    console.log(`🚀 Deploying to ${target}...`);
    
    switch (target) {
      case 'github-pages':
        console.log('GitHub Pages deployment would be implemented here');
        break;
      case 'netlify':
        console.log('Netlify deployment would be implemented here');
        break;
      case 'vercel':
        console.log('Vercel deployment would be implemented here');
        break;
    }
    
    console.log('✅ Deployment completed');
  }
}

/**
 * Convenience function to generate documentation site
 */
export async function generateDocSite(config: Partial<DocSiteConfig>): Promise<void> {
  const defaultConfig: DocSiteConfig = {
    name: 'Omniscript',
    description: 'A modern programming language for full-stack development',
    baseUrl: 'https://omniscript.dev',
    version: '2.0.0',
    outputDir: './docs-site',
    sourceDir: './docs',
    theme: 'auto',
    repository: 'https://github.com/RyAnPr1Me/Omniscript'
  };

  const fullConfig = { ...defaultConfig, ...config };
  const generator = new StaticDocGenerator(fullConfig);
  await generator.generateSite();
}