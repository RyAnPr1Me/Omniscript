import { Parser } from 'antlr4';

export default class OmniscriptParser extends Parser {
  constructor(input: any) {
    super(input);
  }

  program() {
    // Basic program parsing
    return { type: 'Program', body: [] };
  }

  expression() {
    // Basic expression parsing
    return { type: 'Expression', value: null };
  }
}
