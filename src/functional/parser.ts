import { lex, Token } from './lexer';
import {
  Program,
  Expression,
  NumberLiteral,
  StringLiteral,
  Match,
  MatchCase,
  IfExpr,
  Let,
  Pipe,
  Binary,
  Lambda,
  ClassDecl,
  MethodDecl,
  AwaitExpr,
  ImportDecl
} from './ast';

export class FunctionalParser {
  private tokens: Token[] = [];
  private pos = 0;

  parse(src: string): Program {
    this.tokens = lex(src);
    this.pos = 0;
    const body: Expression[] = [];
    while (!this.peek('EOF')) {
      // skip any leading semicolons
      while (this.peek('SEMI')) this.consume('SEMI');
      if (this.peek('EOF')) break;
      
      // Handle imports at the top level
      if (this.peek('IMPORT')) {
        body.push(this.importDecl());
      } else {
        body.push(this.expression());
      }
      
      // consume trailing semicolons
      while (this.peek('SEMI')) this.consume('SEMI');
    }
    return { type: 'Program', body };
  }

  private importDecl(): Expression {
    this.consume('IMPORT');
    this.consume('LBRACE');
    const imports: string[] = [];
    if (!this.peek('RBRACE')) {
      do {
        imports.push(this.consume('IDENT').value);
      } while (this.consumeOptional('COMMA'));
    }
    this.consume('RBRACE');
    this.consume('FROM');
    const from = this.consume('STRING').value;
    return { type: 'Import', imports, from };
  }

  // --- Helper token methods ---
  private current(): Token { return this.tokens[this.pos] || { type: 'EOF', value: '' }; }
  private peek(t: string): boolean { return this.current().type === t; }
  private consume(t?: string): Token {
    const cur = this.current();
    if (t && cur.type !== t) throw new Error(`Expected ${t} got ${cur.type} at pos ${this.pos}`);
    this.pos++;
    return cur;
  }
  private consumeOptional(t: string): boolean { if (this.peek(t)) { this.pos++; return true; } return false; }

  private expression(): Expression { return this.pipe(); }

  private pipe(): Expression {
    let expr = this.ifExpr();
    while (this.peek('PIPE_ARROW')) {
      this.consume('PIPE_ARROW');
      const rhs = this.ifExpr();
      expr = { type: 'Pipe', left: expr, right: rhs } as Pipe;
    }
    return expr;
  }

  private ifExpr(): Expression {
    if (this.peek('IF')) {
      this.consume('IF');
      const cond = this.expression();
      this.consume('THEN');
      const then = this.expression();
      this.consume('ELSE');
      const els = this.expression();
      return { type: 'If', cond, then, else: els } as IfExpr;
    }
    return this.matchExpr();
  }

  private matchExpr(): Expression {
    if (this.peek('MATCH')) {
      this.consume('MATCH');
      const target = this.expression();
      this.consume('LBRACE');
      const cases: MatchCase[] = [];
      while (!this.peek('RBRACE')) {
        let pattern: any;
        if (this.peek('NUMBER')) {
          pattern = { type: 'NumberLiteral', value: Number(this.consume('NUMBER').value) } as NumberLiteral;
        } else if (this.peek('STRING')) {
          pattern = { type: 'StringLiteral', value: this.consume('STRING').value } as StringLiteral;
        } else if (this.peek('IDENT')) {
          const nameTok = this.consume('IDENT');
          if (nameTok.value === '_') pattern = { type: 'Wildcard' };
          else pattern = { type: 'Identifier', name: nameTok.value };
        } else {
          throw new Error('Invalid match pattern');
        }
        
        // Check for guard condition (e.g., "n if n > 0")
        let guard: Expression | undefined;
        if (this.peek('IF')) {
          this.consume('IF');
          guard = this.expression();
        }
        
        // allow ARROW or COLON as separators
        if (this.peek('ARROW')) this.consume('ARROW'); else if (this.peek('COLON')) this.consume('COLON'); else throw new Error('Expected => or : in match arm');
        const value = this.expression();
        if (this.peek('COMMA')) this.consume('COMMA');
        cases.push({ pattern, guard, value } as MatchCase);
      }
      this.consume('RBRACE');
      return { type: 'Match', expr: target, cases } as Match;
    }
    return this.letExpr();
  }

