#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

// Detect if we're running from a development environment or installed environment
// In development: ../dist/cli.js exists
// In installed environment: ../lib/cli.js exists (dist files copied to lib by installer)
const devCliPath = path.join(__dirname, '..', 'dist', 'cli.js');
const installedCliPath = path.join(__dirname, '..', 'lib', 'cli.js');

let cliPath;
if (fs.existsSync(devCliPath)) {
  // Development environment
  cliPath = devCliPath;
} else if (fs.existsSync(installedCliPath)) {
  // Installed environment
  cliPath = installedCliPath;
} else {
  // Fallback - try the original development path and let it error if it doesn't exist
  cliPath = devCliPath;
}

const realCli = require(cliPath);
module.exports = realCli;
