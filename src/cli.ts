#!/usr/bin/env node
/// <reference types="node" />
/* eslint-disable no-inner-declarations */
/* eslint-disable no-useless-escape */
import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { Interface as ReadlineInterface, createInterface } from "node:readline";
import { homedir } from "node:os";
import { Omniscript } from "./index";
import { enableDebugger, enableComponentDebug, DebugLevel } from "./debug";
import { OmniscriptInstaller } from "./installManager";

const program = new Command();
let omniscript: Omniscript;

function getOmniscript(options?: any): Omniscript {
  if (!omniscript) {
    omniscript = new Omniscript(options);
  }
  return omniscript;
}

// Version comparison function (returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2)
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}

function startRepl(engine: Omniscript) {
  const rl: ReadlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "omni> ",
  });

  rl.prompt();

  rl.on("line", async (line: string) => {
    try {
      const result = await engine.execute(line);
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

program
  .name("omni")
  .description("Omniscript CLI")
  .version("2.0.0", "-v, --version", "output the version number");

program
  .command("run")
  .description("Run an Omniscript file")
  .argument("<file>", "Path to Omniscript file")
  .option(
    "-f, --fast",
    "Enable fast compilation mode (skip type checking, use AOT)",
  )
  .option("--no-cache", "Disable compilation caching")
  .action(async (file: string, options: any) => {
    try {
      // Get omniscript instance with performance options
      const omniscriptOptions = {
        fastMode: options.fast || false,
        compiler: {
          enableCaching: options.noCache !== true,
        },
      };

      const omniscriptInstance = getOmniscript(omniscriptOptions);

      const source = await readFile(file, "utf-8");
      const result = await omniscriptInstance.execute(source);
      if (
        result !== undefined &&
        !(typeof result === "number" && isNaN(result))
      ) {
        console.log(result);
      }

      // Force process exit to prevent hanging
      process.exit(0);
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  });

program
  .command("eval")
  .description("Evaluate inline Omniscript/functional code snippet")
  .argument("<code...>", "Code to execute (wrap in quotes)")
  .option("-f, --fast", "Enable fast compilation mode")
  .action(async (codeParts: string[], options: any) => {
    const code = codeParts.join(" ");
    try {
      // Get omniscript instance with fast mode if requested
      const omniscriptOptions = options.fast ? { fastMode: true } : {};
      const omniscriptInstance = getOmniscript(omniscriptOptions);

      const result = await omniscriptInstance.execute(code);
      if (result !== undefined) console.log(result);

      // Force process exit to prevent hanging
      process.exit(0);
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  });

program
  .command("repl")
  .description("Start Omniscript REPL")
  .action(() => {
    startRepl(getOmniscript());
  });

program
  .command("debug")
  .description("Debug commands")
  .argument("<action>", "Debug action: enable, disable, level, component")
  .argument("[value]", "Value for the action")
  .action((action: string, value?: string) => {
    switch (action) {
      case "enable":
        enableDebugger();
        console.log("Debug mode enabled for all components");
        break;
      case "level":
        if (value) {
          const level = parseInt(value) as DebugLevel;
          enableComponentDebug("*", level);
          console.log(`Debug level set to ${level}`);
        } else {
          console.log("Please specify a debug level (0-4)");
        }
        break;
      case "component":
        if (value) {
          enableComponentDebug(value);
          console.log(`Debug enabled for component: ${value}`);
        } else {
          console.log("Please specify a component name");
        }
        break;
      default:
        console.log(
          "Available debug actions: enable, level <0-4>, component <name>",
        );
    }
  });

program
  .command("new")
  .description("Create a new Omniscript project")
  .argument("<name>", "Project name")
  .action(async (name: string) => {
    const fs = await import("fs/promises");
    const path = await import("path");

    const projectDir = path.join(process.cwd(), name);

    try {
      // Create project directory
      await fs.mkdir(projectDir, { recursive: true });

      // Create basic project structure
      await fs.mkdir(path.join(projectDir, "src"));
      await fs.mkdir(path.join(projectDir, "docs"));
      await fs.mkdir(path.join(projectDir, "tests"));

      // Create main.omni file
      const mainContent = `// Welcome to Omniscript!
// This is your main application file.

@component
class App {
  constructor() {
    this.message = "Hello, Omniscript!";
  }
  
  render() {
    console.log(this.message + " - Built with Omniscript");
  }
}

// Export the App component
export { App };

// Create and render the app
const app = new App();
app.render();
`;
      await fs.writeFile(
        path.join(projectDir, "src", "main.omni"),
        mainContent,
      );

      // Create a simple test file
      const testContent = `// Test file for ${name}
import { App } from '../src/main.omni';

describe('App', () => {
  test('should create instance with message', () => {
    const app = new App();
    expect(app.message).toBe("Hello, Omniscript!");
  });
  
  test('should render message', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const app = new App();
    app.render();
    expect(consoleSpy).toHaveBeenCalledWith("Hello, Omniscript! - Built with Omniscript");
    consoleSpy.mockRestore();
  });
});
`;
      await fs.writeFile(
        path.join(projectDir, "tests", "main.test.omni"),
        testContent,
      );

      // Create jest config
      const jestConfig = `module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.(omni|js|ts)'],
  collectCoverageFrom: [
    'src/**/*.(omni|js|ts)',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
`;
      await fs.writeFile(path.join(projectDir, "jest.config.js"), jestConfig);

      // Create package.json
      const packageJson = {
        name,
        version: "1.0.0",
        description: "An Omniscript application",
        main: "src/main.omni",
        scripts: {
          dev: "omni dev",
          build: "omni build",
          start: "omni run src/main.omni",
        },
        omniscript: {
          stdlib: ["http", "collections"],
          plugins: [],
        },
      };
      await fs.writeFile(
        path.join(projectDir, "package.json"),
        JSON.stringify(packageJson, null, 2),
      );

      // Create README
      const readmeContent = `# ${name}

An Omniscript application.

## Getting Started

\`\`\`bash
cd ${name}
omni dev
\`\`\`

## Available Commands

- \`omni dev\` - Start development server
- \`omni build\` - Build for production  
- \`omni run src/main.omni\` - Run the application
`;
      await fs.writeFile(path.join(projectDir, "README.md"), readmeContent);

      console.log(`✅ Created project '${name}' successfully!`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${name}`);
      console.log(`  omni dev`);
    } catch (error) {
      console.error(`❌ Failed to create project: ${error}`);
    }
  });

program
  .command("dev")
  .description("Start development server with watch mode")
  .option("-p, --port <port>", "Port to run on", "3000")
  .action(async (options: { port: string }) => {
    console.log(
      `🚀 Starting Omniscript development server on port ${options.port}...`,
    );
    console.log("📁 Watching for file changes...");

    // Basic file watching and execution
    const fs = await import("fs");
    const path = await import("path");

    const watchFile = "src/main.omni";

    if (fs.existsSync(watchFile)) {
      console.log(`👀 Watching ${watchFile}`);

      // Initial run
      try {
        const source = await fs.promises.readFile(watchFile, "utf-8");
        console.log("\n📄 Running initial build...");
        const result = await getOmniscript().execute(source);
        if (result !== undefined) {
          console.log("✅ Output:", result);
        }
      } catch (error) {
        console.error("❌ Error:", error);
      }

      // Watch for changes
      fs.watchFile(watchFile, async () => {
        console.log("\n🔄 File changed, reloading...");
        try {
          const source = await fs.promises.readFile(watchFile, "utf-8");
          const result = await getOmniscript().execute(source);
          if (result !== undefined) {
            console.log("✅ Output:", result);
          }
        } catch (error) {
          console.error("❌ Error:", error);
        }
      });

      // Keep process alive
      console.log("\n⏸️  Press Ctrl+C to stop");
      process.on("SIGINT", () => {
        console.log("\n👋 Development server stopped");
        process.exit(0);
      });

      // Keep the process running
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await new Promise(() => {});
    } else {
      console.error(
        `❌ Could not find ${watchFile}. Make sure you're in an Omniscript project directory.`,
      );
      console.log("\nTo create a new project, run: omni new <project-name>");
    }
  });

program
  .command("add")
  .description("Add a package or enable stdlib module")
  .argument("<package>", "Package name or stdlib module (e.g., stdlib/http)")
  .action(async (packageName: string) => {
    const { PackageManager } = await import("./package-manager");
    const pm = new PackageManager();

    try {
      await pm.loadConfig();

      if (packageName.startsWith("stdlib/")) {
        const module = packageName.replace("stdlib/", "");
        await pm.enableStdLib(module);
        console.log(`✅ Enabled stdlib module: ${module}`);
      } else {
        // For now, just add to dependencies with latest version
        await pm.installDependency(packageName, "latest");
        console.log(`✅ Added package: ${packageName}`);
      }

      console.log("📦 Package configuration updated");
    } catch (error) {
      console.error(`❌ Failed to add package: ${error}`);
    }
  });

program
  .command("build")
  .description("Build project for production")
  .option("-o, --output <dir>", "Output directory", "dist")
  .option("--target <target>", "Build target (node, browser)", "node")
  .action(async (options: { output: string; target: string }) => {
    console.log(`🔨 Building project for ${options.target}...`);

    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      // Create output directory
      await fs.mkdir(options.output, { recursive: true });

      // Find and compile Omniscript files
      const mainFile = "src/main.omni";
      if (
        await fs
          .access(mainFile)
          .then(() => true)
          .catch(() => false)
      ) {
        console.log(`📄 Compiling ${mainFile}...`);

        const source = await fs.readFile(mainFile, "utf-8");
        const omniscriptInstance = getOmniscript();

        // Execute and capture result for build
        const result = await omniscriptInstance.execute(source);

        // For now, create a simple JS wrapper around the executed code
        const jsOutput = `// Compiled Omniscript
const result = ${JSON.stringify(result, null, 2)};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = result;
} else {
  console.log(result);
}`;

        // Save compiled output
        const outputFile = path.join(options.output, "main.js");
        await fs.writeFile(outputFile, jsOutput);

        console.log(`✅ Build complete! Output saved to ${outputFile}`);
      } else {
        console.error(
          `❌ Could not find ${mainFile}. Make sure you're in an Omniscript project directory.`,
        );
      }
    } catch (error) {
      console.error(`❌ Build failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command("test")
  .description("Run tests using Jest")
  .option("--watch", "Run in watch mode")
  .option("--coverage", "Run with coverage report")
  .action(async (options: { watch?: boolean; coverage?: boolean }) => {
    console.log("🧪 Running tests...");

    try {
      const { spawn } = await import("child_process");
      const fs = await import("fs");

      const jestArgs = [];

      // Only add config if it exists
      if (fs.existsSync("jest.config.ts") || fs.existsSync("jest.config.js")) {
        if (fs.existsSync("jest.config.ts")) {
          jestArgs.push("--config", "jest.config.ts");
        } else {
          jestArgs.push("--config", "jest.config.js");
        }
      }

      if (options.watch) {
        jestArgs.push("--watch");
      }

      if (options.coverage) {
        jestArgs.push("--coverage");
      }

      const jestProcess = spawn("npx", ["jest", ...jestArgs], {
        stdio: "inherit",
        shell: true,
      });

      jestProcess.on("close", (code) => {
        if (code === 0) {
          console.log("✅ All tests passed!");
        } else {
          console.log(`❌ Tests failed with exit code ${code}`);
          process.exit(code || 1);
        }
      });
    } catch (error) {
      console.error(`❌ Failed to run tests: ${error}`);
      process.exit(1);
    }
  });

program
  .command("install")
  .description("Install project dependencies")
  .action(async () => {
    console.log("📦 Installing dependencies...");

    try {
      const { spawn } = await import("child_process");

      const npmProcess = spawn("npm", ["install"], {
        stdio: "inherit",
        shell: true,
      });

      npmProcess.on("close", (code) => {
        if (code === 0) {
          console.log("✅ Dependencies installed successfully!");
        } else {
          console.log(`❌ Installation failed with exit code ${code}`);
          process.exit(code || 1);
        }
      });
    } catch (error) {
      console.error(`❌ Failed to install dependencies: ${error}`);
      process.exit(1);
    }
  });

program
  .command("enable")
  .description("Enable a standard library module")
  .argument("<module>", "Module name (e.g., http, database, crypto)")
  .action(async (moduleName: string) => {
    const { PackageManager } = await import("./package-manager");
    const pm = new PackageManager();

    try {
      await pm.loadConfig();
      await pm.enableStdLib(moduleName);
      console.log(`✅ Enabled stdlib module: ${moduleName}`);
      console.log("📦 Package configuration updated");
    } catch (error) {
      console.error(`❌ Failed to enable module: ${error}`);
    }
  });

program
  .command("fuzz")
  .description("Run fuzzing tests for parser and runtime safety")
  .option("-i, --iterations <number>", "Number of test iterations", "1000")
  .option("-t, --timeout <ms>", "Timeout per test in milliseconds", "5000")
  .option("--no-unicode", "Disable unicode character generation")
  .option("--control-chars", "Include control characters in fuzzing")
  .option(
    "-p, --property <property>",
    "Run specific property test (parser-never-hangs, runtime-memory-safe, type-safety)",
  )
  .action(async (options) => {
    try {
      const { runFuzzTest, runPropertyTest } = await import("./testing/fuzzer");

      if (options.property) {
        console.log(`🔍 Running property test: ${options.property}`);
        const result = await runPropertyTest(
          options.property,
          parseInt(options.iterations) || 100,
        );
        if (result) {
          console.log(`✅ Property test passed: ${options.property}`);
        } else {
          console.log(`❌ Property test failed: ${options.property}`);
          process.exit(1);
        }
      } else {
        console.log("🎯 Running fuzzing tests...");
        const result = await runFuzzTest({
          maxIterations: parseInt(options.iterations) || 1000,
          timeout: parseInt(options.timeout) || 5000,
          includeUnicode: options.unicode !== false,
          includeControlChars: options.controlChars === true,
        });

        console.log("\n📊 Fuzzing Results:");
        console.log(`  Total tests: ${result.totalTests}`);
        console.log(`  Crashes: ${result.crashes}`);
        console.log(`  Timeouts: ${result.timeouts}`);
        console.log(
          `  Success rate: ${(((result.totalTests - result.crashes - result.timeouts) / result.totalTests) * 100).toFixed(1)}%`,
        );

        if (result.failures.length > 0) {
          console.log("\n🐛 Sample failures:");
          result.failures.slice(0, 3).forEach((failure, index) => {
            console.log(`  ${index + 1}. ${failure.type}: ${failure.error}`);
            console.log(
              `     Input: ${failure.input.substring(0, 50)}${failure.input.length > 50 ? "..." : ""}`,
            );
          });
        }

        if (result.crashes > result.totalTests * 0.1) {
          console.log(
            "\n⚠️  High crash rate detected - consider investigating",
          );
        } else {
          console.log("\n✅ Fuzzing completed with acceptable crash rate");
        }
      }
    } catch (error) {
      console.error(`❌ Fuzzing failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command("format")
  .description("Format Omniscript source code")
  .argument("[files...]", "Files to format (defaults to src/**/*.omni)")
  .option("--check", "Check if files are formatted without modifying them")
  .option("--write", "Write formatted code back to files", true)
  .action(
    async (files: string[], options: { check?: boolean; write?: boolean }) => {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");

        // Simple glob replacement
        async function findOmniscriptFiles(dir: string): Promise<string[]> {
          const result: string[] = [];
          try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                result.push(...(await findOmniscriptFiles(fullPath)));
              } else if (
                entry.name.endsWith(".omni") ||
                entry.name.endsWith(".os")
              ) {
                result.push(fullPath);
              }
            }
          } catch {
            // Directory doesn't exist or can't be read
          }
          return result;
        }

        // Determine files to format
        let filesToFormat: string[];
        if (files && files.length > 0) {
          filesToFormat = files;
        } else {
          // Default to all .omni and .os files in src/
          filesToFormat = await findOmniscriptFiles("src");
        }

        if (filesToFormat.length === 0) {
          console.log("⚠️  No Omniscript files found to format");
          return;
        }

        console.log(`🎨 Formatting ${filesToFormat.length} file(s)...`);

        let changedFiles = 0;
        let errors = 0;

        for (const file of filesToFormat) {
          try {
            const source = await fs.readFile(file, "utf-8");
            const formatted = formatOmniscriptCode(source);

            if (source !== formatted) {
              if (options.check) {
                console.log(`❌ ${file} is not formatted`);
                changedFiles++;
              } else if (options.write !== false) {
                await fs.writeFile(file, formatted);
                console.log(`✅ Formatted ${file}`);
                changedFiles++;
              }
            } else {
              console.log(`✓ ${file} is already formatted`);
            }
          } catch (error) {
            console.error(`❌ Error formatting ${file}: ${error}`);
            errors++;
          }
        }

        if (options.check && changedFiles > 0) {
          console.log(`\n❌ ${changedFiles} file(s) need formatting`);
          process.exit(1);
        } else {
          console.log(
            `\n✅ Formatting complete! ${changedFiles} file(s) changed, ${errors} error(s)`,
          );
        }
      } catch (error) {
        console.error(`❌ Format failed: ${error}`);
        process.exit(1);
      }
    },
  );

function formatOmniscriptCode(source: string): string {
  // Basic formatting rules for Omniscript
  let formatted = source;

  // Normalize line endings
  formatted = formatted.replace(/\r\n?/g, "\n");

  // Fix indentation (use 2 spaces)
  const lines = formatted.split("\n");
  let indentLevel = 0;
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();

    // Don't format empty lines
    if (!trimmed) return "";

    // Decrease indent for closing braces/brackets
    if (/^[}\])]/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indented = "  ".repeat(indentLevel) + trimmed;

    // Increase indent for opening braces/brackets
    if (/[{\[(]\s*$/.test(trimmed) && !trimmed.includes("//")) {
      indentLevel++;
    }

    return indented;
  });

  // Join and clean up multiple blank lines
  formatted = formattedLines.join("\n").replace(/\n{3,}/g, "\n\n");

  // Ensure file ends with single newline
  formatted = formatted.replace(/\n*$/, "\n");

  return formatted;
}

program
  .command("lint")
  .description("Lint Omniscript source code")
  .argument("[files...]", "Files to lint (defaults to src/**/*.omni)")
  .option("--fix", "Automatically fix linting issues where possible")
  .action(async (files: string[], options: { fix?: boolean }) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      // Simple file finder
      async function findOmniscriptFiles(dir: string): Promise<string[]> {
        const result: string[] = [];
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              result.push(...(await findOmniscriptFiles(fullPath)));
            } else if (
              entry.name.endsWith(".omni") ||
              entry.name.endsWith(".os")
            ) {
              result.push(fullPath);
            }
          }
        } catch {
          // Directory doesn't exist
        }
        return result;
      }

      let filesToLint: string[];
      if (files && files.length > 0) {
        filesToLint = files;
      } else {
        filesToLint = await findOmniscriptFiles("src");
      }

      if (filesToLint.length === 0) {
        console.log("⚠️  No Omniscript files found to lint");
        return;
      }

      console.log(`🔍 Linting ${filesToLint.length} file(s)...`);

      let totalIssues = 0;
      let fixedIssues = 0;

      for (const file of filesToLint) {
        try {
          const source = await fs.readFile(file, "utf-8");
          const issues = lintOmniscriptCode(source, file);

          if (issues.length === 0) {
            console.log(`✅ ${file} - No issues found`);
          } else {
            console.log(`⚠️  ${file} - ${issues.length} issue(s) found:`);
            issues.forEach((issue) => {
              console.log(
                `  Line ${issue.line}: ${issue.message} (${issue.severity})`,
              );
            });

            if (options.fix) {
              const fixed = fixLintIssues(source, issues);
              if (fixed !== source) {
                await fs.writeFile(file, fixed);
                console.log(`🔧 Fixed issues in ${file}`);
                fixedIssues += issues.length;
              }
            }

            totalIssues += issues.length;
          }
        } catch (error) {
          console.error(`❌ Error linting ${file}: ${error}`);
        }
      }

      console.log(`\n📊 Linting complete: ${totalIssues} issue(s) found`);
      if (options.fix && fixedIssues > 0) {
        console.log(`🔧 Fixed ${fixedIssues} issue(s) automatically`);
      }

      if (totalIssues > fixedIssues) {
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Linting failed: ${error}`);
      process.exit(1);
    }
  });

function lintOmniscriptCode(
  source: string,
  filename: string,
): Array<{ line: number; message: string; severity: "error" | "warning" }> {
  const issues: Array<{
    line: number;
    message: string;
    severity: "error" | "warning";
  }> = [];
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for common issues
    if (line.includes("\t")) {
      issues.push({
        line: lineNum,
        message: "Use spaces instead of tabs for indentation",
        severity: "warning",
      });
    }

    if (line.endsWith(" ")) {
      issues.push({
        line: lineNum,
        message: "Trailing whitespace",
        severity: "warning",
      });
    }

    if (line.length > 120) {
      issues.push({
        line: lineNum,
        message: "Line too long (>120 characters)",
        severity: "warning",
      });
    }

    // Check for missing semicolons in certain contexts
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("/*") &&
      /^(let|const|var|return)\s/.test(trimmed) &&
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{")
    ) {
      issues.push({
        line: lineNum,
        message: "Missing semicolon",
        severity: "error",
      });
    }
  });

  return issues;
}

function fixLintIssues(
  source: string,
  issues: Array<{
    line: number;
    message: string;
    severity: "error" | "warning";
  }>,
): string {
  let lines = source.split("\n");

  // Fix trailing whitespace
  lines = lines.map((line) => line.replace(/\s+$/, ""));

  // Fix tabs to spaces
  lines = lines.map((line) => line.replace(/\t/g, "  "));

  return lines.join("\n");
}

program
  .command("check")
  .description("Type check Omniscript code without running it")
  .argument("[files...]", "Files to check (defaults to src/**/*.omni)")
  .action(async (files: string[]) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      // Simple file finder
      async function findOmniscriptFiles(dir: string): Promise<string[]> {
        const result: string[] = [];
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              result.push(...(await findOmniscriptFiles(fullPath)));
            } else if (
              entry.name.endsWith(".omni") ||
              entry.name.endsWith(".os")
            ) {
              result.push(fullPath);
            }
          }
        } catch {
          // Directory doesn't exist
        }
        return result;
      }

      let filesToCheck: string[];
      if (files && files.length > 0) {
        filesToCheck = files;
      } else {
        filesToCheck = await findOmniscriptFiles("src");
      }

      if (filesToCheck.length === 0) {
        console.log("⚠️  No Omniscript files found to check");
        return;
      }

      console.log(`🔍 Type checking ${filesToCheck.length} file(s)...`);

      let hasErrors = false;

      for (const file of filesToCheck) {
        try {
          const source = await fs.readFile(file, "utf-8");

          // Use the Omniscript parser to check syntax
          const omniscriptInstance = getOmniscript();

          // Try to parse without executing
          try {
            // This will throw if there are syntax errors
            await omniscriptInstance.execute(source);
            console.log(`✅ ${file} - Type check passed`);
          } catch (error) {
            console.log(`❌ ${file} - Type check failed: ${error}`);
            hasErrors = true;
          }
        } catch (error) {
          console.error(`❌ Error checking ${file}: ${error}`);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        console.log(`\n❌ Type checking failed`);
        process.exit(1);
      } else {
        console.log(`\n✅ All files passed type checking`);
      }
    } catch (error) {
      console.error(`❌ Type checking failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command("upgrade")
  .description("Upgrade Omniscript to the latest version")
  .option("--check", "Check for updates without upgrading")
  .option("--auto", "Automatically install updates without confirmation")
  .option("--user", "Install to user directory instead of system-wide")
  .action(
    async (options: { check?: boolean; auto?: boolean; user?: boolean }) => {
      console.log("🔍 Checking for Omniscript updates...");

      try {
        const https = await import("https");
        const fs = await import("fs");
        const path = await import("path");
        const { execSync } = await import("child_process");
        const { createInterface } = await import("readline");

        const currentVersion = "2.0.0";

        // Check latest version from GitHub releases
        const checkLatest = () =>
          new Promise<{ version: string; downloadUrl?: string }>(
            (resolve, reject) => {
              const req = https.request(
                {
                  hostname: "api.github.com",
                  path: "/repos/RyAnPr1Me/Omniscript/releases/latest",
                  headers: { "User-Agent": "Omniscript-CLI" },
                },
                (res) => {
                  let data = "";
                  res.on("data", (chunk) => (data += chunk));
                  res.on("end", () => {
                    try {
                      const release = JSON.parse(data);
                      const version =
                        release.tag_name?.replace(/^v/, "") || currentVersion;
                      const downloadUrl = release.zipball_url;
                      resolve({ version, downloadUrl });
                    } catch (parseError) {
                      // Fallback to known latest version if API is blocked
                      console.log(
                        "API blocked, using fallback version check...",
                      );
                      // Check against known releases from the repository
                      const knownReleases = [
                        "1.2.1",
                        "1.1.3",
                        "1.1.2",
                        "1.1.0",
                        "1.0.0",
                      ];
                      const latestKnownRelease = knownReleases[0];

                      const versionComparison = compareVersions(
                        currentVersion,
                        latestKnownRelease,
                      );
                      if (versionComparison < 0) {
                        // Current version is older than known latest
                        resolve({
                          version: latestKnownRelease,
                          downloadUrl: `https://api.github.com/repos/RyAnPr1Me/Omniscript/zipball/${latestKnownRelease}`,
                        });
                      } else {
                        // Current version is same or newer (could be development version)
                        resolve({ version: currentVersion });
                      }
                    }
                  });
                },
              );
              req.on("error", (error) => {
                // Fallback when request fails
                console.log("Request failed, using fallback version check...");
                const knownReleases = [
                  "1.2.1",
                  "1.1.3",
                  "1.1.2",
                  "1.1.0",
                  "1.0.0",
                ];
                const latestKnownRelease = knownReleases[0];

                const versionComparison = compareVersions(
                  currentVersion,
                  latestKnownRelease,
                );
                if (versionComparison < 0) {
                  resolve({
                    version: latestKnownRelease,
                    downloadUrl: `https://api.github.com/repos/RyAnPr1Me/Omniscript/zipball/${latestKnownRelease}`,
                  });
                } else {
                  resolve({ version: currentVersion });
                }
              });
              req.setTimeout(5000, () => {
                req.destroy();
                // Fallback when timeout
                console.log("Request timeout, using fallback version check...");
                const knownReleases = [
                  "1.2.1",
                  "1.1.3",
                  "1.1.2",
                  "1.1.0",
                  "1.0.0",
                ];
                const latestKnownRelease = knownReleases[0];

                const versionComparison = compareVersions(
                  currentVersion,
                  latestKnownRelease,
                );
                if (versionComparison < 0) {
                  resolve({
                    version: latestKnownRelease,
                    downloadUrl: `https://api.github.com/repos/RyAnPr1Me/Omniscript/zipball/${latestKnownRelease}`,
                  });
                } else {
                  resolve({ version: currentVersion });
                }
              });
              req.end();
            },
          );

        const { version: latestVersion, downloadUrl } = await checkLatest();

        if (currentVersion === latestVersion) {
          console.log(
            `✅ You're running the latest version (${currentVersion})`,
          );
          return;
        }

        console.log(
          `📦 Update available: ${currentVersion} → ${latestVersion}`,
        );

        if (options.check) {
          console.log("🚀 To upgrade automatically, run:");
          console.log("  omni upgrade");
          console.log("  # or with auto-confirmation:");
          console.log("  omni upgrade --auto");
          return;
        }

        // Detect installation method
        const isNpmGlobal =
          process.env.npm_config_global === "true" ||
          process.argv[0].includes("node_modules") ||
          __dirname.includes("node_modules");

        let shouldUpgrade = options.auto;

        if (!shouldUpgrade) {
          // Ask for user confirmation
          const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise<string>((resolve) => {
            rl.question(
              `Do you want to upgrade to version ${latestVersion}? (y/N): `,
              (answer) => {
                rl.close();
                resolve(answer.toLowerCase());
              },
            );
          });

          shouldUpgrade = answer === "y" || answer === "yes";
        }

        if (!shouldUpgrade) {
          console.log("❌ Upgrade cancelled");
          return;
        }

        console.log(`🚀 Starting upgrade to version ${latestVersion}...`);

        try {
          if (isNpmGlobal) {
            // NPM global installation
            console.log(
              "📦 Detected npm global installation, updating via npm...",
            );
            try {
              execSync("npm install -g omniscript@latest", {
                stdio: "inherit",
              });
              console.log("✅ Successfully upgraded via npm!");
            } catch (npmError) {
              console.log(
                "❌ NPM upgrade failed, trying alternative method...",
              );
              throw npmError;
            }
          } else {
            // Standalone binary or local installation - use installer
            console.log("🔧 Using built-in installer for upgrade...");

            // Check if current installation is user-level or system-wide
            const currentExecutable = process.argv[1];
            const isUserInstall =
              currentExecutable.includes(homedir()) || options.user;

            await OmniscriptInstaller.install({
              upgrade: true,
              userInstall: isUserInstall,
            });

            console.log("✅ Successfully upgraded using built-in installer!");
          }

          // Verify the upgrade
          try {
            const newVersionOutput = execSync("omni --version", {
              encoding: "utf8",
            });
            const installedVersion = newVersionOutput.trim().split(" ").pop();

            if (installedVersion === latestVersion) {
              console.log(
                `🎉 Upgrade successful! Now running version ${installedVersion}`,
              );
            } else {
              console.log(
                `⚠️  Upgrade completed but version mismatch detected`,
              );
              console.log(
                `   Expected: ${latestVersion}, Got: ${installedVersion}`,
              );
            }
          } catch (verifyError) {
            console.log(
              "⚠️  Could not verify upgrade, but installation completed",
            );
          }
        } catch (upgradeError) {
          console.log(`❌ Automatic upgrade failed: ${upgradeError}`);
          console.log("\n🔧 Manual upgrade options:");
          console.log("  npm install -g omniscript@latest");
          console.log("  # or");
          console.log("  yarn global add omniscript@latest");
          console.log("  # or download from:");
          console.log(
            "  https://github.com/RyAnPr1Me/Omniscript/releases/latest",
          );
          process.exit(1);
        }
      } catch (error) {
        console.log(`⚠️  Could not check for updates: ${error}`);
        console.log(
          "📖 Visit https://github.com/RyAnPr1Me/Omniscript for the latest version",
        );
        process.exit(1);
      }
    },
  );

program
  .command("info")
  .description("Display system information and Omniscript environment")
  .action(async () => {
    try {
      const os = await import("os");
      const fs = await import("fs/promises");
      const path = await import("path");

      console.log("🔍 Omniscript Environment Information");
      console.log("=====================================");
      console.log();

      // Version info
      console.log("📦 Version Information:");
      console.log(`  Omniscript: 2.0.0`);
      console.log(`  Node.js: ${process.version}`);
      console.log(`  Platform: ${os.platform()} ${os.arch()}`);
      console.log(`  OS: ${os.type()} ${os.release()}`);
      console.log();

      // Memory info
      const memUsage = process.memoryUsage();
      console.log("💾 Memory Usage:");
      console.log(`  RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
      console.log(
        `  Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      );
      console.log(
        `  Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      );
      console.log();

      // Check for project files
      const projectFiles = [
        "package.json",
        "omni.json",
        "src/main.omni",
        "jest.config.js",
      ];
      const foundFiles = [];

      for (const file of projectFiles) {
        try {
          await fs.access(file);
          foundFiles.push(file);
        } catch {
          // File doesn't exist
        }
      }

      if (foundFiles.length > 0) {
        console.log("📁 Project Files:");
        foundFiles.forEach((file) => console.log(`  ✅ ${file}`));
        console.log();
      }

      // Check stdlib modules (if in project)
      try {
        const packageJson = await fs.readFile("package.json", "utf-8");
        const pkg = JSON.parse(packageJson);
        if (pkg.omniscript?.stdlib) {
          console.log("📚 Enabled Standard Library Modules:");
          pkg.omniscript.stdlib.forEach((mod: string) =>
            console.log(`  • ${mod}`),
          );
          console.log();
        }
      } catch {
        // Not in a project or no package.json
      }
    } catch (error) {
      console.error(`❌ Failed to gather system information: ${error}`);
    }
  });

program
  .command("completion")
  .description("Generate shell completion scripts")
  .argument("[shell]", "Shell type (bash, zsh, fish)", "bash")
  .action((shell: string) => {
    const validShells = ["bash", "zsh", "fish"];
    if (!validShells.includes(shell)) {
      console.error(
        `❌ Unsupported shell: ${shell}. Supported: ${validShells.join(", ")}`,
      );
      return;
    }

    console.log(`# Omniscript ${shell} completion script`);

    if (shell === "bash") {
      console.log(`
_omni_completion() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  
  opts="run eval repl debug new dev add build test install enable fuzz format lint check upgrade info completion site docs --version --help"
  
  COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
  return 0
}

complete -F _omni_completion omni

# To enable this completion, run:
# source <(omni completion bash)
# Or add to your ~/.bashrc:
# eval "$(omni completion bash)"
`);
    } else if (shell === "zsh") {
      console.log(`
#compdef omni

_omni() {
  local context state line
  
  _arguments -C \\
    '1: :->command' \\
    '*: :->args' && return 0
    
  case $state in
    command)
      local commands=(
        'run:Run an Omniscript file'
        'eval:Evaluate inline code'
        'repl:Start interactive REPL'
        'debug:Debug commands'
        'new:Create new project'
        'dev:Start development server'
        'add:Add package or stdlib module'
        'build:Build for production'
        'test:Run tests'
        'install:Install dependencies'
        'enable:Enable stdlib module'
        'fuzz:Run fuzzing tests'
        'format:Format source code'
        'lint:Lint source code'
        'check:Type check code'
        'upgrade:Upgrade Omniscript'
        'info:Show system info'
        'completion:Generate completions'
        'site:Generate documentation site'
        'docs:Generate API docs'
      )
      _describe 'commands' commands
      ;;
  esac
}

_omni

# To enable this completion, add to your ~/.zshrc:
# eval "$(omni completion zsh)"
`);
    } else if (shell === "fish") {
      console.log(`
# Omniscript fish completion
complete -c omni -f -a "run" -d "Run an Omniscript file"
complete -c omni -f -a "eval" -d "Evaluate inline code"
complete -c omni -f -a "repl" -d "Start interactive REPL"
complete -c omni -f -a "debug" -d "Debug commands"
complete -c omni -f -a "new" -d "Create new project"
complete -c omni -f -a "dev" -d "Start development server"
complete -c omni -f -a "add" -d "Add package or stdlib module"
complete -c omni -f -a "build" -d "Build for production"
complete -c omni -f -a "test" -d "Run tests"
complete -c omni -f -a "install" -d "Install dependencies"
complete -c omni -f -a "enable" -d "Enable stdlib module"
complete -c omni -f -a "fuzz" -d "Run fuzzing tests"
complete -c omni -f -a "format" -d "Format source code"
complete -c omni -f -a "lint" -d "Lint source code"
complete -c omni -f -a "check" -d "Type check code"
complete -c omni -f -a "upgrade" -d "Upgrade Omniscript"
complete -c omni -f -a "info" -d "Show system info"
complete -c omni -f -a "completion" -d "Generate completions"
complete -c omni -f -a "site" -d "Generate documentation site"
complete -c omni -f -a "docs" -d "Generate API docs"

# To enable this completion, run:
# omni completion fish > ~/.config/fish/completions/omni.fish
`);
    }
  });

program
  .command("site")
  .description("Generate static documentation site")
  .option("-o, --output <path>", "Output directory", "./docs-site")
  .option("-s, --source <path>", "Source documentation directory", "./docs")
  .option("--theme <theme>", "Site theme (light, dark, auto)", "auto")
  .option("--name <name>", "Site name", "Omniscript")
  .option(
    "--deploy <target>",
    "Deploy to hosting service (github-pages, netlify, vercel)",
  )
  .action(async (options) => {
    try {
      const { generateDocSite, StaticDocGenerator } = await import(
        "./docs-site"
      );
      const fs = await import("fs");

      console.log("🌐 Generating static documentation site...");

      // Read package.json for version
      const packagePath = "./package.json";
      let version = "2.0.0";
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
        version = packageJson.version || "2.0.0";
      } catch {
        console.warn("Could not read package.json, using default version");
      }

      const config = {
        name: options.name,
        outputDir: options.output,
        sourceDir: options.source,
        theme: options.theme as "light" | "dark" | "auto",
        version,
      };

      await generateDocSite(config);

      if (options.deploy) {
        const generator = new StaticDocGenerator({
          name: config.name,
          description:
            "A modern programming language for full-stack development",
          baseUrl: "https://omniscript.dev",
          version: config.version,
          outputDir: config.outputDir,
          sourceDir: config.sourceDir,
          theme: config.theme,
          repository: "https://github.com/RyAnPr1Me/Omniscript",
        });

        await generator.deploy(
          options.deploy as "github-pages" | "netlify" | "vercel",
        );
      }

      console.log(`\n🎉 Static site generated successfully!`);
      console.log(`📂 Output: ${options.output}`);
      console.log(
        `🌐 Open ${options.output}/index.html in your browser to view the site`,
      );
    } catch (error) {
      console.error(`❌ Site generation failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command("docs")
  .description("Generate API documentation")
  .option("-o, --output <path>", "Output directory", "./docs/api")
  .option("-f, --format <format>", "Output format (markdown)", "markdown")
  .action(async (options) => {
    try {
      const { TypeScriptDocGenerator, MarkdownDocGenerator } = await import(
        "./docs-generator"
      );
      const fs = await import("fs");
      const path = await import("path");

      console.log("📚 Generating API documentation...");

      const docGen = new TypeScriptDocGenerator();
      const modules = docGen.generateDocumentation();

      if (modules.length === 0) {
        console.log("⚠️  No modules found to document");
        return;
      }

      console.log(`📖 Found ${modules.length} modules to document`);

      // Ensure output directory exists
      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      if (options.format === "markdown") {
        const markdown = MarkdownDocGenerator.generateMarkdown(modules);
        const outputFile = path.join(outputDir, "API.md");
        fs.writeFileSync(outputFile, markdown);
        console.log(`✅ Generated markdown documentation: ${outputFile}`);
      }

      // Also generate individual module files
      for (const module of modules) {
        const moduleMarkdown = MarkdownDocGenerator.generateMarkdown([module]);
        const moduleFile = path.join(outputDir, `${module.name}.md`);
        fs.writeFileSync(moduleFile, moduleMarkdown);
      }

      console.log(
        `📝 Generated ${modules.length} individual module documentation files`,
      );
      console.log("🎉 Documentation generation complete!");
    } catch (error) {
      console.error(`❌ Failed to generate documentation: ${error}`);
    }
  });

// Handle Windows batch file %* argument issue
const args = process.argv.slice(2);

// Filter out literal %* arguments which can occur due to Windows batch file issues
const filteredArgs = args.filter((arg) => arg !== "%*");

// If we filtered out %* and have no other args, or if the original args contained only %*
if (
  (args.length > 0 && filteredArgs.length === 0) ||
  (args.length === 1 && args[0] === "%*")
) {
  // Show help instead of throwing unknown command error
  program.help();
} else if (filteredArgs.length !== args.length) {
  // If we filtered out some %* arguments, parse with the filtered arguments
  program.parse(["node", "omni", ...filteredArgs]);
} else {
  // Normal case - no %* issues
  program.parse();
}
