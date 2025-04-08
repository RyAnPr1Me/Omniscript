"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = void 0;
const promises_1 = require("fs/promises");
class PackageManager {
    constructor() {
        this.config = {
            name: '',
            version: '',
            dependencies: {},
            omniscript: {}
        };
    }
    async loadConfig(path = 'package.json') {
        const content = await (0, promises_1.readFile)(path, 'utf-8');
        this.config = JSON.parse(content);
    }
    async installDependency(name, version) {
        this.config.dependencies[name] = version;
        await this.saveConfig();
    }
    async enableStdLib(module) {
        this.config.omniscript = this.config.omniscript || {};
        this.config.omniscript.stdlib = this.config.omniscript.stdlib || [];
        if (!this.config.omniscript.stdlib.includes(module)) {
            this.config.omniscript.stdlib.push(module);
        }
        await this.saveConfig();
    }
    async enableDebugger() {
        // Enable debugger support
        this.config.omniscript = this.config.omniscript || {};
        this.config.omniscript.plugins = this.config.omniscript.plugins || [];
        if (!this.config.omniscript.plugins.includes('debugger')) {
            this.config.omniscript.plugins.push('debugger');
        }
        await this.saveConfig();
    }
    async enableProfiler() {
        // Enable profiler support
        this.config.omniscript = this.config.omniscript || {};
        this.config.omniscript.plugins = this.config.omniscript.plugins || [];
        if (!this.config.omniscript.plugins.includes('profiler')) {
            this.config.omniscript.plugins.push('profiler');
        }
        await this.saveConfig();
    }
    async enableAutocomplete() {
        // Enable autocomplete support
        this.config.omniscript = this.config.omniscript || {};
        this.config.omniscript.plugins = this.config.omniscript.plugins || [];
        if (!this.config.omniscript.plugins.includes('autocomplete')) {
            this.config.omniscript.plugins.push('autocomplete');
        }
        await this.saveConfig();
    }
    async enableLinting() {
        // Enable linting support
        this.config.omniscript = this.config.omniscript || {};
        this.config.omniscript.plugins = this.config.omniscript.plugins || [];
        if (!this.config.omniscript.plugins.includes('linting')) {
            this.config.omniscript.plugins.push('linting');
        }
        await this.saveConfig();
    }
    async enableRefactoringTools() {
        // Enable refactoring tools support
        this.config.omniscript = this.config.omniscript || {};
        this.config.omniscript.plugins = this.config.omniscript.plugins || [];
        if (!this.config.omniscript.plugins.includes('refactoring-tools')) {
            this.config.omniscript.plugins.push('refactoring-tools');
        }
        await this.saveConfig();
    }
    async listAvailableLibraries() {
        // Fetch the list of libraries from the registry
        const response = await fetch('https://registry.omniscript.dev/libraries');
        return response.json();
    }
    async listAvailablePlugins() {
        // Fetch the list of plugins from the registry
        const response = await fetch('https://registry.omniscript.dev/plugins');
        return response.json();
    }
    async searchRegistry(query) {
        // Search the registry for libraries or plugins matching the query
        const response = await fetch(`https://registry.omniscript.dev/search?q=${encodeURIComponent(query)}`);
        return response.json();
    }
    async saveConfig() {
        await (0, promises_1.writeFile)('package.json', JSON.stringify(this.config, null, 2));
    }
}
exports.PackageManager = PackageManager;
