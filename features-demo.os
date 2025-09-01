// features-demo.os
// Streamlined Omniscript feature showcase
import { component, reactive, computed, entity, DateTime, Database, db, HTTP, Crypto } from 'stdlib';

// 1. Operator Overloading
class Complex {
  real: number; imag: number;
  constructor(r: number, i: number) { this.real = r; this.imag = i; }
  operator +(o: Complex): Complex { return new Complex(this.real + o.real, this.imag + o.imag); }
  toString(): string => `${this.real}+${this.imag}i`;
}
console.log('Operator +:', (new Complex(1,2) + new Complex(3,4)).toString());

// 2. Decorators & Reactive Components
@component
class Counter {
  @reactive count: number;
  constructor() { this.count = 0; }
  increment(): void => this.count += 1;
  @computed get double(): number => this.count * 2;
}
let ctr = new Counter(); ctr.increment(); ctr.increment();
console.log(`Counter: count=${ctr.count}, double=${ctr.double}`);

// 3. Pipelines with |> operator
@reactive let nums = [1,2,3,4,5];
let evensSquared = nums |> (a => a.filter(x=>x%2===0)) |> (a => a.map(x=>x*x));
console.log('Pipelines:', evensSquared);

// 4. Pattern Matching
let x: number|string = 42;
let pm = match x {
  42 => 'The Answer',
  s: string => `String of length ${s.length}`,
  n: number => `Number ${n}`,
  _ => 'Default'
};
console.log('Pattern match:', pm);

// 5. DateTime API
let now = DateTime.now();
console.log('DateTime:', now.format());

// 6. In-Memory ORM
@entity
class User { id:number; name:string; constructor(n:string){this.name=n;this.id=0;} }
Database.clear();
await db.save(new User('Alice'));
await db.save(new User('Bob'));
let users = await Database.query(User).findAll();
console.log('ORM Users:', users.map(u=>u.name));

// 7. HTTP Client
let resp = await HTTP.fetch('https://jsonplaceholder.typicode.com/todos/1');
let data = await resp.json();
console.log('HTTP Title:', data.title);

// 8. Crypto Hashing
let h = await Crypto.hash('omni');
console.log('SHA256 Hash:', h);

// 9. Generators
fn* gen(n: number): Iterable<number> { for(let i=0;i<n;i++) yield i; }
for(let i of gen(3)) console.log('Generator:', i);

// 10. Destructuring & Tuples
let [a,b,...rest] = [1,2,3,4];
console.log('Destructuring:', a,b,rest);
fn pair(): [string,number] => ['omni', 42];
let [s,n] = pair();
console.log('Tuple:', s,n);

// End of demo

  // 1. Operator Overloading
  class Vec { x: number; y: number; constructor(x: number, y: number) { this.x=x; this.y=y; }
    operator +(other: Vec): Vec { return new Vec(this.x+other.x, this.y+other.y); }
    toString(): string => `Vec(${this.x},${this.y})`;
  }
  let v1 = new Vec(1,2), v2 = new Vec(3,4);
  console.log('Operator +:', (v1 + v2).toString());

  // 2. Decorators & Reactive Components
  @component
  class Counter {
    @reactive count: number;
    constructor() { this.count=0; }
    increment(): void => this.count += 1;
    @std.decorator.computed get doubled(): number => this.count * 2;
  }
  let c = new Counter(); c.increment(); c.increment();
  console.log(`Reactive count=${c.count}, doubled=${c.doubled}`);

  // 3. Pipeline Operators (|>) for data flow
  @reactive let nums = [1,2,3,4,5];
  let result = nums
    |> (arr => arr.map(x=>x*3))
    |> (arr => arr.filter(x=>x%2===0));
  console.log('Pipelines:', result);

  // 4. Pattern Matching with Guards
  let pm: any = {a:1,b:2};
  let matchRes = match pm {
    {a:1, b: x} if x>1 => `Got b=${x}`,
    {a, b} => `a=${a},b=${b}`,
    _ => 'no match'
  };
  console.log('Pattern match:', matchRes);

  // 5. DateTime Fluent API
  let now = std.DateTime.now();
  console.log('DateTime now UTC:', now.format('YYYY-MM-DD HH:mm')); 
  console.log('Start of day:', now.startOf('day').toISOString());
  console.log('Add interval:', now.add({hours:5, minutes:30}).format());

  // 5. In-Memory ORM & QueryBuilder
  @entity
  class Post { id: number; title: string; constructor(t:string){ this.title = t; this.id = 0; } }
  Database.clear(); await db.save(new Post('First')); await db.save(new Post('Second'));
  let posts = await Database.query(Post).where(p => p.id > 0).orderBy('id','desc').findAll();
  console.log('ORM posts:', posts.map(p=>p.title));

  // 6. HTTP Client & Async/Await Error Handling
  try {
    let resp = await HTTP.fetch('https://jsonplaceholder.typicode.com/todos/1');
    let data = await resp.json(); console.log('HTTP data:', data.title);
  } catch(e) { console.error('HTTP error', e); } finally { console.log('HTTP done'); }

  // 7. Crypto Utilities
  let hash = await Crypto.hash('omni-script'); console.log('SHA256:', hash);

  // 8. Generators
  fn* generate(n: number): Iterable<number> { for(let i=1;i<=n;i++) yield i; }
  for(let x of generate(3)) console.log('Generator:', x);
};
// Execute demo
await main();
//multi threading and garbage collections testing 

