#!/usr/bin/env node

import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

class OmniscriptInstaller {
  static runCommand(cmd: string): void {
    console.log(`\u001b[36m> ${cmd}\u001b[0m`);
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
      console.error(`\u001b[31m✖ Failed: ${cmd}\u001b[0m`);
      process.exit(1);
    }
  }

  static isToolAvailable(tool: string): boolean {
    try {
      execSync(`${os.platform() === 'win32' ? 'where' : 'which'} ${tool}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  static checkRequirements() {
    const requiredTools = ['git', 'npm', 'node'];
    for (const tool of requiredTools) {
      if (!this.isToolAvailable(tool)) {
        console.error(`\u001b[31m❌ ${tool} is not installed. Please install it and try again.\u001b[0m`);
        process.exit(1);
      }
    }
  }

  static checkNodeVersion() {
    const requiredMajor = 16;
    const currentMajor = parseInt(process.versions.node.split('.')[0]);
    if (currentMajor < requiredMajor) {
      console.error(`\u001b[31m❌ Node.js >= ${requiredMajor} is required. Current version: ${process.versions.node}\u001b[0m`);
      process.exit(1);
    }
  }

  static async install(languageName: string, options: { prefix?: string; upgrade?: boolean } = {}): Promise<void> {
    if (languageName !== 'omniscript') {
      console.error(`\u001b[31m❌ Unsupported language: ${languageName}\u001b[0m`);
      process.exit(1);
    }

    this.checkRequirements();
    this.checkNodeVersion();

    const installPath = options.prefix || '/usr/local/omniscript';
    const repoUrl = 'https://github.com/RyAnPr1Me/Omniscript.git';

    if (fs.existsSync(installPath)) {
      if (options.upgrade) {
        console.log('🔄 Upgrading Omniscript...');
        this.runCommand(`git -C ${installPath} pull`);
        this.runCommand(`npm install --prefix ${installPath}`);
        this.runCommand(`npm run build --prefix ${installPath}`);
      } else {
        console.log('✅ Omniscript already installed. Use --upgrade to update.');
        return;
      }
    } else {
      console.log('📥 Cloning Omniscript repository...');
      this.runCommand(`git clone ${repoUrl} ${installPath}`);

      console.log('📦 Installing dependencies...');
      this.runCommand(`npm install --prefix ${installPath}`);

      console.log('🔨 Building project...');
      this.runCommand(`npm run build --prefix ${installPath}`);
    }

    this.linkCLI(installPath);
    console.log('✅ Omniscript installed! Use `omni` from anywhere.');
  }

  static linkCLI(installPath: string): void {
    const cliPath = path.join(installPath, 'src/cli.js');
    const omniBin = os.platform() === 'win32'
      ? path.join(process.env.APPDATA || '', 'omni.cmd')
      : '/usr/local/bin/omni';

    if (os.platform() === 'win32') {
      const cmd = `echo @echo off > "${omniBin}" && echo node ${cliPath} %* >> "${omniBin}"`;
      this.runCommand(cmd);
    } else {
      const shim = `#!/bin/bash\nnode ${cliPath} \"$@\"`;
      fs.writeFileSync(omniBin, shim);
      fs.chmodSync(omniBin, '755');
    }

    console.log('🔗 CLI linked globally.');
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const language = args[0];
  const upgrade = args.includes('--upgrade');
  const prefixIndex = args.indexOf('--prefix');
  const prefix = prefixIndex !== -1 ? args[prefixIndex + 1] || undefined : undefined;

  OmniscriptInstaller.install(language, { upgrade, prefix }).catch(err => {
    console.error('❌ Installation failed:', err);
    process.exit(1);
  });
}

export default OmniscriptInstaller;

