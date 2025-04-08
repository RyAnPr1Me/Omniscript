"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map = exports.List = void 0;
class List {
    constructor() {
        this.items = [];
        this.lock = new Mutex();
    }
    async push(item) {
        await this.lock.acquire();
        try {
            this.items.push(item);
        }
        finally {
            this.lock.release();
        }
    }
    async pop() {
        await this.lock.acquire();
        try {
            return this.items.pop();
        }
        finally {
            this.lock.release();
        }
    }
    async filter(predicate) {
        await this.lock.acquire();
        try {
            const filteredItems = this.items.filter(predicate);
            const newList = new List();
            for (const item of filteredItems) {
                await newList.push(item);
            }
            return newList;
        }
        finally {
            this.lock.release();
        }
    }
}
exports.List = List;
class Map {
    constructor() {
        this.items = new Map();
        this.lock = new Mutex();
    }
    async set(key, value) {
        await this.lock.acquire();
        try {
            this.items.set(key, value);
        }
        finally {
            this.lock.release();
        }
    }
    async get(key) {
        await this.lock.acquire();
        try {
            return this.items.get(key);
        }
        finally {
            this.lock.release();
        }
    }
}
exports.Map = Map;
class Mutex {
    constructor() {
        this.promise = Promise.resolve();
    }
    async acquire() {
        let release;
        const next = new Promise(resolve => (release = resolve));
        const previous = this.promise;
        this.promise = next;
        await previous;
        release();
    }
    release() {
        // No-op, handled by acquire
    }
}
