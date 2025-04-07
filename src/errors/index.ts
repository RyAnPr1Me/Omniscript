export class OmniscriptError extends Error {
  constructor(
    message: string,
    public line: number = 0,
    public column: number = 0
  ) {
    super(message);
    this.name = 'OmniscriptError';
  }
}

export class TypeMismatchError extends OmniscriptError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
    this.name = 'TypeMismatchError';
  }
}
