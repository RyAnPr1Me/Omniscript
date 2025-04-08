"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runtime = exports.Compiler = exports.Parser = exports.Omniscript = void 0;
const parser_1 = require("./parser");
const compiler_1 = require("./compiler");
const runtime_1 = require("./runtime");
class Omniscript {
    constructor() {
        this.parser = new parser_1.Parser();
        this.compiler = new compiler_1.Compiler();
        this.runtime = new runtime_1.Runtime();
    }
    async execute(source) {
        const ast = this.parser.parse(source);
        const bytecode = this.compiler.compile(ast);
        return this.runtime.execute(bytecode);
    }
}
exports.Omniscript = Omniscript;
var parser_2 = require("./parser");
Object.defineProperty(exports, "Parser", { enumerable: true, get: function () { return parser_2.Parser; } });
var compiler_2 = require("./compiler");
Object.defineProperty(exports, "Compiler", { enumerable: true, get: function () { return compiler_2.Compiler; } });
var runtime_2 = require("./runtime");
Object.defineProperty(exports, "Runtime", { enumerable: true, get: function () { return runtime_2.Runtime; } });
