export class InstallManager {
  runCommand(cmd: string): void {
    console.log(`Executing: ${cmd}`);
    const { execSync } = require('child_process');
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Command failed: ${cmd}`);
      process.exit(1);
    }
  }

  async runCommandAsync(cmd: string): Promise<void> {
    console.log(`Executing asynchronously: ${cmd}`);
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      const process = exec(cmd, { stdio: 'inherit' }, (error) => {
        if (error) {
          console.error(`Command failed: ${cmd}`);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  retryCommand(cmd: string, retries: number = 3): void {
    let attempts = 0;
    while (attempts < retries) {
      try {
        this.runCommand(cmd);
        return;
      } catch (error) {
        attempts++;
        console.warn(`Retrying command (${attempts}/${retries}): ${cmd}`);
        if (attempts >= retries) {
          console.error(`Command failed after ${retries} attempts: ${cmd}`);
          throw error;
        }
      }
    }
  }

  setEnvironmentVariables(env: Record<string, string>): void {
    console.log("Setting environment variables...");
    for (const [key, value] of Object.entries(env)) {
      process.env[key] = value;
      console.log(`Set ${key}=${value}`);
    }
  }

  installDependencies(): void {
    this.runCommand('npm install');
  }

  buildProject(): void {
    this.runCommand('npm run build');
  }

  linkCLI(): void {
    this.runCommand('npm link');
  }

  performInstallation(): void {
    console.log("Starting advanced Omniscript installation...");
    this.installDependencies();
    this.buildProject();
    this.linkCLI();
    console.log("Installation complete! The 'omni' command is now globally available.");
  }

  async performInstallationAsync(): Promise<void> {
    console.log("Starting advanced Omniscript installation asynchronously...");
    try {
      await this.runCommandAsync('npm install');
      await this.runCommandAsync('npm run build');
      await this.runCommandAsync('npm link');
      console.log("Asynchronous installation complete! The 'omni' command is now globally available.");
    } catch (error) {
      console.error("Asynchronous installation failed.", error);
    }
  }
}
