#!/usr/bin/env node

import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createGunzip } from 'zlib';

const streamPipeline = promisify(pipeline);

export class OmniscriptInstaller {
  private static TEMP_DIR = path.join(os.tmpdir(), 'omniscript-installer');
  private static readonly DEPENDENCIES = {
    node: '16.0.0',
    npm: '7.0.0',
    git: '2.0.0'
  };

  static async downloadFile(url: string, destPath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    const fileStream = fs.createWriteStream(destPath);
    
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fileStream.write(value);
      }
    } finally {
      fileStream.end();
    }
  }

  static async ensureDependencies(): Promise<void> {
    console.log('🔍 Checking system dependencies...');
    
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }

    // Download Node.js if not present
    if (!this.isToolAvailable('node')) {
      const nodeUrl = this.getNodeDownloadUrl();
      const nodeDest = path.join(this.TEMP_DIR, 'node.tar.gz');
      console.log('📥 Downloading Node.js...');
      await this.downloadFile(nodeUrl, nodeDest);
      await this.extractTarGz(nodeDest, this.TEMP_DIR);
    }

    // Download Git if not present
    if (!this.isToolAvailable('git')) {
      const gitUrl = this.getGitDownloadUrl();
      const gitDest = path.join(this.TEMP_DIR, 'git.tar.gz');
      console.log('📥 Downloading Git...');
      await this.downloadFile(gitUrl, gitDest);
      await this.extractTarGz(gitDest, this.TEMP_DIR);
    }
  }

  private static async extractTarGz(source: string, dest: string): Promise<void> {
    await streamPipeline(
      fs.createReadStream(source),
      createGunzip(),
      fs.createWriteStream(dest)
    );
  }

  private static getNodeDownloadUrl(): string {
    const platform = os.platform();
    const arch = os.arch();
    const version = this.DEPENDENCIES.node;
    
    switch(platform) {
      case 'win32':
        return `https://nodejs.org/dist/v${version}/node-v${version}-win-${arch}.zip`;
      case 'darwin':
        return `https://nodejs.org/dist/v${version}/node-v${version}-darwin-${arch}.tar.gz`;
      default:
        return `https://nodejs.org/dist/v${version}/node-v${version}-linux-${arch}.tar.gz`;
    }
  }

  private static getGitDownloadUrl(): string {
    const platform = os.platform();
    const arch = os.arch();
    const version = this.DEPENDENCIES.git;
    
    switch(platform) {
      case 'win32':
        return `https://github.com/git-for-windows/git/releases/download/v${version}.windows.1/Git-${version}-64-bit.exe`;
      case 'darwin':
        return `https://sourceforge.net/projects/git-osx-installer/files/git-${version}-intel-universal-mavericks.dmg`;
      default:
        return `https://www.kernel.org/pub/software/scm/git/git-${version}.tar.gz`;
    }
  }

  static async checkWritePermissions(path: string): Promise<boolean> {
    try {
      const testPath = path + '.writetest';
      fs.writeFileSync(testPath, '');
      fs.unlinkSync(testPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  static getDefaultInstallPath(options: { userInstall?: boolean } = {}): string {
    const platform = os.platform();
    if (options.userInstall) {
      switch(platform) {
        case 'win32':
          return path.join(os.homedir(), 'AppData', 'Local', 'Omniscript');
        case 'darwin':
          return path.join(os.homedir(), 'Library', 'Application Support', 'Omniscript');
        default:
          return path.join(os.homedir(), '.local', 'share', 'omniscript');
      }
    }
    
    // System-wide installation paths
    switch(platform) {
      case 'win32':
        return path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Omniscript');
      case 'darwin':
        return '/Applications/Omniscript';
      default:
        return '/usr/local/omniscript';
    }
  }

  static async install(options: { 
    prefix?: string; 
    upgrade?: boolean;
    userInstall?: boolean;
  } = {}): Promise<void> {
    console.log('🚀 Starting Omniscript installation...');
    
    try {
      await this.ensureDependencies();
      
      // Get installation path based on user preference
      const installPath = options.prefix || this.getDefaultInstallPath({ userInstall: options.userInstall });
      console.log(`📁 Target installation path: ${installPath}`);

      // Create parent directories if they don't exist
      const parentDir = path.dirname(installPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      // Check write permissions for the parent directory
      const hasPermissions = await this.checkWritePermissions(parentDir);
      if (!hasPermissions) {
        if (!options.userInstall) {
          console.log('⚠️ Insufficient permissions for system-wide installation.');
          console.log('💡 Tip: Try running with sudo or use --user for user-level installation');
          process.exit(1);
        }
        throw new Error(`Cannot write to ${parentDir}. Please check permissions.`);
      }

      // Proceed with installation
      if (!fs.existsSync(installPath)) {
        fs.mkdirSync(installPath, { recursive: true });
      }

      // Bundle core files
      await this.bundleCoreFiles(installPath);
      
      // Create necessary environment variables
      await this.setupEnvironment(installPath, options.userInstall);
      
      // Create shortcuts/links
      await this.createShortcuts(installPath);

      console.log(`\n✅ Installation complete at ${installPath}`);
      console.log('\nNext steps:');
      console.log('1. Open a new terminal');
      console.log('2. Run: omni new myproject');
      console.log('3. Start coding!');
      
    } catch (error) {
      console.error('❌ Installation failed:', error);
      process.exit(1);
    }
  }

  private static async bundleCoreFiles(installPath: string): Promise<void> {
    const binPath = path.join(installPath, 'bin');
    const libPath = path.join(installPath, 'lib');
    
    fs.mkdirSync(binPath, { recursive: true });
    fs.mkdirSync(libPath, { recursive: true });
    
    // Copy platform-specific executable
    const platform = os.platform();
    let executableName = platform === 'win32' 
      ? 'omniscript-cli-win.exe'
      : platform === 'darwin'
        ? 'omniscript-cli-macos'
        : 'omniscript-cli-linux';

    // Look for the CLI executable
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'bin', executableName),
      path.join(__dirname, '..', '..', 'dist', 'bin', executableName),
      path.join(__dirname, '..', 'dist', 'bin', executableName)
    ];

    let executablePath: string | undefined;
    for (const p of possiblePaths) {
      console.log('Checking path:', p);
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }

    if (executablePath) {
      const targetPath = path.join(binPath, platform === 'win32' ? 'omni.exe' : 'omni');
      fs.copyFileSync(executablePath, targetPath);
      if (platform !== 'win32') {
        fs.chmodSync(targetPath, '755'); // Make executable on Unix-like systems
      }
      console.log(`✓ Installed Omniscript CLI to: ${targetPath}`);
    } else {
      console.warn('⚠️ Warning: Could not find Omniscript CLI executable');
      console.log('Searched in:', possiblePaths);
    }
    
    // Copy required files
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'src',
      'stdlib'
    ];

    for (const file of requiredFiles) {
      const source = path.join(__dirname, '..', file);
      const dest = path.join(libPath, file);
      if (fs.existsSync(source)) {
        if (fs.statSync(source).isDirectory()) {
          this.copyDir(source, dest);
        } else {
          fs.copyFileSync(source, dest);
        }
      }
    }
  }

  private static copyDir(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private static async setupEnvironment(installPath: string, userInstall?: boolean): Promise<void> {
    const platform = os.platform();
    const binPath = path.join(installPath, 'bin');
    
    if (platform === 'win32') {
      const scope = userInstall ? 'USER' : 'SYSTEM';
      const cmd = `setx PATH "%PATH%;${binPath}" /M:${scope}`;
      execSync(cmd);
    } else {
      // Create profile script for Unix-like systems
      const rcFile = platform === 'darwin' ? '.zshrc' : '.bashrc';
      const profilePath = path.join(os.homedir(), rcFile);
      const exportPath = `\n# Omniscript Path\nexport PATH="${binPath}:$PATH"\n`;
      
      // Append to RC file if it doesn't already contain the path
      const currentContent = fs.existsSync(profilePath) ? fs.readFileSync(profilePath, 'utf8') : '';
      if (!currentContent.includes(binPath)) {
        fs.appendFileSync(profilePath, exportPath);
      }
    }
  }

  private static async createShortcuts(installPath: string): Promise<void> {
    const platform = os.platform();
    if (platform === 'win32') {
      // Create Windows shortcuts
      const desktopPath = path.join(os.homedir(), 'Desktop');
      const shortcutPath = path.join(desktopPath, 'Omniscript.lnk');
      // Create shortcut using Windows Script Host
      const wsScript = `
        Set WshShell = WScript.CreateObject("WScript.Shell")
        Set shortcut = WshShell.CreateShortcut("${shortcutPath}")
        shortcut.TargetPath = "${path.join(installPath, 'bin', 'omni.cmd')}"
        shortcut.Save
      `;
      fs.writeFileSync('createShortcut.vbs', wsScript);
      execSync('cscript //NoLogo createShortcut.vbs');
      fs.unlinkSync('createShortcut.vbs');
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
}

// Self-executing main function when run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  console.log('Command line arguments:', args);
  
  const upgrade = args.includes('--upgrade');
  const userInstall = args.includes('--user');
  const prefixIndex = args.indexOf('--prefix');
  const prefix = prefixIndex !== -1 ? args[prefixIndex + 1] : undefined;

  console.log('Installation options:', { upgrade, userInstall, prefix });

  OmniscriptInstaller.install({ upgrade, prefix, userInstall }).catch(err => {
    console.error('❌ Installation failed:', err);
    process.exit(1);
  });
}

export default OmniscriptInstaller;