// Import core decorators and stdlib modules
import { component, reactive, computed, entity } from 'stdlib';
import { DateTime, Database, db, HTTP, Crypto } from 'stdlib';
import { Thread, sleep, GC } from 'stdlib';

// Multi-threading demo
async fn threadTask(id: number): Promise<void> {
    for (let i = 0; i < 3; i++) {
        console.log(`Thread ${id} running iteration ${i}`);
        await sleep(100);
    }
    console.log(`Thread ${id} done`);
}

// Spawn multiple threads
let threads: Thread[] = [];
for (let t = 1; t <= 3; t++) {
    let th = Thread.spawn(() => threadTask(t));
    threads.push(th);
}
for (let th of threads) {
    await th.join();
}
console.log('All threads finished');

// Garbage collection testing
let obj = { data: Array(1e6).fill(42) };
console.log('Allocated large object');
obj = null;
GC.collect();
console.log('Forced garbage collection');
// Define a reactive component class
@component
class Counter {
  @reactive count: number;
  constructor() { this.count = 0; }
  increment(): void { this.count += 1; }
  @computed
  get double(): number => this.count * 2;
}

// Define an entity for ORM
@entity
class Post {
  id: number;
  title: string;
  content: string;
  createdAt: DateTime;
  constructor(t: string, c: string) {
    this.title = t;
    this.content = c;
    this.createdAt = DateTime.now();
  }
}

// Main demo function
async fn main() => {
  // 1. Classes & Decorators
  let ctr = new Counter();
  ctr.increment(); ctr.increment();
  console.log(`Count: ${ctr.count}, Double: ${ctr.double}`);

  // 2. Reactive arrays & pipelines
  @reactive let nums = [1,2,3,4,5];
  let oddsSquared = nums
    |> (a => a.filter(x => x % 2 !== 0))
    |> (a => a.map(x => x * x));
  console.log(`Odds squared: ${oddsSquared.join(", ")}`);

  // 3. Pattern Matching
  let val: number | string = "hello";
  let mres = match val {
    42 => "The answer",
    s: string => `String length ${s.length}`,
    _ => "Other"
  };
  console.log(mres);

  // 4. DateTime
  let now = DateTime.now();
  console.log(`UTC Now: ${now.format('YYYY-MM-DD HH:mm:ss')}`);
  console.log(`ISO: ${now.toISOString()}`);

  // 5. In-memory ORM
  Database.clear();
  await db.save(new Post("First","Hello World"));
  await db.save(new Post("Second","Mixture"));
  let all = await Database.query(Post).findAll();
  console.log(`Posts count: ${all.length}`);

  // 6. HTTP fetch
  let res = await HTTP.fetch('https://jsonplaceholder.typicode.com/todos/1');
  let data = await res.json();
  console.log(`Fetched title: ${data.title}`);

  // 7. Crypto hashing
  let hash = await Crypto.hash("omni-script-demo");
  console.log(`SHA-256 hash: ${hash}`);

  // 8. Error handling
  try { throw "Oops"; } catch (e) { console.log("Caught:", e); } finally { console.log("Done"); }

  // 9. Generators
  fn* gen(n: number): Iterable<number> { for(let i=0;i<n;i++) yield i; }
  for(let x of gen(3)) console.log(x);
};

