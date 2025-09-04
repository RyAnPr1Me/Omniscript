// Test file to verify Omniscript stdlib loading
import { List, MathUtils, DateTime } from 'stdlib';

// Test collections
def list = new List<number>();
await list.push(1);
await list.push(2);
await list.push(3);

def array = await list.toArray();
console.log('List contents:', array);

// Test math utilities
def numbers = [1, 2, 3, 4, 5];
def sum = MathUtils.sum(numbers);
def mean = MathUtils.mean(numbers);
console.log('Sum:', sum, 'Mean:', mean);

// Test datetime
def now = DateTime.now();
def tomorrow = now.add(1, 'days');
console.log('Now:', now.format());
console.log('Tomorrow:', tomorrow.format());

console.log('Omniscript stdlib test completed successfully!');