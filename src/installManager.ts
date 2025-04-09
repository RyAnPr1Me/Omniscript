#!/usr/bin/env node

// To run this installer, execute: `node src/installManager.ts`

import { execSync } from 'child_process';
import os from 'os';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

export class OmniscriptInstaller {
  static runCommand(cmd: string): void {
    console.log(`Executing: ${cmd}`);
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Command failed: ${cmd}`);
        console.error(`Error: ${err.message}`);
      } else {
        console.error(`Command failed: ${cmd}`);
        console.error(`Unknown error:`, err);
      }
      process.exit(1);
    }
  }

  static async interactiveInstall(): Promise<void> {
    console.log("Welcome to the Omniscript Installer!");
    console.log("This program will guide you through the installation process.");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (question: string): Promise<string> => {
      return new Promise(resolve => rl.question(question, resolve));
    };

    try {
      const installPath = await askQuestion("Enter the installation directory (default: /usr/local/omniscript): ");
      const pathToInstall = installPath.trim() || "/usr/local/omniscript";

      console.log(`Installing Omniscript to ${pathToInstall}...`);
      if (!fs.existsSync(pathToInstall)) {
        fs.mkdirSync(pathToInstall, { recursive: true });
      }

      console.log("Cloning Omniscript repository...");
      const repoUrl = "https://github.com/RyAnPr1Me/Omniscript.git";
      this.runCommand(`git clone ${repoUrl} ${pathToInstall}`);

      console.log("Installing dependencies...");
      this.runCommand(`npm install --prefix ${pathToInstall}`);

      console.log("Building the project...");
      this.runCommand(`npm run build --prefix ${pathToInstall}`);

      console.log("Setting up Omniscript environment...");
      const omniScriptPath = path.join(pathToInstall, 'omni');
      fs.writeFileSync(omniScriptPath, `#!/bin/bash\nnode ${path.join(pathToInstall, 'src/cli.js')} $@`);
      fs.chmodSync(omniScriptPath, '755');

      console.log("Linking Omniscript CLI globally...");
      this.runCommand(`ln -sf ${omniScriptPath} /usr/local/bin/omni`);

      console.log("Installation complete! The 'omni' command is now globally available.");
    } catch (error) {
      console.error("Installation failed.", error);
    } finally {
      rl.close();
    }
  }

  static performInstallation(): void {
    console.log("Starting Omniscript installation...");
    const platform = os.platform();

    if (platform !== 'linux' && platform !== 'darwin' && platform !== 'win32') {
      console.error("Unsupported operating system. Installation aborted.");
      process.exit(1);
    }

    const defaultPath = "/usr/local/omniscript";
    console.log(`Installing Omniscript to the default directory: ${defaultPath}`);

    if (!fs.existsSync(defaultPath)) {
      fs.mkdirSync(defaultPath, { recursive: true });
    }

    console.log("Cloning Omniscript repository...");
    const repoUrl = "https://github.com/RyAnPr1Me/Omniscript.git";
    this.runCommand(`git clone ${repoUrl} ${defaultPath}`);

    console.log("Installing dependencies...");
    this.runCommand(`npm install --prefix ${defaultPath}`);

    console.log("Building the project...");
    this.runCommand(`npm run build --prefix ${defaultPath}`);

    console.log("Setting up Omniscript environment...");
    const omniScriptPath = path.join(defaultPath, 'omni');
    fs.writeFileSync(omniScriptPath, `#!/bin/bash\nnode ${path.join(defaultPath, 'src/cli.js')} $@`);
    fs.chmodSync(omniScriptPath, '755');

    console.log("Linking Omniscript CLI globally...");
    this.runCommand(`ln -sf ${omniScriptPath} /usr/local/bin/omni`);

    console.log("Installation complete! The 'omni' command is now globally available.");
  }
}

if (require.main === module) {
  OmniscriptInstaller.performInstallation();
}
