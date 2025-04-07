import { OmniscriptError } from '../errors';

export class TypeChecker {
  check(ast: any) {
    return {
      errors: []
    };
  }

  validateType(expected: string, actual: string, line: number = 0, column: number = 0) {
    if (expected !== actual) {
      throw new OmniscriptError(`Expected type ${expected} but got ${actual}`, line, column);
    }
  }
}
