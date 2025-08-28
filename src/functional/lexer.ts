export interface Token { type: string; value: string }
const KEYWORDS = new Set(['let','in','fn','true','false','if','then','else','match','class','operator','new','extends','try','catch','finally','return','throw','await','async']);
export function lex(input: string): Token[] {
  const tokens: Token[] = []; let i=0;
  const isAlpha = (c: string)=>/[A-Za-z_]/.test(c); const isNum=(c:string)=>/[0-9]/.test(c);
  while (i < input.length) {
    const c = input[i]; if (/\s/.test(c)) { i++; continue; }
    // two-char tokens first
    if (c === '=' && input[i+1] === '>') { tokens.push({type:'ARROW', value:'=>'}); i+=2; continue; }
    if (c === '|' && input[i+1]==='>') { tokens.push({type:'PIPE_ARROW', value:'|>'}); i+=2; continue; }
    if (c === '=' && input[i+1] === '=') {
      if (input[i+2] === '=') { tokens.push({type:'===', value:'==='}); i+=3; continue; }
      tokens.push({type:'==', value:'=='}); i+=2; continue;
    }
    if (c === '!' && input[i+1] === '=') {
      if (input[i+2] === '=') { tokens.push({type:'!==', value:'!=='}); i+=3; continue; }
      tokens.push({type:'!=', value:'!='}); i+=2; continue;
    }
    if (c === '>' && input[i+1] === '=') { tokens.push({type:'>=', value:'>='}); i+=2; continue; }
    if (c === '<' && input[i+1] === '=') { tokens.push({type:'<=', value:'<='}); i+=2; continue; }
    if (c === '@') { tokens.push({type:'AT', value:'@'}); i++; continue; }
    if (c === ':' ) { tokens.push({type:'COLON', value:':'}); i++; continue; }
    if (c === ',' ) { tokens.push({type:'COMMA', value:','}); i++; continue; }
    if (c === '{' ) { tokens.push({type:'LBRACE', value:'{'}); i++; continue; }
    if (c === '}' ) { tokens.push({type:'RBRACE', value:'}'}); i++; continue; }
    if (c === ';' ) { tokens.push({type:'SEMI', value:';'}); i++; continue; }
    if (c === '(' ) { tokens.push({type:'LPAREN', value:'('}); i++; continue; }
    if (c === ')' ) { tokens.push({type:'RPAREN', value:')'}); i++; continue; }
    if (c==='-' && isNum(input[i+1])) { let num=c; i++; while(i<input.length && (isNum(input[i])||input[i]==='.') ) num+=input[i++]; tokens.push({type:'NUMBER', value:num}); continue; }
    if (isNum(c)) { let num=c; i++; while(i<input.length&&(isNum(input[i])||input[i]==='.')) num+=input[i++]; tokens.push({type:'NUMBER', value:num}); continue; }
    if (c === '"') { let str=''; i++; while(i<input.length && input[i]!=='"') str+=input[i++]; if(i<input.length) i++; tokens.push({type:'STRING', value:str}); continue; }
    if (c === "'") { let str=''; i++; while(i<input.length && input[i]!=="'") str+=input[i++]; if(i<input.length) i++; tokens.push({type:'STRING', value:str}); continue; }
    if (isAlpha(c)) { let ident=c; i++; while(i<input.length&&/[A-Za-z0-9_]/.test(input[i])) ident+=input[i++]; if (KEYWORDS.has(ident)) tokens.push({type:ident.toUpperCase(), value:ident}); else tokens.push({type:'IDENT', value:ident}); continue; }
    if ('+-*/%><'.includes(c)) { tokens.push({type:c,value:c}); i++; continue; }
    if (c === '=') { tokens.push({type:'EQUAL', value:'='}); i++; continue; }
    if (c === '.') { tokens.push({type:'DOT', value:'.'}); i++; continue; }
    throw new Error(`Unexpected char '${c}'`);
  }
  tokens.push({type:'EOF', value:''}); return tokens;
}