  private letExpr(): Expression {
    if (this.peek('LET')) {
      this.consume('LET');
      const name = this.consume('IDENT').value;
      this.consume('EQUAL');
      const value = this.expression();
      return { type: 'Let', name, value } as Let;
    }
    return this.classDecl();
  }

  private classDecl(): Expression {
    // Parse decorators
    const decorators: string[] = [];
    while (this.peek('AT')) {
      this.consume('AT');
      const decoratorName = this.consume('IDENT').value;
      decorators.push(decoratorName);
    }
    
    if (this.peek('CLASS')) {
      this.consume('CLASS');
      const name = this.consume('IDENT').value;
      // optional inheritance
      let parent: string | undefined;
      if (this.peek('EXTENDS')) { this.consume('EXTENDS'); parent = this.consume('IDENT').value; }
      this.consume('LBRACE');
      const methods: MethodDecl[] = [];
      while (!this.peek('RBRACE')) {
        // Parse method decorators
        const methodDecorators: string[] = [];
        while (this.peek('AT')) {
          this.consume('AT');
          const decoratorName = this.consume('IDENT').value;
          methodDecorators.push(decoratorName);
        }
        
        if (this.peek('OPERATOR')) {
          this.consume('OPERATOR');
          const opToken = this.consume(this.current().type);
          const opSymbol = opToken.type;
          this.consume('LPAREN');
          const params: string[] = [];
          if (!this.peek('RPAREN')) { do { params.push(this.consume('IDENT').value); } while (this.consumeOptional('COMMA')); }
          this.consume('RPAREN');
          if (this.peek('ARROW')) { this.consume('ARROW'); const body = this.expression(); methods.push({ type: 'MethodDecl', name: opSymbol, params, body, isOperator: true, decorators: methodDecorators }); }
          else if (this.peek('LBRACE')) { this.consume('LBRACE'); const body = this.expression(); this.consume('RBRACE'); methods.push({ type: 'MethodDecl', name: opSymbol, params, body, isOperator: true, decorators: methodDecorators }); }
          else throw new Error('Expected method body for operator');
        } else {
          const mName = this.consume('IDENT').value;
          this.consume('LPAREN');
          const params: string[] = [];
          if (!this.peek('RPAREN')) { do { params.push(this.consume('IDENT').value); } while (this.consumeOptional('COMMA')); }
          this.consume('RPAREN');
          if (this.peek('ARROW')) { this.consume('ARROW'); const body = this.expression(); methods.push({ type: 'MethodDecl', name: mName, params, body, decorators: methodDecorators }); }
          else if (this.peek('LBRACE')) { this.consume('LBRACE'); const body = this.expression(); this.consume('RBRACE'); methods.push({ type: 'MethodDecl', name: mName, params, body, decorators: methodDecorators }); }
          else throw new Error('Expected method body');
        }
        if (this.peek('COMMA')) this.consume('COMMA');
      }
      this.consume('RBRACE');
      return { type: 'ClassDecl', name, methods, decorators, parent } as ClassDecl;
    } else if (decorators.length > 0) {
      // Decorators without class - could be function or variable decoration
      throw new Error('Decorators without class not yet supported');
    }
    return this.binary();
  }

  private binary(): Expression { return this.comparison(); }

  private comparison(): Expression {
    let expr = this.additive();
    while (this.peek('>') || this.peek('<') || this.peek('>=') || this.peek('<=') || 
           this.peek('==') || this.peek('!=') || this.peek('===') || this.peek('!==')) {
      const op = this.consume(this.current().type).value as ('>'|'<'|'>='|'<='|'=='|'!='|'==='|'!==');
      const right = this.additive();
      expr = { type: 'Binary', op, left: expr, right } as Binary;
    }
    return expr;
  }

  private additive(): Expression {
    let expr = this.multiplicative();
    while (this.peek('+') || this.peek('-')) {
      const op = this.consume(this.current().type).value as ('+'|'-');
      const right = this.multiplicative();
      expr = { type: 'Binary', op, left: expr, right } as Binary;
    }
    return expr;
  }

  private multiplicative(): Expression {
    let expr = this.lambda();
    while (this.peek('*') || this.peek('/') || this.peek('%')) {
      const op = this.consume(this.current().type).value as ('*'|'/'|'%');
      const right = this.lambda();
      expr = { type: 'Binary', op, left: expr, right } as Binary;
    }
    return expr;
  }

