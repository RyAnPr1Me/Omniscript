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
  private config: PackageConfig;

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

  private async saveConfig(): Promise<void> {
    await writeFile('package.json', JSON.stringify(this.config, null, 2));
  }
}
