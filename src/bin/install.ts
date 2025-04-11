#!/usr/bin/env node

import OmniscriptInstaller from '../installManager';

const args = process.argv.slice(2);
console.log('Command line arguments:', args);

const upgrade = args.includes('--upgrade');
const userInstall = args.includes('--user');
const prefixIndex = args.indexOf('--prefix');
const prefix = prefixIndex !== -1 ? args[prefixIndex + 1] : undefined;

console.log('Installation options:', { upgrade, userInstall, prefix });

OmniscriptInstaller.install({ upgrade, prefix, userInstall }).catch((err: Error) => {
  console.error('❌ Installation failed:', err);
  process.exit(1);
});