"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeMismatchError = exports.OmniscriptError = void 0;
class OmniscriptError extends Error {
    constructor(message, line = 0, column = 0) {
        super(message);
        this.line = line;
        this.column = column;
        this.name = 'OmniscriptError';
    }
}
exports.OmniscriptError = OmniscriptError;
class TypeMismatchError extends OmniscriptError {
    constructor(message, line, column) {
        super(message, line, column);
        this.name = 'TypeMismatchError';
    }
}
exports.TypeMismatchError = TypeMismatchError;
