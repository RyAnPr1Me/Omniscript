import { describe, test, expect } from "@jest/globals";
import fs from "fs";
import path from "path";

describe("Windows Installer Fix", () => {
  test("installer.iss should not contain npm install command", () => {
    const installerPath = path.join(__dirname, "../installer.iss");
    const installerContent = fs.readFileSync(installerPath, "utf8");

    // Should not contain npm install in executable commands (excluding comments)
    const runSection =
      installerContent.match(/\[Run\]([\s\S]*?)(?:\[|$)/)?.[1] || "";
    expect(runSection).not.toMatch(/Filename:.*npm install/);
    expect(runSection).not.toMatch(/Parameters:.*npm install/);

    // Should contain node_modules bundling
    expect(installerContent).toMatch(/node_modules/);
  });

  test("installer.iss should only check for Node.js, not npm", () => {
    const installerPath = path.join(__dirname, "../installer.iss");
    const installerContent = fs.readFileSync(installerPath, "utf8");

    // Should check for Node.js
    expect(installerContent).toMatch(/node --version/);

    // Should not check for npm in the Code section
    const codeSection =
      installerContent.match(/\[Code\]([\s\S]*?)\[/)?.[1] || "";
    expect(codeSection).not.toMatch(/npm --version/);
  });

  test("CLI should work without npm install step", () => {
    const cliPath = path.join(__dirname, "../dist/cli.js");
    expect(fs.existsSync(cliPath)).toBe(true);

    // Test that essential dependencies exist
    const nodeModulesPath = path.join(__dirname, "../node_modules");
    const requiredDeps = ["commander", "antlr4"];

    for (const dep of requiredDeps) {
      const depPath = path.join(nodeModulesPath, dep);
      expect(fs.existsSync(depPath)).toBe(true);
    }
  });

  test("installer should have dependency validation instead of npm install", () => {
    const installerPath = path.join(__dirname, "../installer.iss");
    const installerContent = fs.readFileSync(installerPath, "utf8");

    // Should have dependency validation
    expect(installerContent).toMatch(/Validating bundled dependencies/);
    expect(installerContent).toMatch(/dir.*node_modules/);
  });

  test("ShellExec calls should have correct number of parameters", () => {
    const installerPath = path.join(__dirname, "../installer.iss");
    const installerContent = fs.readFileSync(installerPath, "utf8");

    // In InitializeSetup function, ShellExec should not include ErrorCode parameter
    // ShellExec signature: ShellExec(Verb, FileName, Parameters, Directory, ShowCmd)
    const initSetupMatch = installerContent.match(/function InitializeSetup\(\): Boolean;([\s\S]*?)end;/);
    expect(initSetupMatch).not.toBeNull();
    
    if (initSetupMatch) {
      const initSetupFunction = initSetupMatch[1];
      // Should not use ErrorCode with ShellExec (unlike Exec which does use it)
      if (initSetupFunction.includes("ShellExec")) {
        expect(initSetupFunction).not.toMatch(/ShellExec\([^)]*ErrorCode\)/);
        expect(initSetupFunction).not.toMatch(/ShellExec\([^)]*ResultCode\)/);
        // Should have correct parameter count (5 parameters for ShellExec)
        expect(initSetupFunction).toMatch(/ShellExec\(\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*(SW_SHOWNORMAL|1)\s*\)/);
        // Should use SW_SHOWNORMAL constant instead of numeric value
        expect(initSetupFunction).not.toMatch(/ShellExec\([^)]*,\s*[02-9]\s*\)/); // Don't allow other numeric values
      }
    }
  });
});
