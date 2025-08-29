const { Parser, Compiler } = require('./dist/index.js');

const parser = new Parser();
const compiler = new Compiler();

const source = `
import { List, Map } from 'stdlib/collections';

fn main() {
  let list = new List<number>();
  list.push(42);
}
`;

console.log('Testing detailed compilation...');
try {
  const ast = parser.parse(source);
  console.log('AST body length:', ast.body.length);
  ast.body.forEach((item, i) => {
    console.log(`  AST[${i}]:`, item.type, item.name || item.from || '');
  });

  const bytecode = compiler.compile(ast);
  console.log('\nBytecode type:', bytecode.type);
  console.log('Bytecode imports:', bytecode.imports);
  
  if (bytecode.type === 'Block') {
    console.log('Block body length:', bytecode.body.length);
    bytecode.body.forEach((item, i) => {
      console.log(`  Block[${i}]:`, item.type, item.name || '', 'imports:', item.imports || 'none');
    });
  }
} catch (error) {
  console.error('Error:', error.message);
}