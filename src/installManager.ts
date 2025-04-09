#!/usr/bin/env node

import { execSync } from 'child_process';
import os from 'os';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

export class OmniscriptInstaller {
  static runCommand(cmd: string): void {
    console.log(`🚀 Executing: ${cmd}`);
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ Command failed: ${cmd}`);
        console.error(`Error: ${err.message}`);
      } else {
        console.error(`❌ Command failed: ${cmd}`);
        console.error(`Unknown error:`, err);
      }
      process.exit(1);
    }
  }

  static isToolAvailable(tool: string): boolean {
    try {
      execSync(`which ${tool}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  static async installLanguage(languageName: string, upgrade: boolean = false): Promise<void> {
    if (languageName !== 'omniscript') {
      console.error(`❌ Unsupported language: ${languageName}`);
      process.exit(1);
    }

    if (!this.isToolAvailable('git')) {
      console.error('❌ Git is not installed. Please install Git and try again.');
      process.exit(1);
    }

    if (!this.isToolAvailable('npm')) {
      console.error('❌ npm is not installed. Please install Node.js and npm, then try again.');
      process.exit(1);
    }

    const defaultPath = '/usr/local/omniscript';
    const repoUrl = 'https://github.com/RyAnPr1Me/Omniscript.git';

    if (fs.existsSync(defaultPath)) {
      console.log('⚠️ Omniscript is already installed.');
      if (upgrade) {
        console.log('🔄 Upgrading Omniscript...');
        this.runCommand(`git -C ${defaultPath} pull`);
        this.runCommand(`npm install --prefix ${defaultPath}`);
        this.runCommand(`npm run build --prefix ${defaultPath}`);
        console.log('✅ Omniscript has been upgraded successfully!');
      } else {
        console.log('✅ Omniscript is already installed. Use --upgrade to update.');
      }
      return;
    }

    console.log('📥 Cloning Omniscript repository...');
    this.runCommand(`git clone ${repoUrl} ${defaultPath}`);

    console.log('📦 Installing dependencies...');
    this.runCommand(`npm install --prefix ${defaultPath}`);

    console.log('🔨 Building the project...');
    this.runCommand(`npm run build --prefix ${defaultPath}`);

    console.log('🔗 Linking Omniscript CLI globally...');
    const omniScriptPath = path.join(defaultPath, 'omni');
    fs.writeFileSync(omniScriptPath, `#!/bin/bash\nnode ${path.join(defaultPath, 'src/cli.js')} $@`);
    fs.chmodSync(omniScriptPath, '755');
    this.runCommand(`ln -sf ${omniScriptPath} /usr/local/bin/omni`);

    console.log('✅ Omniscript has been installed successfully! The `omni` command is now globally available.');
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const languageName = args[0];
  const upgradeFlag = args.includes('--upgrade');

  if (!languageName) {
    console.error('❌ Please specify a language to install. Example: node install.js omniscript');
    process.exit(1);
  }

  OmniscriptInstaller.installLanguage(languageName, upgradeFlag).catch(err => {
    console.error('❌ Installation failed:', err);
    process.exit(1);
  });
}