  private lambda(): Expression {
    if (this.peek('FN')) {
      this.consume('FN');
      this.consume('LPAREN');
      const params: string[] = [];
      if (!this.peek('RPAREN')) {
        do {
          const paramToken = this.consume('IDENT');
          if (!paramToken || !paramToken.value) {
            throw new Error(`Expected parameter name, got ${paramToken ? paramToken.type : 'null'}`);
          }
          params.push(paramToken.value);
        } while (this.consumeOptional('COMMA'));
      }
      this.consume('RPAREN');
      let lambdaNode: Expression;
      if (this.peek('ARROW')) {
        this.consume('ARROW');
        const body = this.expression();
        lambdaNode = { type: 'Lambda', params, body } as Lambda;
      } else if (this.peek('LBRACE')) {
        this.consume('LBRACE');
        const body = this.expression();
        this.consume('RBRACE');
        lambdaNode = { type: 'Lambda', params, body } as Lambda;
      } else if (this.peek('EQUAL') || this.peek('EQUALS') || this.peek('EQUAL')) {
        this.consume(this.current().type);
        const body = this.expression();
        lambdaNode = { type: 'Lambda', params, body } as Lambda;
      } else {
        throw new Error(`Lambda parsing error: Expected '=>', '{', or '=' after parameters, got '${this.current().type}'`);
      }
      // allow immediate invocation or member access on the lambda: fn(x)=>... (5) or fn(x)=>....member
      let expr: any = lambdaNode;
      while (true) {
        if (this.peek('LPAREN')) {
          this.consume('LPAREN');
          const args:any[] = [];
          if (!this.peek('RPAREN')) {
            do { args.push(this.expression()); } while (this.consumeOptional('COMMA'));
          }
          this.consume('RPAREN');
          expr = { type:'Call', callee: expr, args } as any;
          continue;
        }
        if (this.peek('DOT')) {
          this.consume('DOT');
          const member = this.consume('IDENT').value;
          expr = { type:'Prop', object: expr, name: member } as any;
          continue;
        }
        break;
      }
      return expr;
    }
    return this.call();
  }

  private call(): any {
    let expr = this.primary();
    while (true) {
      if (this.peek('LPAREN')) {
        this.consume('LPAREN'); const args:any[] = []; if (!this.peek('RPAREN')) { do { args.push(this.expression()); } while(this.consumeOptional('COMMA')); } this.consume('RPAREN'); expr = { type:'Call', callee: expr, args } as any; continue;
      }
      if (this.peek('DOT')) { this.consume('DOT'); const member = this.consume('IDENT').value; expr = { type:'Prop', object: expr, name: member } as any; continue; }
      break;
    }
    return expr;
  }

  private primary(): any {
    const t = this.current();
    if (this.peek('AWAIT')) {
      this.consume('AWAIT');
      const expr = this.primary();
      return { type: 'Await', expr };
    }
    if (this.peek('NUMBER')) { this.consume('NUMBER'); return { type:'NumberLiteral', value: Number(t.value) }; }
    if (this.peek('STRING')) { this.consume('STRING'); return { type:'StringLiteral', value: t.value }; }
    if (this.peek('IDENT')) { this.consume('IDENT'); return { type:'Identifier', name: t.value }; }
    if (this.peek('NEW')) { this.consume('NEW'); const cname = this.consume('IDENT').value; this.consume('LPAREN'); const args:any[] = []; if (!this.peek('RPAREN')) { do { args.push(this.expression()); } while(this.consumeOptional('COMMA')); } this.consume('RPAREN'); return { type:'New', className: cname, args } as any; }
    if (this.peek('LPAREN')) { this.consume('LPAREN'); const e = this.expression(); this.consume('RPAREN'); return e; }
    if (this.peek('LBRACE')) { this.consume('LBRACE'); const obj:any = {}; while(!this.peek('RBRACE')) { const k = this.consume('IDENT').value; this.consume('COLON'); const v = this.expression(); obj[k]=v; if (this.peek('COMMA')) this.consume('COMMA'); } this.consume('RBRACE'); return { type:'ObjectLiteral', properties: obj }; }
    if (this.peek('LBRACKET')) { this.consume('LBRACKET'); const arr:any[] = []; while(!this.peek('RBRACKET')) { arr.push(this.expression()); if (this.peek('COMMA')) this.consume('COMMA'); } this.consume('RBRACKET'); return { type:'ArrayLiteral', elements: arr }; }
    throw new Error(`Unexpected token ${this.current().type} at pos ${this.pos}`);
  }
}
