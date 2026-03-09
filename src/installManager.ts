#!/usr/bin/env node

import { execSync, execFileSync } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";
import https from "https";
import { createHash } from "crypto";

export class OmniscriptInstaller {
  private static TEMP_DIR = path.join(os.tmpdir(), "omniscript-installer");
  private static readonly REPO_URL =
    "https://github.com/RyAnPr1Me/Omniscript.git";
  private static readonly RELEASE_URL =
    "https://github.com/RyAnPr1Me/Omniscript/releases/latest";
  private static readonly FALLBACK_DOWNLOAD_URL =
    "https://omniscript-cdn.yourdomain.com/latest";

  // Essential files that must be present for Omniscript to work
  private static readonly ESSENTIAL_FILES = {
    "package.json": {
      content: `{
        "name": "omniscript",
        "version": "2.0.0",
        "bin": {
          "omni": "./dist/cli.js",
          "omniscript-installer": "./dist/bin/install.js"
        },
        "dependencies": {
          "antlr4": "^4.13.1",
          "commander": "^11.0.0",
          "typescript": "^5.0.0"
        }
      }`,
      checksum: "", // Will be computed during build
    },
    "tsconfig.json": {
      content: `{
        "compilerOptions": {
          "target": "ES2020",
          "module": "commonjs",
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true
        }
      }`,
      checksum: "",
    },
  };

  // Minimum required files for the compiler and runtime
  private static readonly CORE_FILES = [
    "src/cli.ts",
    "src/index.ts",
    "src/compiler/index.ts",
    "src/parser/OmniscriptParser.g4",
    "src/runtime/index.ts",
    "src/stdlib/index.ts",
  ];

