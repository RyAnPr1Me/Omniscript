"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = void 0;
class MathUtils {
    static sum(numbers) {
        return numbers.reduce((a, b) => a + b, 0);
    }
    static mean(numbers) {
        return this.sum(numbers) / numbers.length;
    }
    static std(numbers) {
        const avg = this.mean(numbers);
        const squareDiffs = numbers.map(n => (n - avg) ** 2);
        return Math.sqrt(this.mean(squareDiffs));
    }
    static random(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    }
}
exports.MathUtils = MathUtils;
MathUtils.PI = 3.141592653589793;
MathUtils.E = 2.718281828459045;
