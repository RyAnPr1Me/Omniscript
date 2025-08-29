const { Omniscript } = require('./dist/index.js');

const omni = new Omniscript();

console.log('Testing fixed object literal...');

// Test the full scenario step by step
const src = `class User { constructor(data) { this.name = data.name; this.email = data.email; } getName() { return this.name; } } let user = new User({ name: 'John Doe', email: 'john@example.com' }); user.getName()`;

omni.execute(src).then(result => {
  console.log('Full test result:', result);
  console.log('Type:', typeof result);
}).catch(error => {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
});