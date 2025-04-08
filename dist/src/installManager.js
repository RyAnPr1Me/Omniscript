"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallManager = void 0;
class InstallManager {
    runCommand(cmd) {
        console.log(`Executing: ${cmd}`);
        const { execSync } = require('child_process');
        try {
            execSync(cmd, { stdio: 'inherit' });
        }
        catch (err) {
            console.error(`Command failed: ${cmd}`);
            process.exit(1);
        }
    }
    installDependencies() {
        this.runCommand('npm install');
    }
    buildProject() {
        this.runCommand('npm run build');
    }
    linkCLI() {
        this.runCommand('npm link');
    }
    performInstallation() {
        console.log("Starting advanced Omniscript installation...");
        this.installDependencies();
        this.buildProject();
        this.linkCLI();
        console.log("Installation complete! The 'omni' command is now globally available.");
    }
}
exports.InstallManager = InstallManager;