// Execute demo
await main();

import { Crypto, GC } from 'stdlib';

// Allocate a large matrix and perform complex math (matrix multiplication)
fn createMatrix(size: number): number[][] {
    let mat: number[][] = [];
    for (let i = 0; i < size; i++) {
        let row: number[] = [];
        for (let j = 0; j < size; j++) {
            row.push(Math.random() * 1000);
        }
        mat.push(row);
    }
    return mat;
}

fn multiplyMatrices(a: number[][], b: number[][]): number[][] {
    let size = a.length;
    let result: number[][] = [];
    for (let i = 0; i < size; i++) {
        let row: number[] = [];
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += a[i][k] * b[k][j];
            }
            row.push(sum);
        }
        result.push(row);
    }
    return result;
}

// Step 1: Allocate memory for two large matrices
let SIZE = 200; // Adjust for more/less intensity
let matrixA = createMatrix(SIZE);
let matrixB = createMatrix(SIZE);

// Step 2: Perform complex math (matrix multiplication)
console.log('Multiplying matrices...');
let product = multiplyMatrices(matrixA, matrixB);

// Step 3: Serialize result and hash with SHA-256
let serialized = JSON.stringify(product);
let hash = await Crypto.hash(serialized);
console.log('SHA-256 hash of result:', hash);

// Step 4: Store in memory (simulate with a variable)
let memoryStore = { hash, data: serialized };

// Step 5: Retrieve from memory
let retrieved = memoryStore.data;

// Step 6: Encrypt the result
let secret = 'omni-secret-key';
let encrypted = await Crypto.encrypt(retrieved, secret);

// Step 7: Decrypt and print
let decrypted = await Crypto.decrypt(encrypted, secret);
console.log('Decrypted matrix product (first 100 chars):', decrypted.slice(0, 100));

// Step 8: Clear memory and cleanup
memoryStore = null;
matrixA = null;
matrixB = null;
product = null;
GC.collect();
console.log('Memory cleared and garbage collected.');

// 10. Error Handling and Async/Await
async fn fetchAndProcess(url: string): Promise<void> {
  try {
    let resp = await http.get(url);
    console.log(resp.body);
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    console.log('Done');
  }
}

await fetchAndProcess('https://api.github.com');

// 11. Generators and Lazy Iteration
fn* counterGen(limit: number): Iterable<number> {
  for (let i = 0; i < limit; i += 1) {
    yield i;
  }
}

for (let i of counterGen(5)) {
  console.log(`Gen value: ${i}`);
}
// 12. Inline destructuring assignment
let [a, b, ...rest] = [10, 20, 30, 40, 50];
console.log(`Destructured: a=${a}, b=${b}, rest=${rest.join(",")}`);

// 13. Tuple types and return
fn getTuple(): [string, number] => ["omni", 42];
let [name, num] = getTuple();
console.log(`Tuple: name=${name}, num=${num}`);

// 14. Optional chaining and nullish coalescing
let obj2 = { foo: { bar: 123 } };
console.log(`Optional chaining:`, obj2?.foo?.bar ?? "not found");

// 15. Custom infix operator (hypothetical, for demo)
infix operator ** (a: number, b: number): number => Math.pow(a, b);
console.log(`Custom infix operator: 2 ** 8 =`, 2 ** 8);

// 16. String interpolation with expressions
let x = 7, y = 3;
console.log(`Sum of ${x} and ${y} is ${x + y}`);

// 17. Multi-value return with destructuring
fn minMax(arr: number[]): [number, number] => [Math.min(...arr), Math.max(...arr)];
let [min, max] = minMax([5, 9, 2, 8]);
console.log(`Min=${min}, Max=${max}`);

// 18. Lambda with implicit return
let square = x => x * x;
console.log(`Square(5):`, square(5));

// 19. Range syntax and for-of iteration
for (let i of 1..5) {
    console.log(`Range value: ${i}`);
}

// 20. Tagged template literals
fn tag(strings: string[], ...values: any[]): string {
    return strings[0] + values.map((v, i) => `[${v}]${strings[i + 1]}`).join('');
}
let tagged = tag`Hello ${"World"} and ${42}`;
console.log(`Tagged template:`, tagged);
// End of features-demo.os
