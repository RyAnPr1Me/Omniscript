#!/usr/bin/env node
const path = require('path');
const realCli = require(path.join(__dirname, '..', 'dist', 'cli.js'));
module.exports = realCli;
