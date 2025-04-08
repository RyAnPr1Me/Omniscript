#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node" />
const commander_1 = require("commander");
const promises_1 = require("node:fs/promises");
const node_readline_1 = require("node:readline");
const index_1 = require("./index");
const program = new commander_1.Command();
const omniscript = new index_1.Omniscript();
function startRepl(engine) {
    const rl = (0, node_readline_1.createInterface)({
        input: process.stdin,
        output: process.stdout,
        prompt: 'omni> '
    });
    rl.prompt();
    rl.on('line', async (line) => {
        try {
            const result = await engine.execute(line);
            console.log(result);
        }
        catch (error) {
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
    .action(async (file) => {
    try {
        const source = await (0, promises_1.readFile)(file, 'utf-8');
        await omniscript.execute(source);
    }
    catch (error) {
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
