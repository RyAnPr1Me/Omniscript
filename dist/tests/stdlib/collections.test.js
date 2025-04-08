"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collections_1 = require("../../src/stdlib/collections");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Standard Library - Collections', () => {
    (0, globals_1.test)('List operations', () => {
        const list = new collections_1.List();
        list.push(1);
        (0, globals_1.expect)(list.pop()).toBe(1);
    });
    (0, globals_1.test)('Map operations', () => {
        const map = new collections_1.Map();
        map.set('one', 1);
        (0, globals_1.expect)(map.get('one')).toBe(1);
    });
});