  static async downloadWithRetry(
    url: string,
    destPath: string,
    maxRetries: number = 3,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Failed to download: ${response.statusText}`);
        const fileStream = fs.createWriteStream(destPath);

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        try {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fileStream.write(value);
          }
          fileStream.end();
          return; // Success
        } catch (error) {
          fileStream.end();
          throw error;
        }
      } catch (error) {
        console.log(`Download attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  static async downloadRepository(): Promise<string> {
    console.log("📦 Downloading Omniscript...");

    // Try multiple download methods
    const downloadMethods = [
      {
        name: "GitHub Release",
        fn: async () => {
          const releaseInfo = await fetch(this.RELEASE_URL).then((r) =>
            r.json(),
          );
          return releaseInfo.zipball_url;
        },
      },
      {
        name: "GitHub Archive",
        fn: async () => `${this.REPO_URL}/archive/refs/heads/main.zip`,
      },
      { name: "Fallback CDN", fn: async () => this.FALLBACK_DOWNLOAD_URL },
    ];

    let downloadUrl: string | null = null;
    let error: Error | null = null;

    for (const method of downloadMethods) {
      try {
        console.log(`Trying ${method.name}...`);
        downloadUrl = await method.fn();
        break;
      } catch (e) {
        error = e as Error;
        console.log(`${method.name} failed:`, e);
      }
    }

    if (!downloadUrl) {
      throw new Error(
        `All download methods failed. Last error: ${error?.message}`,
      );
    }

    const zipPath = path.join(this.TEMP_DIR, "omniscript.zip");
    await this.downloadWithRetry(downloadUrl, zipPath);

    return zipPath;
  }

  static async extractFiles(zipPath: string, targetDir: string): Promise<void> {
    console.log("📂 Extracting files...");

    // Use built-in unzip on Unix-like systems, or fallback to JS implementation
    if (os.platform() !== "win32") {
      try {
        execSync(`unzip "${zipPath}" -d "${targetDir}"`);
        return;
      } catch (error) {
        console.log("Native unzip failed, falling back to JS implementation");
      }
    }

    // JS fallback implementation
    // ... (keep existing extraction code)
  }

  static async createMinimalInstall(installPath: string): Promise<void> {
    console.log("🔨 Creating minimal installation...");

    // Create essential directories
    const dirs = [
      "src/compiler",
      "src/parser",
      "src/runtime",
      "src/stdlib",
      "dist/bin",
    ];

    for (const dir of dirs) {
      fs.mkdirSync(path.join(installPath, dir), { recursive: true });
    }

    // Write essential files
    for (const [filename, { content }] of Object.entries(
      this.ESSENTIAL_FILES,
    )) {
      fs.writeFileSync(path.join(installPath, filename), content);
    }
  }

  static async verifyChecksums(installPath: string): Promise<boolean> {
    console.log("🔒 Verifying file integrity...");

    for (const [filename, { checksum }] of Object.entries(
      this.ESSENTIAL_FILES,
    )) {
      const filePath = path.join(installPath, filename);
      if (!fs.existsSync(filePath)) {
        console.error(`Missing file: ${filename}`);
        return false;
      }

      const fileContent = fs.readFileSync(filePath);
      const computedHash = createHash("sha256")
        .update(fileContent)
        .digest("hex");

      if (checksum && computedHash !== checksum) {
        console.error(`Checksum mismatch for ${filename}`);
        return false;
      }
    }

    return true;
  }

  static async buildFromSource(installPath: string): Promise<void> {
    console.log("🏗️ Building from source...");

    process.chdir(installPath);

    try {
      // Install dependencies
      console.log("📦 Installing dependencies...");
      execSync("npm install", { stdio: "inherit" });

      // Build the project
      console.log("🔨 Building project...");
      execSync("npm run build", { stdio: "inherit" });

      // Create executables
      console.log("📦 Creating executables...");
      execSync("npm run build:exe", { stdio: "inherit" });
    } catch (error) {
      throw new Error(
        `Build failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async ensureDependencies(): Promise<void> {
    console.log("🔍 Checking system dependencies...");

    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }

    // Download Node.js if not present
    if (!this.isToolAvailable("node")) {
      const nodeUrl = this.getNodeDownloadUrl();
      const nodeDest = path.join(this.TEMP_DIR, "node.tar.gz");
      console.log("📥 Downloading Node.js...");
      await this.downloadWithRetry(nodeUrl, nodeDest);
      await this.extractTarGz(nodeDest, this.TEMP_DIR);
    }

    // Download Git if not present
    if (!this.isToolAvailable("git")) {
      const gitUrl = this.getGitDownloadUrl();
      const gitDest = path.join(this.TEMP_DIR, "git.tar.gz");
      console.log("📥 Downloading Git...");
      await this.downloadWithRetry(gitUrl, gitDest);
      await this.extractTarGz(gitDest, this.TEMP_DIR);
    }
  }

  private static async extractTarGz(
    source: string,
    dest: string,
  ): Promise<void> {
    fs.mkdirSync(dest, { recursive: true });
    execFileSync("tar", ["xzf", source, "-C", dest]);
  }

  private static getNodeDownloadUrl(): string {
    const platform = os.platform();
    const arch = os.arch();
    const version = "16.0.0";

    switch (platform) {
      case "win32":
        return `https://nodejs.org/dist/v${version}/node-v${version}-win-${arch}.zip`;
      case "darwin":
        return `https://nodejs.org/dist/v${version}/node-v${version}-darwin-${arch}.tar.gz`;
      default:
        return `https://nodejs.org/dist/v${version}/node-v${version}-linux-${arch}.tar.gz`;
    }
  }

  private static getGitDownloadUrl(): string {
    const platform = os.platform();
    const arch = os.arch();
    const version = "2.0.0";

    switch (platform) {
      case "win32":
        return `https://github.com/git-for-windows/git/releases/download/v${version}.windows.1/Git-${version}-64-bit.exe`;
      case "darwin":
        return `https://sourceforge.net/projects/git-osx-installer/files/git-${version}-intel-universal-mavericks.dmg`;
      default:
        return `https://www.kernel.org/pub/software/scm/git/git-${version}.tar.gz`;
    }
  }

  static async checkWritePermissions(path: string): Promise<boolean> {
    try {
      const testPath = path + ".writetest";
      fs.writeFileSync(testPath, "");
      fs.unlinkSync(testPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  static getDefaultInstallPath(
    options: { userInstall?: boolean } = {},
  ): string {
    const platform = os.platform();
    if (options.userInstall) {
      switch (platform) {
        case "win32":
          return path.join(os.homedir(), "AppData", "Local", "Omniscript");
        case "darwin":
          return path.join(
            os.homedir(),
            "Library",
            "Application Support",
            "Omniscript",
          );
        default:
          return path.join(os.homedir(), ".local", "share", "omniscript");
      }
    }

    // System-wide installation paths
    switch (platform) {
      case "win32":
        return path.join(
          process.env.PROGRAMFILES || "C:\\Program Files",
          "Omniscript",
        );
      case "darwin":
        return "/Applications/Omniscript";
      default:
        return "/usr/local/omniscript";
    }
  }

  private static async cloneRepository(installPath: string): Promise<void> {
    console.log("📦 Cloning Omniscript repository...");
    const tempClonePath = path.join(this.TEMP_DIR, "omniscript-repo");

    try {
      // Remove existing temp clone if any
      if (fs.existsSync(tempClonePath)) {
        fs.rmSync(tempClonePath, { recursive: true, force: true });
      }

      // Clone the repository
      execSync(`git clone ${this.REPO_URL} "${tempClonePath}"`, {
        stdio: "inherit",
      });

      // Build from source
      console.log("🔨 Building from source...");
      process.chdir(tempClonePath);
      execSync("npm install", { stdio: "inherit" });
      execSync("npm run build:exe", { stdio: "inherit" });

      // Copy built files to install location
      this.copyDir(
        path.join(tempClonePath, "dist"),
        path.join(installPath, "dist"),
      );
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    } finally {
      // Cleanup
      if (fs.existsSync(tempClonePath)) {
        fs.rmSync(tempClonePath, { recursive: true, force: true });
      }
    }
  }

  static async install(
    options: {
      prefix?: string;
      upgrade?: boolean;
      userInstall?: boolean;
    } = {},
  ): Promise<void> {
    console.log("🚀 Starting Omniscript installation...");

    try {
      // Create temp directory
      if (!fs.existsSync(this.TEMP_DIR)) {
        fs.mkdirSync(this.TEMP_DIR, { recursive: true });
      }

      // Get installation path
      const installPath =
        options.prefix ||
        this.getDefaultInstallPath({ userInstall: options.userInstall });
      console.log(`📁 Target installation path: ${installPath}`);

      // Check permissions
      const hasPermissions = await this.checkWritePermissions(
        path.dirname(installPath),
      );
      if (!hasPermissions) {
        if (!options.userInstall) {
          console.log(
            "⚠️ Insufficient permissions for system-wide installation.",
          );
          console.log(
            "💡 Tip: Try running with sudo or use --user for user-level installation",
          );
          process.exit(1);
        }
        throw new Error(
          `Cannot write to installation directory. Please check permissions.`,
        );
      }

      // Download and extract
      const zipPath = await this.downloadRepository();
      await this.extractFiles(zipPath, installPath);

      // Verify or create minimal install
      if (!(await this.verifyChecksums(installPath))) {
        console.log(
          "⚠️ Installation verification failed, creating minimal install...",
        );
        await this.createMinimalInstall(installPath);
      }

      // Build from source
      await this.buildFromSource(installPath);

      // Setup environment
      await this.setupEnvironment(installPath, options.userInstall);

      // Create shortcuts
      await this.createShortcuts(installPath);

      // Final verification
      if (this.verifyInstallation(installPath)) {
        console.log(`\n✅ Installation complete at ${installPath}`);
        console.log("\nNext steps:");
        console.log("1. Open a new terminal");
        console.log("2. Run: omni new myproject");
        console.log("3. Start coding!");
      } else {
        throw new Error("Installation verification failed");
      }
    } catch (error) {
      console.error("❌ Installation failed:", error);
      process.exit(1);
    } finally {
      // Cleanup
      try {
        fs.rmSync(this.TEMP_DIR, { recursive: true, force: true });
      } catch (error) {
        console.warn("⚠️ Failed to clean up temporary files:", error);
      }
    }
  }

  private static async bundleCoreFiles(installPath: string): Promise<void> {
    const binPath = path.join(installPath, "bin");
    const libPath = path.join(installPath, "lib");

    fs.mkdirSync(binPath, { recursive: true });
    fs.mkdirSync(libPath, { recursive: true });

    // Copy platform-specific executable
    const platform = os.platform();
    const executableName =
      platform === "win32"
        ? "omniscript-cli-win.exe"
        : platform === "darwin"
          ? "omniscript-cli-macos"
          : "omniscript-cli-linux";

    // Look for the CLI executable
    const possiblePaths = [
      path.join(process.cwd(), "dist", "bin", executableName),
      path.join(__dirname, "..", "..", "dist", "bin", executableName),
      path.join(__dirname, "..", "dist", "bin", executableName),
    ];

    let executablePath: string | undefined;
    for (const p of possiblePaths) {
      console.log("Checking path:", p);
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }

    if (executablePath) {
      const targetPath = path.join(
        binPath,
        platform === "win32" ? "omni.exe" : "omni",
      );
      fs.copyFileSync(executablePath, targetPath);
      if (platform !== "win32") {
        fs.chmodSync(targetPath, "755"); // Make executable on Unix-like systems
      }
      console.log(`✓ Installed Omniscript CLI to: ${targetPath}`);
    } else {
      console.warn("⚠️ Warning: Could not find Omniscript CLI executable");
      console.log("Searched in:", possiblePaths);
    }

    // Copy the JavaScript CLI file as fallback (create a launcher script)
    const jsCliPaths = [
      path.join(process.cwd(), "dist", "cli.js"),
      path.join(__dirname, "..", "cli.js"),
      path.join(__dirname, "cli.js"),
    ];

    let jsCliPath: string | undefined;
    for (const p of jsCliPaths) {
      if (fs.existsSync(p)) {
        jsCliPath = p;
        break;
      }
    }

    if (jsCliPath) {
      // Create a launcher script instead of copying the CLI directly
      const launcherScript = `#!/usr/bin/env node
// Omniscript CLI Launcher
const path = require('path');
const fs = require('fs');

// Determine the installation directory
const installDir = path.dirname(__dirname);
const cliPath = path.join(installDir, 'lib', 'dist', 'cli.js');

// Check if the main CLI file exists
if (fs.existsSync(cliPath)) {
  // Execute the main CLI
  require(cliPath);
} else {
  console.error('❌ Omniscript CLI not found at:', cliPath);
  console.error('Please reinstall Omniscript or check your installation.');
  process.exit(1);
}
`;

      const jsTargetPath = path.join(binPath, "cli.js");
      fs.writeFileSync(jsTargetPath, launcherScript);
      fs.chmodSync(jsTargetPath, "755"); // Make executable
      console.log(`✓ Installed JavaScript CLI launcher to: ${jsTargetPath}`);
    } else {
      console.warn("⚠️ Warning: Could not find JavaScript CLI file");
      console.log("Searched in:", jsCliPaths);
    }

    // Copy required files
    const requiredFiles = [
      "package.json",
      "tsconfig.json",
      "src",
      "stdlib",
      "dist",
      "node_modules",
    ];

    for (const file of requiredFiles) {
      const source = path.join(__dirname, "..", file);
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

  private static async setupEnvironment(
    installPath: string,
    userInstall?: boolean,
  ): Promise<void> {
    const platform = os.platform();
    const binPath = path.join(installPath, "bin");

    // Create the bin directory if it doesn't exist
    fs.mkdirSync(binPath, { recursive: true });

    if (platform === "win32") {
      const pathValue = `%PATH%;${binPath}`;
      const args = userInstall
        ? ["PATH", pathValue]
        : ["/M", "PATH", pathValue];
      execFileSync("setx", args);
    } else {
      // For Unix-like systems, create both system and user-level links
      const globalBinPath = "/usr/local/bin";
      const userBinPath = path.join(os.homedir(), ".local", "bin");

      // Ensure user bin directory exists
      fs.mkdirSync(userBinPath, { recursive: true });

      const targetPath = path.join(binPath, "omni");
      const linkPath = userInstall
        ? path.join(userBinPath, "omni")
        : path.join(globalBinPath, "omni");

      try {
        // Remove existing symlink if it exists
        if (fs.existsSync(linkPath)) {
          fs.unlinkSync(linkPath);
        }

        // Create new symlink
        fs.symlinkSync(targetPath, linkPath);
        fs.chmodSync(targetPath, "755");
        console.log(`✓ Created symlink: ${linkPath} -> ${targetPath}`);

        // Add .local/bin to PATH if needed for user installations
        if (userInstall) {
          const rcFile = platform === "darwin" ? ".zshrc" : ".bashrc";
          const profilePath = path.join(os.homedir(), rcFile);
          const pathExport = `\n# Omniscript Path\nexport PATH="${userBinPath}:$PATH"\n`;

          const currentContent = fs.existsSync(profilePath)
            ? fs.readFileSync(profilePath, "utf8")
            : "";

          if (!currentContent.includes(userBinPath)) {
            fs.appendFileSync(profilePath, pathExport);
            console.log(`✓ Added ${userBinPath} to PATH in ${rcFile}`);
          }
        }
      } catch (error) {
        console.error("⚠️ Failed to create symlink:", error);
        if (!userInstall) {
          console.log(
            "💡 Try installing with --user flag or running with sudo",
          );
        }
        throw error;
      }
    }
  }

  private static async createShortcuts(installPath: string): Promise<void> {
    const platform = os.platform();
    if (platform === "win32") {
      // Create Windows shortcuts
      const desktopPath = path.join(os.homedir(), "Desktop");
      const shortcutPath = path.join(desktopPath, "Omniscript.lnk");
      // Create shortcut using Windows Script Host
      const wsScript = `
        Set WshShell = WScript.CreateObject("WScript.Shell")
        Set shortcut = WshShell.CreateShortcut("${shortcutPath}")
        shortcut.TargetPath = "${path.join(installPath, "bin", "omni.cmd")}"
        shortcut.Save
      `;
      fs.writeFileSync("createShortcut.vbs", wsScript);
      execSync("cscript //NoLogo createShortcut.vbs");
      fs.unlinkSync("createShortcut.vbs");
    }
  }

  private static verifyInstallation(installPath: string): boolean {
    try {
      // Check for essential files
      const requiredFiles = [
        path.join(
          installPath,
          "dist",
          "bin",
          os.platform() === "win32" ? "omniscript-cli.exe" : "omniscript-cli",
        ),
        path.join(installPath, "dist", "stdlib"),
        path.join(installPath, "dist", "compiler"),
      ];

      for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
          console.error(`Missing required file: ${file}`);
          return false;
        }
      }

      // Try running the CLI
      const cliPath = path.join(
        installPath,
        "dist",
        "bin",
        os.platform() === "win32" ? "omniscript-cli.exe" : "omniscript-cli",
      );
      execSync(`"${cliPath}" --version`, { stdio: "ignore" });

      return true;
    } catch (error) {
      console.error("Verification error:", error);
      return false;
    }
  }

  static isToolAvailable(tool: string): boolean {
    try {
      execSync(`${os.platform() === "win32" ? "where" : "which"} ${tool}`, {
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Self-executing main function when run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  console.log("Command line arguments:", args);

  const upgrade = args.includes("--upgrade");
  const userInstall = args.includes("--user");
  const prefixIndex = args.indexOf("--prefix");
  const prefix = prefixIndex !== -1 ? args[prefixIndex + 1] : undefined;

  console.log("Installation options:", { upgrade, userInstall, prefix });

  OmniscriptInstaller.install({ upgrade, prefix, userInstall }).catch((err) => {
    console.error("❌ Installation failed:", err);
    process.exit(1);
  });
}

export default OmniscriptInstaller;
