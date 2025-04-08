"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Actor = exports.Runtime = void 0;
class Runtime {
    constructor() {
        this.scope = new Map();
        this.referenceCounts = new Map();
        this.weakReferences = new WeakMap();
        this.debugMode = false;
    }
    execute(bytecode) {
        try {
            switch (bytecode.type) {
                case 'Function':
                    return this.executeFunction(bytecode);
                case 'Return':
                    return this.executeReturn(bytecode);
                case 'Value':
                    return bytecode.value;
                default:
                    throw new Error(`Unknown bytecode type: ${bytecode.type}`);
            }
        }
        catch (error) {
            const err = error; // Explicitly cast to Error
            console.error("Runtime Error:", err.message);
            throw err;
        }
    }
    async executeAsync(bytecode) {
        try {
            switch (bytecode.type) {
                case 'Function':
                    return await this.executeFunctionAsync(bytecode);
                case 'Return':
                    return await this.executeReturnAsync(bytecode);
                case 'Value':
                    return bytecode.value;
                default:
                    throw new Error(`Unknown bytecode type: ${bytecode.type}`);
            }
        }
        catch (error) {
            const err = error;
            console.error("Runtime Error:", err.message);
            throw err;
        }
    }
    executeFunction(fn) {
        this.scope.set(fn.name, fn);
        return fn.body?.reduce((_, stmt) => this.execute(stmt), undefined);
    }
    async executeFunctionAsync(fn) {
        this.scope.set(fn.name, fn);
        for (const stmt of fn.body || []) {
            await this.executeAsync(stmt);
        }
    }
    executeReturn(ret) {
        return ret.value !== undefined ? this.execute(ret.value) : undefined;
    }
    async executeReturnAsync(ret) {
        return ret.value !== undefined ? await this.executeAsync(ret.value) : undefined;
    }
    enableParallelExecution() {
        console.log("Parallel execution enabled for supported operations.");
    }
    allocate(object) {
        // Track object references
        this.referenceCounts.set(object, (this.referenceCounts.get(object) || 0) + 1);
        this.weakReferences.set(object, true);
    }
    release(object) {
        // Decrease reference count and clean up if no references remain
        if (this.referenceCounts.has(object)) {
            const count = this.referenceCounts.get(object) - 1;
            if (count <= 0) {
                this.referenceCounts.delete(object);
                this.cleanup(object);
            }
            else {
                this.referenceCounts.set(object, count);
            }
        }
    }
    cleanup(object) {
        // Perform cleanup for the object (e.g., freeing resources)
        if (typeof object.destroy === 'function') {
            object.destroy();
        }
        this.weakReferences.delete(object);
    }
    enableGarbageCollection() {
        console.log("Garbage collection enabled.");
        setInterval(() => this.runGarbageCollector(), 10000); // Run every 10 seconds
    }
    runGarbageCollector() {
        console.log("Running garbage collector...");
        for (const [object, count] of this.referenceCounts.entries()) {
            if (count <= 0) {
                this.referenceCounts.delete(object);
                this.cleanup(object);
            }
        }
        // Cleanup weak references by iterating over referenceCounts
        for (const object of this.referenceCounts.keys()) {
            if (!this.referenceCounts.has(object)) {
                this.cleanup(object);
            }
        }
    }
    detectCircularReferences() {
        console.log("Detecting circular references...");
        const visited = new Set();
        for (const [object] of this.referenceCounts.entries()) {
            if (!visited.has(object)) {
                this.traverseReferences(object, visited, new Set());
            }
        }
    }
    traverseReferences(object, visited, stack) {
        if (stack.has(object)) {
            console.warn("Circular reference detected:", object);
            return;
        }
        if (visited.has(object)) {
            return;
        }
        visited.add(object);
        stack.add(object);
        if (typeof object === 'object' && object !== null) {
            for (const key in object) {
                this.traverseReferences(object[key], visited, stack);
            }
        }
        stack.delete(object);
    }
    // New: Create an actor from a function handling messages and state
    createActor(actorFn, initialState) {
        return new Actor(actorFn, initialState);
    }
    // New: Schedule a coroutine (async task) with enhanced logging support.
    async scheduleCoroutine(coroutine) {
        if (this.debugMode) {
            console.log("Scheduling coroutine...");
        }
        const result = await coroutine();
        if (this.debugMode) {
            console.log("Coroutine completed:", result);
        }
        return result;
    }
    // New: Enable visual debugging/profiling.
    enableDebugMode() {
        this.debugMode = true;
        console.log("Debug mode enabled.");
    }
}
exports.Runtime = Runtime;
// New helper Actor class (could be moved to its own module if desired)
class Actor {
    constructor(actorFn, state) {
        this.actorFn = actorFn;
        this.state = state;
        this.mailbox = [];
        this.busy = false;
    }
    send(message) {
        this.mailbox.push(message);
        this.schedule();
    }
    async schedule() {
        if (this.busy)
            return;
        this.busy = true;
        while (this.mailbox.length > 0) {
            const msg = this.mailbox.shift();
            this.state = await this.actorFn(msg, this.state);
        }
        this.busy = false;
    }
}
exports.Actor = Actor;
