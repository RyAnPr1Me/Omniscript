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
}
