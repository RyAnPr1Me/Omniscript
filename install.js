#!/usr/bin/env node
// Advanced installer for Omniscript

const { execSync } = require('child_process');
const os = require('os');

function runCommand(cmd) {
  console.log(`Executing: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

function installOmniscript() {
  console.log("Starting Omniscript installation...");
  console.log(`Detected OS: ${os.platform()}`);

  // Install dependencies
  runCommand('npm install');
  // Build the project (compiles TypeScript to dist/)
  runCommand('npm run build');
  // Link the CLI globally so the "omni" command is available
  runCommand('npm link');

  console.log("Installation complete! You can now use the 'omni' command globally.");
}

installOmniscript();
