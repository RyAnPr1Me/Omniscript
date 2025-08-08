#!/usr/bin/env node
/// <reference types="node" />
import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { Interface as ReadlineInterface, createInterface } from 'node:readline';
import { Omniscript } from './index';

const program = new Command();
const omniscript = new Omniscript();

function startRepl(engine: Omniscript) {
  const rl: ReadlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'omni> '
  });

  rl.prompt();

  rl.on('line', async (line: string) => {
    try {
      const result = await engine.execute(line);
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

program
  .name('omni')
  .description('Omniscript CLI')
  .version('0.1.0');

program
  .command('run')
  .description('Run an Omniscript file')
  .argument('<file>', 'Path to Omniscript file')
  .action(async (file: string) => {
    try {
      const source = await readFile(file, 'utf-8');
      const result = await omniscript.execute(source);
      if (result !== undefined) {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('eval')
  .description('Evaluate inline Omniscript/functional code snippet')
  .argument('<code...>', 'Code to execute (wrap in quotes)')
  .action(async (codeParts: string[]) => {
    const code = codeParts.join(' ');
    try {
      const result = await omniscript.execute(code);
      if (result !== undefined) console.log(result);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('repl')
  .description('Start Omniscript REPL')
  .action(() => {
    startRepl(omniscript);
  });

program.parse();
