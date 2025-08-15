import { lex, Token } from './lexer';
import { Program, Expression, NumberLiteral, BooleanLiteral, Identifier, Lambda, Call, Let, IfExpr, Pipe, Binary, Match, MatchCase, ClassDecl, MethodDecl, NewInstance, PropAccess } from './ast';
export class FunctionalParser {
  private tokens: Token[] = []; private pos=0;
  parse(src: string): Program { this.tokens = lex(src); this.pos=0; const body: Expression[]=[]; while(!this.peek('EOF')) { if (this.peek(';')) { this.consume(';'); continue; } body.push(this.expression()); if (this.peek(';')) this.consume(';'); } return { type:'Program', body }; }
  private expression(): Expression { return this.pipe(); }
  private pipe(): Expression { let expr = this.ifExpr(); while(this.peek('|>')) { this.consume('|>'); const rhs = this.ifExpr(); expr = { type:'Pipe', left: expr, right: rhs } as Pipe; } return expr; }
  private ifExpr(): Expression { if (this.peek('IF')) { this.consume('IF'); const cond=this.expression(); this.consume('THEN'); const then=this.expression(); this.consume('ELSE'); const els=this.expression(); return { type:'If', cond, then, else: els } as IfExpr; } return this.matchExpr(); }
  private matchExpr(): Expression { if (this.peek('MATCH')) { this.consume('MATCH'); const target = this.expression(); this.consume('{'); const cases: MatchCase[] = []; while(!this.peek('}')) { let pattern: any; if (this.peek('NUMBER')) { pattern = { type:'NumberLiteral', value: Number(this.consume('NUMBER').value) }; } else if (this.peek('IDENT')) { const nameTok = this.consume('IDENT'); if (nameTok.value === '_') pattern = { type:'Wildcard' }; else pattern = { type:'Identifier', name: nameTok.value }; } else { throw new Error('Invalid match pattern'); } this.consume('=>'); const value = this.expression(); if (this.peek(',')) this.consume(','); cases.push({ pattern, value }); } this.consume('}'); return { type:'Match', expr: target, cases } as Match; } return this.letExpr(); }
  private letExpr(): Expression { if (this.peek('LET')) { this.consume('LET'); const name=this.consume('IDENT').value; this.consume('='); const value=this.expression(); if (this.peek('IN')) { this.consume('IN'); const body=this.expression(); return { type:'Let', name, value, body } as Let; } return { type:'Let', name, value } as Let; } return this.classDecl(); }
  private classDecl(): Expression { if (this.peek('CLASS')) { this.consume('CLASS'); const name = this.consume('IDENT').value; this.consume('{'); const methods: MethodDecl[] = []; while(!this.peek('}')) { if (this.peek('OPERATOR')) { this.consume('OPERATOR'); // operator method
        const opToken = this.consume(this.current().type); // expect + - * /
        if (!['+','-','*','/'].includes(opToken.type)) throw new Error('Unsupported operator');
        const opSymbol = opToken.type;
        this.consume('('); const params: string[] = []; if(!this.peek(')')) { do { params.push(this.consume('IDENT').value); } while (this.consumeOptional(',')); } this.consume(')'); this.consume('=>'); const body = this.expression(); if (this.peek(',')) this.consume(','); methods.push({ type:'MethodDecl', name: opSymbol, params, body, isOperator: true, decorators: [] });
      } else { // regular method name(params)=>expr
        const mName = this.consume('IDENT').value; this.consume('('); const params: string[]=[]; if(!this.peek(')')) { do { params.push(this.consume('IDENT').value); } while (this.consumeOptional(',')); } this.consume(')'); this.consume('=>'); const body = this.expression(); if (this.peek(',')) this.consume(','); methods.push({ type:'MethodDecl', name: mName, params, body, decorators: [] }); }
      }
      this.consume('}'); return { type:'ClassDecl', name, methods, decorators: [] } as ClassDecl; }
    return this.binary(); }

  // Precedence: binary (+,-,*,/)
  private binary(): Expression {
    return this.additive();
  }

  private additive(): Expression {
    let expr = this.multiplicative();
    while (this.peek('+') || this.peek('-')) {
      const op = this.consume(this.current().type).value as ('+'|'-');
      const right = this.multiplicative();
      expr = { type:'Binary', op, left: expr, right } as Binary;
    }
    return expr;
  }

  private multiplicative(): Expression {
    let expr = this.lambda();
    while (this.peek('*') || this.peek('/') || this.peek('%')) {
      const op = this.consume(this.current().type).value as ('*'|'/'|'%');
      const right = this.lambda();
      expr = { type:'Binary', op, left: expr, right } as Binary;
    }
    return expr;
  }
  private lambda(): Expression { if (this.peek('FN')) { this.consume('FN'); this.consume('('); const params:string[]=[]; if(!this.peek(')')) { do { params.push(this.consume('IDENT').value); } while (this.consumeOptional(',')); } this.consume(')'); if (this.peek('=>')) { this.consume('=>'); const body=this.expression(); return { type:'Lambda', params, body } as Lambda; } if (this.peek('{')) { this.consume('{'); const body=this.expression(); this.consume('}'); return { type:'Lambda', params, body } as Lambda; } throw new Error('Expected => or { after lambda parameters'); } return this.call(); }
  private call(): Expression { let expr=this.primary(); while(true) { if (this.peek('(')) { this.consume('('); const args: Expression[]=[]; if(!this.peek(')')) { do { args.push(this.expression()); } while (this.consumeOptional(',')); } this.consume(')'); expr = { type:'Call', callee: expr, args } as Call; continue; } if (this.peek('.')) { this.consume('.'); const name = this.consume('IDENT').value; expr = { type:'Prop', object: expr, name } as PropAccess; continue; } break; } return expr; }
  private primary(): Expression { 
    if (this.peek('NEW')) { 
      this.consume('NEW'); 
      const className = this.consume('IDENT').value; 
      this.consume('('); const args: Expression[] = []; if (!this.peek(')')) { do { args.push(this.expression()); } while (this.consumeOptional(',')); } this.consume(')');
      return { type:'New', className, args } as NewInstance; 
    }
    if (this.peek('NUMBER')) { const v=Number(this.consume('NUMBER').value); return { type:'NumberLiteral', value:v } as NumberLiteral; } 
    if (this.peek('TRUE')) { this.consume('TRUE'); return { type:'BooleanLiteral', value:true } as BooleanLiteral; } 
    if (this.peek('FALSE')) { this.consume('FALSE'); return { type:'BooleanLiteral', value:false } as BooleanLiteral; } 
    if (this.peek('IDENT')) { const name=this.consume('IDENT').value; return { type:'Identifier', name } as Identifier; } 
    if (this.peek('(')) { this.consume('('); const e=this.expression(); this.consume(')'); return e; } 
    throw new Error(`Unexpected token ${this.current().type}`); }
  private current(): Token { return this.tokens[this.pos]; }
  private peek(t: string) { return this.current().type === t; }
  private consume(t: string) { if (!this.peek(t)) throw new Error(`Expected ${t} got ${this.current().type}`); return this.tokens[this.pos++]; }
  private consumeOptional(t: string) { if (this.peek(t)) { this.pos++; return true; } return false; }
}
