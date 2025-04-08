"use strict";
// New file: Reactive Programming Primitives
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = exports.Observable = exports.Stream = void 0;
class Stream {
    constructor() {
        this.subscribers = [];
    }
    subscribe(fn) {
        this.subscribers.push(fn);
        return () => this.subscribers = this.subscribers.filter(sub => sub !== fn);
    }
    next(value) {
        this.subscribers.forEach(sub => sub(value));
    }
    complete() {
        this.subscribers = [];
    }
}
exports.Stream = Stream;
class Observable {
    constructor(producer) {
        this.producer = producer;
    }
    subscribe(fn) {
        const stream = new Stream();
        this.producer(stream);
        return stream.subscribe(fn);
    }
}
exports.Observable = Observable;
class Signal {
    constructor(initial) {
        this.subscribers = [];
        this._value = initial;
    }
    get value() {
        return this._value;
    }
    set value(newVal) {
        if (this._value !== newVal) {
            this._value = newVal;
            this.subscribers.forEach(fn => fn(newVal));
        }
    }
    subscribe(fn) {
        this.subscribers.push(fn);
        return () => this.subscribers = this.subscribers.filter(sub => sub !== fn);
    }
}
exports.Signal = Signal;
