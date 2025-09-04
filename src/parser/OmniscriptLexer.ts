import { Lexer, CharStream } from "antlr4";
import { OmniscriptError } from "../errors";
import OmniscriptParser from "./OmniscriptParser";

export default class OmniscriptLexer extends Lexer {
  static readonly EOF = -1;

  public _tokenStartLine: number = 1;
  public _tokenStartColumn: number = 0;
  public _tokenStartCharIndex: number = 0;

  constructor(input: CharStream) {
    if (!input) {
      throw new OmniscriptError("No input provided to lexer");
    }
    super(input);
  }

  nextToken(): any {
    try {
      const la = (k = 1) => (this._input ? this._input.LA(k) : -1);
      const ch = () => la(1);
      const ch2 = () => la(2);
      const C = () => String.fromCharCode(ch());
      const C2 = () => String.fromCharCode(ch2());
      const isWS = (code: number) =>
        code === 32 || code === 9 || code === 10 || code === 13;
      const isAlpha = (code: number) =>
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        code === 95; // A-Z a-z _
      const isNum = (code: number) => code >= 48 && code <= 57;

      const consume = () => {
        if (this._input) this._input.consume();
      };

      // Skip whitespace and comments
      while (this._input) {
        // Skip whitespace
        while (this._input && isWS(ch()) && ch() !== -1) consume();
        // Comments
        if (C() === "/" && C2() === "/") {
          while (this._input && ch() !== 10 && ch() !== -1) consume();
          continue;
        }
        if (C() === "/" && C2() === "*") {
          consume();
          consume();
          while (this._input && !(C() === "*" && C2() === "/")) {
            if (ch() === -1) break;
            consume();
          }
          if (C() === "*" && C2() === "/") {
            consume();
            consume();
          }
          continue;
        }
        break;
      }

      this._tokenStartLine = 1;
      this._tokenStartColumn = 0;
      this._tokenStartCharIndex = this._input ? this._input.index : 0;

      if (!this._input || ch() === -1) {
        return this.makeToken(OmniscriptLexer.EOF, "<EOF>");
      }

      // Strings
      if (C() === '"') {
        consume();
        let text = '"';
        while (this._input && ch() !== -1 && C() !== '"') {
          if (C() === "\\") {
            text += "\\";
            consume();
            if (ch() !== -1) {
              text += C();
              consume();
              continue;
            }
          }
          text += C();
          consume();
        }
        if (C() === '"') {
          text += '"';
          consume();
        }
        return this.makeToken(OmniscriptParser.STRING, text);
      }

      // Numbers
      if (isNum(ch())) {
        let txt = "";
        while (isNum(ch())) {
          txt += C();
          consume();
        }
        if (C() === ".") {
          txt += ".";
          consume();
          while (isNum(ch())) {
            txt += C();
            consume();
          }
        }
        return this.makeToken(OmniscriptParser.NUMBER, txt);
      }

      // Identifiers / keywords
      if (isAlpha(ch())) {
        let id = "";
        while (isAlpha(ch()) || isNum(ch())) {
          id += C();
          consume();
        }
        const kw = id;
        switch (kw) {
          case "var":
          case "def":
            return this.makeToken(OmniscriptParser.VAR, kw);
          case "match":
            return this.makeToken(OmniscriptParser.MATCH, kw);
          case "return":
            return this.makeToken(OmniscriptParser.RETURN, kw);
          case "if":
            return this.makeToken(OmniscriptParser.IF, kw);
          case "else":
            return this.makeToken(OmniscriptParser.ELSE, kw);
          case "while":
            return this.makeToken(OmniscriptParser.WHILE, kw);
          case "for":
            return this.makeToken(OmniscriptParser.FOR, kw);
          case "try":
            return this.makeToken(OmniscriptParser.TRY, kw);
          case "catch":
            return this.makeToken(OmniscriptParser.CATCH, kw);
          case "finally":
            return this.makeToken(OmniscriptParser.FINALLY, kw);
          case "throw":
            return this.makeToken(OmniscriptParser.THROW, kw);
          case "async":
            return this.makeToken(OmniscriptParser.ASYNC, kw);
          case "await":
            return this.makeToken(OmniscriptParser.AWAIT, kw);
          case "fn":
            return this.makeToken(OmniscriptParser.FN, kw);
          case "extends":
            return this.makeToken(OmniscriptParser.EXTENDS, kw);
          case "object":
            return this.makeToken(OmniscriptParser.OBJECT, kw);
          case "use":
            return this.makeToken(OmniscriptParser.USE, kw);
          case "true":
            return this.makeToken(OmniscriptParser.TRUE, kw);
          case "false":
            return this.makeToken(OmniscriptParser.FALSE, kw);
          case "null":
            return this.makeToken(OmniscriptParser.NULL, kw);
          default:
            return this.makeToken(OmniscriptParser.IDENTIFIER, id);
        }
      }

      // Two/three-char operators
      if (C() === "?" && C2() === "?" && String.fromCharCode(la(3)) === "=") {
        consume();
        consume();
        consume();
        return this.makeToken(OmniscriptParser.NULLISH_ASSIGN, "??=");
      }
      if (C() === "=" && C2() === ">") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.ARROW, "=>");
      }
      if (C() === ":" && C2() === ":") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.DOUBLE_COLON, "::");
      }
      if (C() === "=" && C2() === "=") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.EQ, "==");
      }
      if (C() === "!" && C2() === "=") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.NEQ, "!=");
      }
      if (C() === "<" && C2() === "=") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.LTE, "<=");
      }
      if (C() === ">" && C2() === "=") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.GTE, ">=");
      }
      if (C() === "&" && C2() === "&") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.AND, "&&");
      }
      if (C() === "|" && C2() === "|") {
        consume();
        consume();
        return this.makeToken(OmniscriptParser.OR, "||");
      }

      // Single char punctuation/operators
      const single: Record<string, number> = {
        "+": OmniscriptParser.PLUS,
        "-": OmniscriptParser.MINUS,
        "*": OmniscriptParser.MULTIPLY,
        "/": OmniscriptParser.DIVIDE,
        "%": OmniscriptParser.MOD,
        "<": OmniscriptParser.LT,
        ">": OmniscriptParser.GT,
        "!": OmniscriptParser.NOT,
        "=": OmniscriptParser.ASSIGN,
        ":": OmniscriptParser.COLON,
        ";": OmniscriptParser.SEMI,
        ".": OmniscriptParser.DOT,
        ",": OmniscriptParser.COMMA,
        "(": OmniscriptParser.LPAREN,
        ")": OmniscriptParser.RPAREN,
        "[": OmniscriptParser.LBRACKET,
        "]": OmniscriptParser.RBRACKET,
        "{": OmniscriptParser.LBRACE,
        "}": OmniscriptParser.RBRACE,
        "@": OmniscriptParser.AT,
        "?": OmniscriptParser.QUESTION,
        "|": OmniscriptParser.PIPE,
      };
      const t = single[C()];
      if (t !== undefined) {
        const txt = C();
        consume();
        return this.makeToken(t, txt);
      }

      throw new OmniscriptError(`Unexpected character '${C()}'`);
    } catch (error) {
      if (error instanceof OmniscriptError) {
        throw error;
      }
      throw new OmniscriptError(
        `Lexer error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private makeToken(type: number, text: string): any {
    return {
      type,
      text,
      channel: 0,
      line: this._tokenStartLine,
      column: this._tokenStartColumn,
      start: this._tokenStartCharIndex,
      stop: this._input ? this._input.index - 1 : 0,
      tokenIndex: -1,
      source: {
        sourceName: "",
        inputStream: this._input,
      },
    };
  }

  // Note: Token ids come from OmniscriptParser; no local ids defined here.
}
