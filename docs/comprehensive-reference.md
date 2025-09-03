# Omniscript Comprehensive Language Reference

This document contains a complete reference of every function, keyword, operator, and feature in the Omniscript programming language, with usage examples and explanations.

## Table of Contents

1. [Language Keywords](#language-keywords)
2. [Operators](#operators)
3. [Type System](#type-system)
4. [Standard Library](#standard-library)
5. [Advanced Features](#advanced-features)
6. [Runtime Features](#runtime-features)
7. [Development Tools](#development-tools)

---

## Language Keywords

### Variable Declaration Keywords

#### `var`
Declares a mutable variable.
```omniscript
var x = 42;
var name = "John";
x = 50; // allowed
```

#### `def`
Declares an immutable binding (constant).
```omniscript
def PI = 3.14159;
def colors = ["red", "green", "blue"];
// PI = 3.15; // Error: cannot reassign
```

#### `let`
Alternative syntax for variable declaration with block scope.
```omniscript
let count = 0;
let isActive = true;
```

#### `const`
Immutable binding (similar to `def`).
```omniscript
const MAX_SIZE = 1000;
const config = { debug: true };
```

### Function Declaration Keywords

#### `fn`
Declares a function.
```omniscript
fn add(a:: number, b:: number):: number {
  return a + b;
}

fn greet(name:: string):: void {
  Console.log(`Hello, ${name}!`);
}
```

#### `async`
Declares an asynchronous function.
```omniscript
async fn fetchData(url:: string):: Promise<string> {
  def response = await HTTP.get(url);
  return response.text();
}
```

#### `await`
Waits for a promise to resolve.
```omniscript
async fn example() {
  def data = await fetchData("https://api.example.com");
  Console.log(data);
}
```

### Control Flow Keywords

#### `if` / `else`
Conditional execution.
```omniscript
if (score >= 90) {
  Console.log("Excellent!");
} else if (score >= 70) {
  Console.log("Good!");
} else {
  Console.log("Try harder!");
}
```

#### `match`
Pattern matching (similar to switch but more powerful).
```omniscript
match value {
  0 => Console.log("zero"),
  1 | 2 | 3 => Console.log("small number"),
  n if n > 100 => Console.log("big number"),
  _ => Console.log("other number")
}
```

#### `while`
Loop while condition is true.
```omniscript
var i = 0;
while (i < 10) {
  Console.log(i);
  i++;
}
```

#### `for`
Iteration loop.
```omniscript
for (let i = 0; i < 10; i++) {
  Console.log(i);
}

// For-in loop
for (item in collection) {
  Console.log(item);
}
```

### Exception Handling Keywords

#### `try` / `catch` / `finally`
Exception handling.
```omniscript
try {
  def result = riskyOperation();
  Console.log(result);
} catch (error:: Error) {
  Console.error("Operation failed:", error.message);
} finally {
  Console.log("Cleanup complete");
}
```

#### `throw`
Throws an exception.
```omniscript
fn validateAge(age:: number):: void {
  if (age < 0) {
    throw new Error("Age cannot be negative");
  }
}
```

#### `return`
Returns a value from a function.
```omniscript
fn multiply(a:: number, b:: number):: number {
  return a * b;
}
```

### Object-Oriented Keywords

#### `class`
Declares a class.
```omniscript
class Person {
  constructor(private name:: string, private age:: number) {}
  
  getName():: string {
    return this.name;
  }
  
  getAge():: number {
    return this.age;
  }
}
```

#### `object`
Declares an object (alternative to class).
```omniscript
object Calculator {
  add(a:: number, b:: number):: number {
    return a + b;
  }
  
  subtract(a:: number, b:: number):: number {
    return a - b;
  }
}
```

#### `interface`
Declares an interface.
```omniscript
interface Drawable {
  draw():: void;
  getColor():: string;
}

class Circle implements Drawable {
  constructor(private color:: string) {}
  
  draw():: void {
    Console.log("Drawing circle");
  }
  
  getColor():: string {
    return this.color;
  }
}
```

#### `extends`
Class inheritance.
```omniscript
class Animal {
  constructor(protected name:: string) {}
  
  speak():: void {
    Console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  speak():: void {
    Console.log(`${this.name} barks`);
  }
}
```

### Module Keywords

#### `use`
Imports symbols from other modules.
```omniscript
use { HTTP, Database } from 'stdlib';
use Calculator from './calculator.os';
use * as Utils from './utils.os';
```

#### `from`
Specifies the source module for imports.
```omniscript
use { List, Map, Set } from 'stdlib/collections';
```

#### `module`
Declares a module.
```omniscript
module MyModule;

export class Helper {
  static format(text:: string):: string {
    return text.toUpperCase();
  }
}
```

#### `export`
Exports symbols from a module.
```omniscript
export fn calculateTax(amount:: number):: number {
  return amount * 0.1;
}

export class TaxCalculator {
  calculate(amount:: number):: number {
    return calculateTax(amount);
  }
}
```

### Miscellaneous Keywords

#### `new`
Creates a new instance.
```omniscript
def person = new Person("Alice", 30);
def list = new List<number>();
```

#### `typeof`
Returns the type of a value.
```omniscript
def x = 42;
Console.log(typeof x); // "number"

def arr = [1, 2, 3];
Console.log(typeof arr); // "object"
```

#### `in`
Checks if a property exists in an object.
```omniscript
def obj = { name: "John", age: 30 };
Console.log("name" in obj); // true
Console.log("address" in obj); // false
```

#### `operator`
Declares custom operators.
```omniscript
operator ++(a:: Vector, b:: Vector):: Vector {
  return new Vector(a.x + b.x, a.y + b.y);
}
```

### Literal Keywords

#### `true` / `false`
Boolean literals.
```omniscript
def isActive = true;
def isCompleted = false;
```

#### `null`
Null value.
```omniscript
def value = null;
if (value !== null) {
  Console.log(value);
}
```

#### `undefined`
Undefined value.
```omniscript
def value:: string | undefined = undefined;
```

---

## Operators

### Arithmetic Operators

#### `+` (Addition)
```omniscript
def sum = 5 + 3; // 8
def text = "Hello" + " World"; // "Hello World"
```

#### `-` (Subtraction)
```omniscript
def diff = 10 - 4; // 6
def negative = -5; // -5 (unary minus)
```

#### `*` (Multiplication)
```omniscript
def product = 6 * 7; // 42
```

#### `/` (Division)
```omniscript
def quotient = 15 / 3; // 5
def decimal = 7 / 2; // 3.5
```

#### `%` (Modulo)
```omniscript
def remainder = 10 % 3; // 1
```

### Assignment Operators

#### `=` (Assignment)
```omniscript
var x = 10;
var name = "Alice";
```

#### `+=` (Add and assign)
```omniscript
var count = 5;
count += 3; // count is now 8
```

#### `-=` (Subtract and assign)
```omniscript
var score = 100;
score -= 10; // score is now 90
```

#### `*=` (Multiply and assign)
```omniscript
var value = 4;
value *= 3; // value is now 12
```

#### `/=` (Divide and assign)
```omniscript
var total = 20;
total /= 4; // total is now 5
```

#### `%=` (Modulo and assign)
```omniscript
var num = 17;
num %= 5; // num is now 2
```

### Comparison Operators

#### `==` (Equal)
```omniscript
Console.log(5 == 5); // true
Console.log("hello" == "hello"); // true
```

#### `!=` (Not equal)
```omniscript
Console.log(5 != 3); // true
Console.log("a" != "b"); // true
```

#### `===` (Strict equal)
```omniscript
Console.log(5 === 5); // true
Console.log(5 === "5"); // false
```

#### `!==` (Strict not equal)
```omniscript
Console.log(5 !== "5"); // true
Console.log(5 !== 5); // false
```

#### `<` (Less than)
```omniscript
Console.log(3 < 5); // true
Console.log(10 < 8); // false
```

#### `>` (Greater than)
```omniscript
Console.log(7 > 4); // true
Console.log(2 > 9); // false
```

#### `<=` (Less than or equal)
```omniscript
Console.log(5 <= 5); // true
Console.log(3 <= 7); // true
```

#### `>=` (Greater than or equal)
```omniscript
Console.log(8 >= 8); // true
Console.log(10 >= 6); // true
```

### Logical Operators

#### `&&` (Logical AND)
```omniscript
def result = true && false; // false
def value = x > 0 && x < 100; // true if x is between 0 and 100
```

#### `||` (Logical OR)
```omniscript
def result = true || false; // true
def isValid = name.length > 0 || hasDefault; // true if either condition is true
```

#### `!` (Logical NOT)
```omniscript
def result = !true; // false
def isEmpty = !list.length; // true if list is empty
```

### Nullish Operators

#### `??` (Nullish coalescing)
```omniscript
def value = userInput ?? "default";
def config = savedConfig ?? defaultConfig;
```

#### `??=` (Nullish assignment)
```omniscript
var settings = null;
settings ??= { theme: "dark" }; // assigns only if settings is null/undefined
```

### Increment/Decrement Operators

#### `++` (Increment)
```omniscript
var i = 5;
i++; // post-increment, i is now 6
++i; // pre-increment, i is now 7
```

#### `--` (Decrement)
```omniscript
var count = 10;
count--; // post-decrement, count is now 9
--count; // pre-decrement, count is now 8
```

### Special Operators

#### `=>` (Arrow function)
```omniscript
def square = (x:: number) => x * x;
def numbers = [1, 2, 3].map(x => x * 2);
```

#### `|>` (Pipeline operator)
```omniscript
def result = data
  |> filter(x => x > 0)
  |> map(x => x * 2)
  |> reduce(0, (a, b) => a + b);
```

#### `?` (Ternary operator)
```omniscript
def message = score >= 60 ? "Pass" : "Fail";
def value = isValid ? computeValue() : defaultValue;
```

#### `.` (Member access)
```omniscript
def name = person.name;
def length = text.length;
person.setAge(25);
```

#### `::` (Type annotation)
```omniscript
def count:: number = 42;
fn greet(name:: string):: void { ... }
```

#### `@` (Decorator)
```omniscript
@Component
class MyComponent {
  @Input() name:: string;
  
  @Method
  render():: void { ... }
}
```

---

## Type System

### Primitive Types

#### `number`
Numeric values (integers and floating-point).
```omniscript
def age:: number = 25;
def price:: number = 29.99;
def hex:: number = 0xFF; // 255
```

#### `string`
Text values.
```omniscript
def name:: string = "Alice";
def message:: string = `Hello, ${name}!`;
def multiline:: string = """
  This is a
  multiline string
""";
```

#### `boolean`
True or false values.
```omniscript
def isActive:: boolean = true;
def isCompleted:: boolean = false;
```

#### `void`
Absence of a return value.
```omniscript
fn logMessage(msg:: string):: void {
  Console.log(msg);
}
```

### Complex Types

#### Array Types
```omniscript
def numbers:: number[] = [1, 2, 3, 4, 5];
def names:: Array<string> = ["Alice", "Bob", "Charlie"];
def matrix:: number[][] = [[1, 2], [3, 4]];
```

#### Object Types
```omniscript
def person:: { name: string, age: number } = {
  name: "John",
  age: 30
};

interface User {
  id: number;
  name: string;
  email?: string; // optional property
}
```

#### Function Types
```omniscript
def calculator:: (a: number, b: number) => number = (a, b) => a + b;
def handler:: (event: Event) => void = (e) => Console.log(e);
```

#### Union Types
```omniscript
def value:: string | number = "hello";
value = 42; // also valid

def status:: "pending" | "completed" | "failed" = "pending";
```

#### Intersection Types
```omniscript
interface Named {
  name: string;
}

interface Aged {
  age: number;
}

def person:: Named & Aged = {
  name: "Alice",
  age: 30
};
```

#### Generic Types
```omniscript
class Box<T> {
  constructor(private value: T) {}
  
  get():: T {
    return this.value;
  }
  
  set(value:: T):: void {
    this.value = value;
  }
}

def stringBox = new Box<string>("hello");
def numberBox = new Box<number>(42);
```

#### Optional Types
```omniscript
def name:: string? = null; // can be string or null
def config:: Config? = undefined; // can be Config or undefined

fn findUser(id:: number):: User? {
  // returns User or null if not found
}
```

---

## Standard Library

### Console Functions

#### `Console.log(...args)`
Outputs general information.
```omniscript
Console.log("Hello, World!");
Console.log("User:", user.name, "Age:", user.age);
```

#### `Console.info(...args)`
Outputs informational messages.
```omniscript
Console.info("Application started successfully");
```

#### `Console.warn(...args)`
Outputs warning messages.
```omniscript
Console.warn("This feature is deprecated");
```

#### `Console.error(...args)`
Outputs error messages.
```omniscript
Console.error("Failed to connect to database");
```

#### `Console.debug(...args)`
Outputs debug information.
```omniscript
Console.debug("Variable state:", { x, y, z });
```

#### `Console.time(label)` / `Console.timeEnd(label)`
Measures execution time.
```omniscript
Console.time("operation");
performExpensiveOperation();
Console.timeEnd("operation"); // outputs: operation: 1234ms
```

#### `Console.trace(...args)`
Outputs a stack trace.
```omniscript
Console.trace("Debug point reached");
```

#### `Console.group(label)` / `Console.groupEnd()`
Groups console output.
```omniscript
Console.group("User Details");
Console.log("Name:", user.name);
Console.log("Email:", user.email);
Console.groupEnd();
```

#### `Console.clear()`
Clears the console.
```omniscript
Console.clear();
```

#### `Console.table(data)`
Displays data in table format.
```omniscript
def users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 }
];
Console.table(users);
```

### Collections

#### `List<T>`
Dynamic array with functional methods.
```omniscript
def list = new List<number>();
list.add(1);
list.add(2);
list.add(3);

// Functional operations
def doubled = list.map(x => x * 2);
def evens = list.filter(x => x % 2 === 0);
def sum = list.reduce(0, (a, b) => a + b);

// Access methods
def first = list.head(); // first element
def rest = list.tail(); // all except first
def reversed = list.reverse();
```

#### `Map<K, V>`
Key-value collection.
```omniscript
def map = new Map<string, number>();
map.set("alice", 30);
map.set("bob", 25);

def age = map.get("alice"); // 30
def hasKey = map.has("charlie"); // false
def keys = map.keys(); // ["alice", "bob"]
def values = map.values(); // [30, 25]

map.delete("bob");
map.clear();
```

#### `Set<T>`
Collection of unique values.
```omniscript
def set = new Set<string>();
set.add("apple");
set.add("banana");
set.add("apple"); // duplicate ignored

def hasApple = set.has("apple"); // true
def size = set.size; // 2

set.delete("banana");
set.clear();
```

#### `PriorityQueue<T>`
Priority-based queue.
```omniscript
def pq = new PriorityQueue<number>((a, b) => a - b);
pq.enqueue(3);
pq.enqueue(1);
pq.enqueue(2);

def min = pq.dequeue(); // 1
def peek = pq.peek(); // 2 (doesn't remove)
```

#### `Graph<T>`
Graph data structure.
```omniscript
def graph = new Graph<string>();
graph.addVertex("A");
graph.addVertex("B");
graph.addEdge("A", "B");

def neighbors = graph.getNeighbors("A"); // ["B"]
def hasPath = graph.hasPath("A", "B"); // true
```

#### `BinarySearchTree<T>`
Binary search tree.
```omniscript
def bst = new BinarySearchTree<number>();
bst.insert(5);
bst.insert(3);
bst.insert(7);

def found = bst.search(3); // true
def inOrder = bst.inOrderTraversal(); // [3, 5, 7]
```

### Math Utilities

#### `MathUtils.PI`
Mathematical constant π.
```omniscript
def circumference = 2 * MathUtils.PI * radius;
```

#### `MathUtils.E`
Mathematical constant e.
```omniscript
def exponential = Math.pow(MathUtils.E, x);
```

#### `MathUtils.factorial(n)`
Calculates factorial.
```omniscript
def result = MathUtils.factorial(5); // 120
```

#### `MathUtils.gcd(a, b)`
Greatest common divisor.
```omniscript
def gcd = MathUtils.gcd(48, 18); // 6
```

#### `MathUtils.random(min, max)`
Random number in range.
```omniscript
def randomNum = MathUtils.random(1, 10); // 1-10
```

#### `Vector2D` / `Vector3D`
Vector mathematics.
```omniscript
def v1 = new Vector2D(3, 4);
def v2 = new Vector2D(1, 2);

def sum = v1.add(v2); // Vector2D(4, 6)
def magnitude = v1.magnitude(); // 5
def dot = v1.dot(v2); // 11

def v3d = new Vector3D(1, 2, 3);
def cross = v3d.cross(new Vector3D(4, 5, 6));
```

#### `Matrix`
Matrix operations.
```omniscript
def m1 = new Matrix([[1, 2], [3, 4]]);
def m2 = new Matrix([[5, 6], [7, 8]]);

def sum = m1.add(m2);
def product = m1.multiply(m2);
def determinant = m1.determinant();
def inverse = m1.inverse();
```

### DateTime

#### `DateTime.now()`
Current date and time.
```omniscript
def now = DateTime.now();
Console.log(now.toString()); // "2024-01-15T10:30:00Z"
```

#### `DateTime.parse(dateString)`
Parse date from string.
```omniscript
def date = DateTime.parse("2024-01-15");
def isoDate = DateTime.parse("2024-01-15T10:30:00Z");
```

#### DateTime Methods
```omniscript
def date = DateTime.now();

// Getters
def year = date.getYear(); // 2024
def month = date.getMonth(); // 1-12
def day = date.getDay(); // 1-31
def hour = date.getHour(); // 0-23
def minute = date.getMinute(); // 0-59

// Manipulation
def tomorrow = date.addDays(1);
def nextWeek = date.addWeeks(1);
def nextMonth = date.addMonths(1);

// Formatting
def formatted = date.format("YYYY-MM-DD HH:mm:ss");
def iso = date.toISOString();
```

#### `DateTimeUtils`
Utility functions for dates.
```omniscript
def isLeapYear = DateTimeUtils.isLeapYear(2024); // true
def daysBetween = DateTimeUtils.daysBetween(date1, date2);
def startOfWeek = DateTimeUtils.startOfWeek(date);
def endOfMonth = DateTimeUtils.endOfMonth(date);
```

#### `Timezone`
Timezone handling.
```omniscript
def utc = Timezone.UTC;
def pst = Timezone.create("America/Los_Angeles");
def est = Timezone.create("America/New_York");

def localTime = date.toTimezone(pst);
```

### Network and HTTP

#### `HTTP.get(url, options?)`
GET request.
```omniscript
async fn fetchUser(id:: number) {
  try {
    def response = await HTTP.get(`/api/users/${id}`);
    def user = await response.json();
    return user;
  } catch (error) {
    Console.error("Failed to fetch user:", error);
    throw error;
  }
}
```

#### `HTTP.post(url, data, options?)`
POST request.
```omniscript
async fn createUser(userData:: UserData) {
  def response = await HTTP.post("/api/users", userData, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  return await response.json();
}
```

#### `HTTP.put(url, data, options?)`
PUT request.
```omniscript
async fn updateUser(id:: number, userData:: UserData) {
  def response = await HTTP.put(`/api/users/${id}`, userData);
  return await response.json();
}
```

#### `HTTP.delete(url, options?)`
DELETE request.
```omniscript
async fn deleteUser(id:: number) {
  def response = await HTTP.delete(`/api/users/${id}`);
  return response.ok;
}
```

#### `HTTPClient`
Configurable HTTP client.
```omniscript
def client = new HTTPClient({
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: {
    "Authorization": "Bearer " + token
  }
});

def response = await client.get("/users");
```

#### `WebSocket`
WebSocket connections.
```omniscript
def ws = new WebSocket("ws://localhost:8080");

ws.onOpen(() => {
  Console.log("Connected");
  ws.send("Hello Server!");
});

ws.onMessage((data) => {
  Console.log("Received:", data);
});

ws.onClose(() => {
  Console.log("Disconnected");
});

ws.onError((error) => {
  Console.error("WebSocket error:", error);
});
```

#### `WebSocketClient`
Enhanced WebSocket client.
```omniscript
def client = new WebSocketClient("ws://localhost:8080", {
  reconnectAttempts: 5,
  reconnectDelay: 1000
});

client.connect();
client.subscribe("channel1", (message) => {
  Console.log("Channel 1:", message);
});
```

### Database

#### `Database.query<T>(entityClass)`
Create a query builder.
```omniscript
def users = await Database.query<User>()
  .where(u => u.age >= 18)
  .orderBy(u => u.name)
  .limit(10)
  .execute();
```

#### `Database.save<T>(entity)`
Save an entity.
```omniscript
def user = new User("Alice", "alice@example.com");
def savedUser = await Database.save(user);
Console.log("Saved with ID:", savedUser.id);
```

#### `Database.findById<T>(entityClass, id)`
Find by ID.
```omniscript
def user = await Database.findById<User>(User, 123);
if (user) {
  Console.log("Found user:", user.name);
} else {
  Console.log("User not found");
}
```

#### `Database.findAll<T>(entityClass)`
Find all entities.
```omniscript
def allUsers = await Database.findAll<User>(User);
Console.log(`Found ${allUsers.length} users`);
```

#### `QueryBuilder`
Advanced query building.
```omniscript
def query = new QueryBuilder<Order>(Order, database)
  .join("user")
  .where(o => o.status === "completed")
  .where(o => o.createdAt >= startDate)
  .select(["id", "total", "user.name"])
  .groupBy("user.id")
  .having(group => group.count > 5)
  .orderBy("total", "DESC")
  .limit(20)
  .offset(40);

def results = await query.execute();
```

### Cryptography

#### `Crypto.hash(data, algorithm)`
Hash data.
```omniscript
def sha256 = Crypto.hash("password123", "SHA-256");
def md5 = Crypto.hash("data", "MD5");
```

#### `Crypto.encrypt(data, key, algorithm)`
Encrypt data.
```omniscript
def encrypted = Crypto.encrypt("secret message", key, "AES-256-GCM");
```

#### `Crypto.decrypt(encryptedData, key, algorithm)`
Decrypt data.
```omniscript
def decrypted = Crypto.decrypt(encrypted, key, "AES-256-GCM");
```

#### `Crypto.generateKey(algorithm, length?)`
Generate cryptographic key.
```omniscript
def aesKey = Crypto.generateKey("AES", 256);
def rsaKeyPair = Crypto.generateKey("RSA", 2048);
```

#### `SecureRandom`
Cryptographically secure random numbers.
```omniscript
def randomBytes = SecureRandom.bytes(32);
def randomNumber = SecureRandom.number(1, 1000000);
def randomString = SecureRandom.string(16); // random alphanumeric string
```

### Reactive Programming

#### `Stream<T>`
Event stream.
```omniscript
def stream = new Stream<number>();

// Subscribe to events
def unsubscribe = stream.subscribe(value => {
  Console.log("Received:", value);
});

// Emit events
stream.next(42);
stream.next(100);

// Transform streams
def doubled = stream.map(x => x * 2);
def filtered = stream.filter(x => x > 50);

// Combine streams
def combined = Stream.merge(stream1, stream2);

// Cleanup
unsubscribe();
```

#### `Signal<T>`
Reactive state.
```omniscript
def count = new Signal<number>(0);

// React to changes
count.subscribe(value => {
  Console.log("Count changed to:", value);
});

// Update value
count.set(5);
count.update(prev => prev + 1);

// Computed signals
def doubled = count.map(x => x * 2);
def isEven = count.map(x => x % 2 === 0);
```

#### `Observable<T>`
Advanced observable patterns.
```omniscript
def observable = new Observable<string>(observer => {
  observer.next("Hello");
  observer.next("World");
  observer.complete();
});

observable.subscribe({
  next: value => Console.log(value),
  error: err => Console.error(err),
  complete: () => Console.log("Done")
});
```

### Utilities

#### `sleep(ms)`
Pause execution.
```omniscript
async fn demo() {
  Console.log("Starting...");
  await sleep(1000); // wait 1 second
  Console.log("Done!");
}
```

#### `GC` (Garbage Collector)
Memory management.
```omniscript
// Force garbage collection
GC.collect();

// Monitor memory usage
def usage = GC.getMemoryUsage();
Console.log("Allocated:", usage.allocated);
Console.log("References:", usage.references);

// Enable/disable features
GC.enableCircularReferenceDetection();
GC.enableMemoryProfiling();
```

#### `Thread`
Threading utilities.
```omniscript
// Create a new thread
def thread = new Thread(() => {
  // Heavy computation
  return expensiveOperation();
});

def result = await thread.join();

// Thread-safe operations
def mutex = new Mutex();
await mutex.lock();
try {
  // Critical section
} finally {
  mutex.unlock();
}
```

#### `DOM` (Browser environment)
DOM manipulation utilities.
```omniscript
// Element selection
def element = DOM.getElementById("myButton");
def elements = DOM.getElementsByClassName("menu-item");

// Event handling
DOM.addEventListener(element, "click", (event) => {
  Console.log("Button clicked!");
});

// DOM manipulation
def newElement = DOM.createElement("div");
DOM.setAttribute(newElement, "class", "highlight");
DOM.appendChild(parent, newElement);
```

---

## Advanced Features

### Pattern Matching

#### Basic Patterns
```omniscript
fn describe(value:: any):: string {
  return match value {
    0 => "zero",
    1 => "one",
    2 | 3 => "two or three",
    n if n > 10 => "big number",
    _ => "something else"
  };
}
```

#### Object Pattern Matching
```omniscript
fn processUser(user:: any):: string {
  return match user {
    { type: "admin", permissions: perms } => `Admin with ${perms.length} permissions`,
    { type: "user", active: true } => "Active user",
    { type: "user", active: false } => "Inactive user",
    _ => "Unknown user type"
  };
}
```

#### Array Pattern Matching
```omniscript
fn processArray(arr:: any[]):: string {
  return match arr {
    [] => "empty",
    [x] => `single element: ${x}`,
    [first, ...rest] => `first: ${first}, rest: ${rest.length} items`,
    _ => "unknown pattern"
  };
}
```

#### Type Pattern Matching
```omniscript
fn handleValue(value:: string | number | boolean):: string {
  return match value {
    s if typeof s === "string" => `String: ${s}`,
    n if typeof n === "number" => `Number: ${n}`,
    b if typeof b === "boolean" => `Boolean: ${b}`,
    _ => "Unknown type"
  };
}
```

### Decorators

#### Class Decorators
```omniscript
@Component({
  selector: "my-component",
  template: "<div>Hello World</div>"
})
class MyComponent {
  @Input() name:: string;
  @Output() click:: EventEmitter<void>;
  
  @Method
  handleClick():: void {
    this.click.emit();
  }
}
```

#### Method Decorators
```omniscript
class ApiService {
  @Cache(300) // Cache for 5 minutes
  @Retry(3) // Retry up to 3 times
  async fetchData(id:: number):: Promise<Data> {
    def response = await HTTP.get(`/api/data/${id}`);
    return response.json();
  }
  
  @Throttle(1000) // Throttle to once per second
  logActivity(message:: string):: void {
    Console.log(message);
  }
}
```

#### Property Decorators
```omniscript
class User {
  @Required
  @MinLength(3)
  name:: string;
  
  @Email
  email:: string;
  
  @Range(0, 150)
  age:: number;
  
  @Transform((value) => value.toLowerCase())
  username:: string;
}
```

#### Custom Decorators
```omniscript
fn Logged(target:: any, propertyName:: string, descriptor:: PropertyDescriptor) {
  def originalMethod = descriptor.value;
  
  descriptor.value = fn(...args:: any[]) {
    Console.log(`Calling ${propertyName} with args:`, args);
    def result = originalMethod.apply(this, args);
    Console.log(`${propertyName} returned:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @Logged
  add(a:: number, b:: number):: number {
    return a + b;
  }
}
```

### Functional Programming

#### Monads

##### Maybe Monad
```omniscript
// Handle nullable values safely
def maybeUser = just(user);
def maybeName = maybeUser
  .map(u => u.name)
  .map(name => name.toUpperCase());

if (maybeName.isSome()) {
  Console.log("Name:", maybeName.unwrap());
} else {
  Console.log("No name found");
}

// Chaining operations
def result = just(5)
  .flatMap(x => x > 0 ? just(x * 2) : nothing())
  .map(x => x + 1)
  .unwrapOr(0); // 11
```

##### Either Monad
```omniscript
fn divide(a:: number, b:: number):: Either<Error, number> {
  if (b === 0) {
    return left(new Error("Division by zero"));
  }
  return right(a / b);
}

def result = divide(10, 2)
  .map(x => x * 2) // 10
  .flatMap(x => divide(x, 2)) // 5
  .mapLeft(err => `Error: ${err.message}`);

match result {
  left(error) => Console.error(error),
  right(value) => Console.log("Result:", value)
}
```

#### Function Composition
```omniscript
// Compose functions right-to-left
def addOne = (x:: number) => x + 1;
def double = (x:: number) => x * 2;
def square = (x:: number) => x * x;

def composed = compose(square, double, addOne);
def result = composed(3); // square(double(addOne(3))) = square(8) = 64

// Pipe functions left-to-right
def piped = pipe(addOne, double, square);
def result2 = piped(3); // square(double(addOne(3))) = square(8) = 64

// Using pipeline operator
def result3 = 3
  |> addOne
  |> double
  |> square; // Same result: 64
```

#### Currying and Partial Application
```omniscript
// Currying
def add = curry((a:: number, b:: number, c:: number) => a + b + c);
def addFive = add(5);
def addFiveAndThree = addFive(3);
def result = addFiveAndThree(2); // 10

// Partial application
def multiply = (a:: number, b:: number, c:: number) => a * b * c;
def multiplyByTwo = partial(multiply, [2]);
def result2 = multiplyByTwo(3, 4); // 24
```

#### Higher-Order Functions
```omniscript
// Memoization
def fibonacci = memoize((n:: number):: number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

// Lazy evaluation
def expensiveComputation = lazy(() => {
  Console.log("Computing...");
  return heavyCalculation();
});

def result = expensiveComputation.value; // Computed only when accessed

// Function utilities
def constant5 = constant(5);
def alwaysFive = constant5("anything"); // 5

def flippedSubtract = flip((a, b) => a - b);
def result = flippedSubtract(3, 10); // 10 - 3 = 7
```

### Metaprogramming

#### Macros
```omniscript
// Built-in macros
@debug(user.name); // Logs: "user.name = Alice"

@assert(x > 0, "x must be positive");

@benchmark {
  expensiveOperation();
} // Times the operation

// Custom macros
macro property(name, type) {
  private _${name}:: ${type};
  
  get${name.capitalize()}():: ${type} {
    return this._${name};
  }
  
  set${name.capitalize()}(value:: ${type}):: void {
    this._${name} = value;
  }
}

class Person {
  @property(name, string)
  @property(age, number)
}

// Macro for singleton pattern
macro singleton(className) {
  class ${className} {
    private static instance:: ${className};
    
    private constructor() {}
    
    static getInstance():: ${className} {
      if (!this.instance) {
        this.instance = new ${className}();
      }
      return this.instance;
    }
  }
}

@singleton(DatabaseManager)
```

#### Reflection
```omniscript
// Type reflection
def typeInfo = Reflect.getType(MyClass);
Console.log("Type name:", typeInfo.name);
Console.log("Properties:", typeInfo.properties);
Console.log("Methods:", typeInfo.methods);

// Instance reflection
def instance = new MyClass();
def metadata = Reflect.getMetadata(instance);
Console.log("Decorators:", metadata.decorators);

// Dynamic property access
def propertyValue = Reflect.get(instance, "propertyName");
Reflect.set(instance, "propertyName", newValue);

// Method invocation
def result = Reflect.invoke(instance, "methodName", [arg1, arg2]);

// Constructor creation
def newInstance = Reflect.construct(MyClass, [constructorArg]);
```

### Concurrency

#### Actor Model
```omniscript
// Create an actor
def counter = runtime.createActor(
  (message:: number, state:: number) => {
    return state + message;
  },
  0 // initial state
);

// Send messages
counter.send(5);
counter.send(10);
counter.send(-3);

// Get current state
def currentState = await counter.getState(); // 12

// Create a more complex actor
def userManager = runtime.createActor(
  (message:: UserMessage, state:: UserState) => {
    match message {
      { type: "ADD_USER", user } => {
        return { ...state, users: [...state.users, user] };
      },
      { type: "REMOVE_USER", userId } => {
        return { ...state, users: state.users.filter(u => u.id !== userId) };
      },
      { type: "GET_USERS" } => {
        // Send response back
        message.replyTo.send(state.users);
        return state;
      }
    }
  },
  { users: [] }
);
```

#### Coroutines
```omniscript
// Schedule a coroutine
runtime.scheduleCoroutine(async () => {
  Console.log("Coroutine started");
  await sleep(1000);
  Console.log("Coroutine finished");
});

// Yield execution
async fn cooperativeTask() {
  for (let i = 0; i < 1000000; i++) {
    // Do some work
    heavyComputation(i);
    
    // Yield every 1000 iterations
    if (i % 1000 === 0) {
      await runtime.yield();
    }
  }
}

// Coroutine communication
def channel = new Channel<string>();

runtime.scheduleCoroutine(async () => {
  def message = await channel.receive();
  Console.log("Received:", message);
});

runtime.scheduleCoroutine(async () => {
  await sleep(500);
  await channel.send("Hello from coroutine!");
});
```

#### Parallel Execution
```omniscript
// Run tasks in parallel
def tasks = [
  () => fetchUserData(1),
  () => fetchUserData(2),
  () => fetchUserData(3)
];

def results = await runtime.parallel(tasks);
Console.log("All users:", results);

// Parallel map
def userIds = [1, 2, 3, 4, 5];
def users = await runtime.parallelMap(userIds, fetchUserData);

// Race conditions
def winner = await runtime.race([
  fetchFromCache(key),
  fetchFromDatabase(key),
  fetchFromAPI(key)
]);
```

### Error Handling

#### Result Type
```omniscript
fn parseNumber(str:: string):: Result<number, Error> {
  def num = parseInt(str);
  if (isNaN(num)) {
    return Result.Err(new Error("Invalid number format"));
  }
  return Result.Ok(num);
}

// Using Result
def result = parseNumber("42");
if (result.isOk()) {
  Console.log("Parsed:", result.unwrap());
} else {
  Console.error("Error:", result.unwrapErr().message);
}

// Chaining operations
def finalResult = parseNumber("42")
  .map(x => x * 2)
  .flatMap(x => x > 100 ? Result.Err(new Error("Too big")) : Result.Ok(x))
  .mapErr(err => new Error(`Parse error: ${err.message}`));
```

#### Option Type
```omniscript
fn findUser(id:: number):: Option<User> {
  def user = database.find(id);
  return user ? Option.Some(user) : Option.None();
}

def user = findUser(123);
def name = user
  .map(u => u.name)
  .unwrapOr("Unknown");

// Combining options
def result = Option.all([
  findUser(1),
  findUser(2),
  findUser(3)
]); // Some([user1, user2, user3]) or None
```

---

## Runtime Features

### Memory Management

#### Garbage Collection
```omniscript
// Enable garbage collection
runtime.enableGarbageCollection();

// Configure GC settings
runtime.configureGC({
  maxHeapSize: "512MB",
  gcThreshold: 0.7,
  incrementalGC: true
});

// Manual collection
runtime.gc.collect();

// Memory monitoring
def usage = runtime.getMemoryUsage();
Console.log("Heap used:", usage.heapUsed);
Console.log("Heap total:", usage.heapTotal);
Console.log("External:", usage.external);
```

#### Reference Counting
```omniscript
// Enable reference counting
runtime.enableReferenceCountingGC();

// Track object references
def obj = { name: "test" };
def refCount = runtime.getReferenceCount(obj);
Console.log("References:", refCount);
```

#### Circular Reference Detection
```omniscript
// Enable detection
runtime.detectCircularReferences();

// Create circular reference
def objA = { name: "A" };
def objB = { name: "B" };
objA.ref = objB;
objB.ref = objA;

// Runtime will detect and handle the cycle
def cycles = runtime.getCircularReferences();
Console.log("Detected cycles:", cycles.length);
```

### Performance Monitoring

#### Profiling
```omniscript
// Start profiling
runtime.startProfiling();

// Run code to profile
performExpensiveOperations();

// Stop and get results
def profile = runtime.stopProfiling();
Console.log("Top functions:", profile.topFunctions);
Console.log("Memory allocations:", profile.allocations);
Console.log("GC events:", profile.gcEvents);
```

#### Benchmarking
```omniscript
// Benchmark a function
def benchmark = runtime.benchmark(() => {
  sortLargeArray(data);
}, {
  iterations: 1000,
  warmup: 100
});

Console.log("Average time:", benchmark.averageTime);
Console.log("Min time:", benchmark.minTime);
Console.log("Max time:", benchmark.maxTime);
Console.log("Operations per second:", benchmark.opsPerSecond);
```

### JIT Compilation

#### Just-In-Time Compilation
```omniscript
// Enable JIT
runtime.enableJIT({
  optimizationLevel: 3,
  inlineThreshold: 100,
  enableSpecialization: true
});

// Hot function (will be JIT compiled)
fn hotFunction(x:: number):: number {
  return x * x + 2 * x + 1;
}

// Force compilation
runtime.compileFunction(hotFunction);
```

#### Ahead-of-Time Compilation
```omniscript
// Compile module ahead of time
def compiledModule = runtime.compileAOT("./my-module.os", {
  optimizations: ["deadCodeElimination", "constantFolding", "inlining"],
  target: "native"
});

// Load and execute
def result = runtime.loadCompiledModule(compiledModule);
```

---

## Development Tools

### Package Manager

#### Installing Packages
```bash
# Command line usage
omni add package-name
omni add @scope/package-name
omni add package-name@version
```

```omniscript
// Programmatic usage
PackageManager.install("lodash");
PackageManager.install("@types/node", { dev: true });
```

#### Package Configuration
```omniscript
// omni.json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "stdlib": "^1.0.0",
    "http-utils": "^2.1.0"
  },
  "devDependencies": {
    "test-framework": "^1.2.0"
  }
}
```

### Testing Framework

#### Basic Tests
```omniscript
use { describe, it, expect, beforeEach, afterEach } from 'testing';

describe("Calculator", () => {
  var calculator:: Calculator;
  
  beforeEach(() => {
    calculator = new Calculator();
  });
  
  it("should add numbers correctly", () => {
    def result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
  
  it("should handle negative numbers", () => {
    def result = calculator.add(-1, 1);
    expect(result).toBe(0);
  });
});
```

#### Async Tests
```omniscript
describe("API Service", () => {
  it("should fetch user data", async () => {
    def user = await apiService.getUser(123);
    expect(user).toBeDefined();
    expect(user.id).toBe(123);
  });
  
  it("should handle errors gracefully", async () => {
    await expect(apiService.getUser(-1)).rejects.toThrow("Invalid user ID");
  });
});
```

#### Mocking
```omniscript
use { mock, spy, stub } from 'testing';

describe("User Service", () => {
  it("should call database correctly", () => {
    def mockDb = mock(Database);
    mockDb.findById.returns(Promise.resolve(testUser));
    
    def userService = new UserService(mockDb);
    def result = await userService.getUser(123);
    
    expect(mockDb.findById).toHaveBeenCalledWith(123);
    expect(result).toBe(testUser);
  });
});
```

### Debugging

#### Debug Mode
```omniscript
// Enable debug mode
runtime.enableDebugMode();

// Debug breakpoints
@debug
fn problematicFunction(x:: number):: number {
  def intermediate = x * 2;
  debugger; // Breakpoint here
  return intermediate + 1;
}

// Debug logging
debug.log("Variable state:", { x, y, z });
debug.trace("Function call stack");
```

#### Performance Debugging
```omniscript
// Profile function execution
@profile
fn expensiveFunction() {
  // ... complex logic
}

// Memory leak detection
runtime.enableMemoryLeakDetection();
def leaks = runtime.detectMemoryLeaks();
Console.log("Potential leaks:", leaks);
```

### CLI Tools

#### Command Line Interface
```bash
# Run Omniscript files
omni run script.os
omni run --watch script.os

# Compile files
omni compile script.os --output dist/
omni compile --aot --optimize script.os

# Package management
omni init # Create new project
omni add package-name
omni remove package-name
omni update

# Testing
omni test
omni test --watch
omni test --coverage

# Development server
omni dev --port 3000
omni build --production
```

---

## Examples and Use Cases

### Web Application
```omniscript
use { HTTP, Database, Console } from 'stdlib';

@Component
class UserController {
  @Route("GET", "/users")
  async getUsers(req:: HTTP.Request):: Promise<HTTP.Response> {
    try {
      def users = await Database.query<User>()
        .where(u => u.active === true)
        .orderBy(u => u.name)
        .execute();
      
      return HTTP.response(200, users);
    } catch (error) {
      Console.error("Failed to fetch users:", error);
      return HTTP.response(500, { error: "Internal server error" });
    }
  }
  
  @Route("POST", "/users")
  async createUser(req:: HTTP.Request):: Promise<HTTP.Response> {
    def userData = await req.json();
    
    def validation = validateUser(userData);
    if (!validation.isValid) {
      return HTTP.response(400, { errors: validation.errors });
    }
    
    def user = new User(userData.name, userData.email);
    def savedUser = await Database.save(user);
    
    return HTTP.response(201, savedUser);
  }
}
```

### Data Processing Pipeline
```omniscript
use { Stream, File, Console } from 'stdlib';

async fn processLogFiles() {
  def results = await File.readStream("access.log")
    |> Stream.lines()
    |> Stream.filter(line => line.includes("ERROR"))
    |> Stream.map(line => parseLogEntry(line))
    |> Stream.groupBy(entry => entry.timestamp.toDateString())
    |> Stream.map(group => ({
        date: group.key,
        errorCount: group.items.length,
        uniqueErrors: new Set(group.items.map(e => e.message)).size
      }))
    |> Stream.sortBy(item => item.date)
    |> Stream.collect();
  
  Console.table(results);
}
```

### Real-time Chat Application
```omniscript
use { WebSocket, Database, Console } from 'stdlib';

class ChatServer {
  private clients:: Map<string, WebSocket> = new Map();
  
  start(port:: number):: void {
    def server = new WebSocket.Server({ port });
    
    server.onConnection((client, userId) => {
      this.clients.set(userId, client);
      
      client.onMessage(async (message) => {
        def chatMessage = await this.saveMessage(userId, message);
        this.broadcastMessage(chatMessage);
      });
      
      client.onDisconnect(() => {
        this.clients.delete(userId);
      });
    });
    
    Console.log(`Chat server started on port ${port}`);
  }
  
  private async saveMessage(userId:: string, content:: string):: Promise<ChatMessage> {
    def message = new ChatMessage(userId, content, DateTime.now());
    return await Database.save(message);
  }
  
  private broadcastMessage(message:: ChatMessage):: void {
    def messageData = JSON.stringify(message);
    
    for (def client of this.clients.values()) {
      client.send(messageData);
    }
  }
}
```

This comprehensive reference covers every major feature, function, keyword, and capability of the Omniscript programming language. Each section includes practical examples showing how to use the features in real-world scenarios.