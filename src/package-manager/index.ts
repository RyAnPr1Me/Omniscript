import { readFile, writeFile } from 'fs/promises';

interface PackageConfig {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  omniscript: {
    stdlib?: string[];
    plugins?: string[];
  };
}

export class PackageManager {
  private config: PackageConfig = {
    name: '',
    version: '',
    dependencies: {},
    omniscript: {}
  };

  async loadConfig(path: string = 'package.json'): Promise<void> {
    const content = await readFile(path, 'utf-8');
    this.config = JSON.parse(content);
  }

  async installDependency(name: string, version: string): Promise<void> {
    this.config.dependencies[name] = version;
    await this.saveConfig();
  }

  async enableStdLib(module: string): Promise<void> {
    this.config.omniscript = this.config.omniscript || {};
    this.config.omniscript.stdlib = this.config.omniscript.stdlib || [];
    if (!this.config.omniscript.stdlib.includes(module)) {
      this.config.omniscript.stdlib.push(module);
    }
    await this.saveConfig();
  }

  async enableDebugger(): Promise<void> {
    // Enable debugger support
    this.config.omniscript = this.config.omniscript || {};
    this.config.omniscript.plugins = this.config.omniscript.plugins || [];
    if (!this.config.omniscript.plugins.includes('debugger')) {
      this.config.omniscript.plugins.push('debugger');
    }
    await this.saveConfig();
  }

  async enableProfiler(): Promise<void> {
    // Enable profiler support
    this.config.omniscript = this.config.omniscript || {};
    this.config.omniscript.plugins = this.config.omniscript.plugins || [];
    if (!this.config.omniscript.plugins.includes('profiler')) {
      this.config.omniscript.plugins.push('profiler');
    }
    await this.saveConfig();
  }

  async enableAutocomplete(): Promise<void> {
    // Enable autocomplete support
    this.config.omniscript = this.config.omniscript || {};
    this.config.omniscript.plugins = this.config.omniscript.plugins || [];
    if (!this.config.omniscript.plugins.includes('autocomplete')) {
      this.config.omniscript.plugins.push('autocomplete');
    }
    await this.saveConfig();
  }

  async enableLinting(): Promise<void> {
    // Enable linting support
    this.config.omniscript = this.config.omniscript || {};
    this.config.omniscript.plugins = this.config.omniscript.plugins || [];
    if (!this.config.omniscript.plugins.includes('linting')) {
      this.config.omniscript.plugins.push('linting');
    }
    await this.saveConfig();
  }

  async enableRefactoringTools(): Promise<void> {
    // Enable refactoring tools support
    this.config.omniscript = this.config.omniscript || {};
    this.config.omniscript.plugins = this.config.omniscript.plugins || [];
    if (!this.config.omniscript.plugins.includes('refactoring-tools')) {
      this.config.omniscript.plugins.push('refactoring-tools');
    }
    await this.saveConfig();
  }

  async listAvailableLibraries(): Promise<string[]> {
    // Fetch the list of libraries from the registry
    const response = await fetch('https://registry.omniscript.dev/libraries');
    return response.json();
  }

  async listAvailablePlugins(): Promise<string[]> {
    // Fetch the list of plugins from the registry
    const response = await fetch('https://registry.omniscript.dev/plugins');
    return response.json();
  }

  async searchRegistry(query: string): Promise<string[]> {
    // Search the registry for libraries or plugins matching the query
    const response = await fetch(`https://registry.omniscript.dev/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }

  private async saveConfig(): Promise<void> {
    await writeFile('package.json', JSON.stringify(this.config, null, 2));
  }
}
