"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeChecker = void 0;
const errors_1 = require("../errors");
class TypeChecker {
    check(ast) {
        return {
            errors: []
        };
    }
    validateType(expected, actual, line = 0, column = 0) {
        if (expected !== actual) {
            throw new errors_1.OmniscriptError(`Expected type ${expected} but got ${actual}`, line, column);
        }
    }
}
exports.TypeChecker = TypeChecker;
