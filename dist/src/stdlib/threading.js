"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadPool = exports.Worker = void 0;
class Worker {
    constructor(scriptURL) {
        this.worker = new globalThis.Worker(scriptURL);
    }
    postMessage(data) {
        this.worker.postMessage(data);
    }
    onMessage(callback) {
        this.worker.onmessage = (event) => callback(event.data);
    }
    terminate() {
        this.worker.terminate();
    }
}
exports.Worker = Worker;
class ThreadPool {
    constructor(size, scriptURL) {
        this.workers = [];
        for (let i = 0; i < size; i++) {
            this.workers.push(new Worker(scriptURL));
        }
    }
    async execute(data) {
        return Promise.all(data.map((item, index) => {
            const worker = this.workers[index % this.workers.length];
            return new Promise(resolve => {
                worker.onMessage(resolve);
                worker.postMessage(item);
            });
        }));
    }
}
exports.ThreadPool = ThreadPool;
