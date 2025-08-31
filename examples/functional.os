// Modern Functional Programming in Omniscript
// Demonstrates immutable def bindings, lambdas, higher-order functions, and functional composition

use { Math, Console } from 'stdlib';

// Immutable bindings with type annotations
def ten :: number = 4 + 6;
def nums :: number[] = range(5);  // [0,1,2,3,4]

// Higher-order functions with pipeline operator
def doubled :: number[] = nums 
  |> map((n :: number) => n * 2);  // [0,2,4,6,8]

def total :: number = doubled 
  |> reduce(0, (acc :: number, v :: number) => acc + v);

Console.log(`Total: ${total}`);

// Function composition
def increment :: (x :: number) -> number = (x) => x + 1;
def double :: (x :: number) -> number = (x) => x * 2;
def square :: (x :: number) -> number = (x) => x * x;

def composed :: (x :: number) -> number = compose(square, double, increment);
def result :: number = composed(5);  // ((5 + 1) * 2) ^ 2 = 144

Console.log(`Composed function result: ${result}`);

// Monadic error handling
def safeDivide :: (a :: number, b :: number) -> Maybe<number> = (a, b) => {
  match b {
    case 0 => nothing()
    case _ => just(a / b)
  }
};

def divisionResult :: Maybe<number> = safeDivide(10, 2)
  |> map((x) => x * 3)
  |> map((x) => x + 1);

match divisionResult {
  case just(value) => Console.log(`Division result: ${value}`)
  case nothing() => Console.log("Division by zero error")
}

// Currying and partial application
def add :: (a :: number) -> (b :: number) -> number = curry((a, b) => a + b);
def add5 :: (x :: number) -> number = add(5);
def numbers :: number[] = [1, 2, 3, 4, 5];
def incremented :: number[] = numbers |> map(add5);

Console.log(`Incremented: [${incremented.join(', ')}]`);

// Lazy evaluation
def expensiveComputation :: () -> number = lazy(() => {
  Console.log("Computing...");
  return range(1000) |> map(square) |> reduce(0, add);
});

// Computation only happens when forced
def lazyResult :: number = force(expensiveComputation);
Console.log(`Lazy result: ${lazyResult}`);

// Pattern matching with lists
def processList :: (lst :: number[]) -> string = (lst) => {
  match lst {
    case [] => "empty list"
    case [x] => `single element: ${x}`
    case [first, ...rest] => `first: ${first}, rest has ${rest.length} elements`
  }
};

Console.log(processList([]));
Console.log(processList([42]));
Console.log(processList([1, 2, 3, 4]));

// Memoization for performance
def fibonacci :: (n :: number) -> number = memoize((n) => {
  match n {
    case 0 => 0
    case 1 => 1
    case _ => fibonacci(n - 1) + fibonacci(n - 2)
  }
});

Console.log(`Fibonacci(20): ${fibonacci(20)}`);

// Final pipeline combining multiple concepts
def finalResult :: number = range(100)
  |> filter((x) => x % 3 === 0)
  |> map(square)
  |> take(10)
  |> reduce(0, add);

Console.log(`Final functional pipeline result: ${finalResult}`);
