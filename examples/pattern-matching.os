// Advanced Pattern Matching and Type System Example
// Demonstrates: Pattern matching, algebraic data types, exhaustiveness checking, guards

use { Console, Math, DateTime } from 'stdlib';

// Define algebraic data types
enum Result<T, E> {
  Ok(value :: T),
  Err(error :: E)
}

enum Option<T> {
  Some(value :: T),
  None
}

enum Shape {
  Circle(radius :: number),
  Rectangle(width :: number, height :: number),
  Triangle(base :: number, height :: number),
  Polygon(sides :: number, sideLength :: number)
}

enum JsonValue {
  Null,
  Bool(value :: boolean),
  Number(value :: number),
  String(value :: string),
  Array(items :: JsonValue[]),
  Object(fields :: Map<string, JsonValue>)
}

// Pattern matching with exhaustiveness checking
def calculateArea :: (shape :: Shape) -> number = (shape) => {
  match shape {
    case Circle(radius) => Math.PI * radius * radius
    case Rectangle(width, height) => width * height
    case Triangle(base, height) => 0.5 * base * height
    case Polygon(sides, sideLength) => {
      // Regular polygon area formula
      def apothem :: number = sideLength / (2 * Math.tan(Math.PI / sides));
      def perimeter :: number = sides * sideLength;
      return 0.5 * perimeter * apothem;
    }
  }
};

// Pattern matching with guards
def categorizeShape :: (shape :: Shape) -> string = (shape) => {
  match shape {
    case Circle(radius) if radius < 1 => "small circle"
    case Circle(radius) if radius < 5 => "medium circle"
    case Circle(_) => "large circle"
    case Rectangle(width, height) if width === height => "square"
    case Rectangle(width, height) if width > height => "wide rectangle"
    case Rectangle(_, _) => "tall rectangle"
    case Triangle(base, height) if base === height => "isosceles-like triangle"
    case Triangle(_, _) => "triangle"
    case Polygon(sides, _) if sides === 3 => "triangle polygon"
    case Polygon(sides, _) if sides === 4 => "quadrilateral"
    case Polygon(sides, _) if sides > 10 => "complex polygon"
    case Polygon(_, _) => "simple polygon"
  }
};

// Nested pattern matching with Result and Option types
def safeDivide :: (a :: number, b :: number) -> Result<number, string> = (a, b) => {
  match b {
    case 0 => Result.Err("Division by zero")
    case _ => Result.Ok(a / b)
  }
};

def processCalculation :: (a :: number, b :: number, c :: number) -> Option<string> = (a, b, c) => {
  def result1 :: Result<number, string> = safeDivide(a, b);
  def result2 :: Result<number, string> = safeDivide(b, c);
  
  match [result1, result2] {
    case [Result.Ok(val1), Result.Ok(val2)] => {
      def sum :: number = val1 + val2;
      match sum {
        case x if x > 10 => Option.Some(`Large result: ${sum}`)
        case x if x > 0 => Option.Some(`Positive result: ${sum}`)
        case 0 => Option.Some("Zero result")
        case _ => Option.Some(`Negative result: ${sum}`)
      }
    }
    case [Result.Err(error), _] => {
      Console.warn(`First calculation failed: ${error}`);
      return Option.None;
    }
    case [_, Result.Err(error)] => {
      Console.warn(`Second calculation failed: ${error}`);
      return Option.None;
    }
  }
};

// JSON parsing with pattern matching
def parseJsonValue :: (input :: string) -> Result<JsonValue, string> = (input) => {
  try {
    def parsed :: any = JSON.parse(input);
    return Result.Ok(convertToJsonValue(parsed));
  } catch (error :: Error) {
    return Result.Err(`JSON parse error: ${error.message}`);
  }
};

def convertToJsonValue :: (value :: any) -> JsonValue = (value) => {
  match typeof value {
    case "boolean" => JsonValue.Bool(value)
    case "number" => JsonValue.Number(value)
    case "string" => JsonValue.String(value)
    case "object" => {
      match value {
        case null => JsonValue.Null
        case value if Array.isArray(value) => {
          def items :: JsonValue[] = value |> map(convertToJsonValue);
          return JsonValue.Array(items);
        }
        case value => {
          def fields :: Map<string, JsonValue> = new Map();
          Object.entries(value).forEach(([key, val]) => {
            fields.set(key, convertToJsonValue(val));
          });
          return JsonValue.Object(fields);
        }
      }
    }
    case _ => JsonValue.Null
  }
};

def extractJsonStrings :: (json :: JsonValue) -> string[] = (json) => {
  match json {
    case JsonValue.String(value) => [value]
    case JsonValue.Array(items) => {
      return items |> flatMap(extractJsonStrings);
    }
    case JsonValue.Object(fields) => {
      def strings :: string[] = [];
      fields.forEach((value, key) => {
        strings.push(...extractJsonStrings(value));
      });
      return strings;
    }
    case _ => []
  }
};

// Advanced pattern matching with destructuring
type Person = {
  name :: string,
  age :: number,
  address :: Address,
  hobbies :: string[]
};

type Address = {
  street :: string,
  city :: string,
  country :: string,
  zipCode :: string
};

def describePerson :: (person :: Person) -> string = (person) => {
  match person {
    case { name, age } if age < 18 => `${name} is a minor (${age} years old)`
    case { name, age, address: { city, country } } if age >= 65 => 
      `${name} is a senior citizen living in ${city}, ${country}`
    case { name, age, hobbies } if hobbies.length === 0 => 
      `${name} (${age}) has no listed hobbies`
    case { name, age, hobbies } if hobbies.includes("programming") => 
      `${name} (${age}) is a programmer with ${hobbies.length} hobbies`
    case { name, age, address: { country } } if country !== "USA" => 
      `${name} (${age}) is an international resident`
    case { name, age } => `${name} is ${age} years old`
  }
};

// Pattern matching with custom extractors
def extractEmail :: (text :: string) -> Option<string> = (text) => {
  def emailRegex :: RegExp = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  def match :: RegExpMatchArray | null = text.match(emailRegex);
  
  match match {
    case null => Option.None
    case [_, email] => Option.Some(email)
    case _ => Option.None
  }
};

def processUserInput :: (input :: string) -> string = (input) => {
  def trimmed :: string = input.trim();
  
  match trimmed {
    case "" => "Empty input"
    case input if input.startsWith("/") => {
      match input {
        case "/help" => "Available commands: /help, /quit, /status"
        case "/quit" => "Goodbye!"
        case "/status" => `Status: ${DateTime.now().toISOString()}`
        case command => `Unknown command: ${command}`
      }
    }
    case input => {
      def emailOption :: Option<string> = extractEmail(input);
      match emailOption {
        case Option.Some(email) => `Found email: ${email}`
        case Option.None => `Processing message: ${input}`
      }
    }
  }
};

// Recursive pattern matching with lists
def analyzeList :: <T>(list :: T[]) -> string = (list) => {
  match list {
    case [] => "empty list"
    case [single] => `single item: ${single}`
    case [first, second] => `two items: ${first} and ${second}`
    case [first, ...rest] if rest.length < 3 => 
      `starts with ${first}, ${rest.length} more items`
    case [first, ...rest] => 
      `starts with ${first}, many more items (${rest.length} total)`
  }
};

// Pattern matching with ranges and intervals
def categorizeNumber :: (num :: number) -> string = (num) => {
  match num {
    case x if x < 0 => "negative"
    case 0 => "zero"
    case x if x >= 1 && x <= 10 => "small positive"
    case x if x >= 11 && x <= 100 => "medium positive"
    case x if x >= 101 && x <= 1000 => "large positive"
    case x if x > 1000 => "very large positive"
    case x if Number.isNaN(x) => "not a number"
    case x if !Number.isFinite(x) => "infinite"
    case _ => "unknown number category"
  }
};

// Main demonstration function
def main :: () -> void = () => {
  Console.log('🎯 Advanced Pattern Matching Examples');
  
  // Shape calculations
  def shapes :: Shape[] = [
    Shape.Circle(3),
    Shape.Rectangle(4, 6),
    Shape.Triangle(8, 5),
    Shape.Polygon(6, 4),
    Shape.Rectangle(5, 5) // Square
  ];
  
  Console.log('\n📐 Shape Analysis:');
  shapes.forEach((shape, index) => {
    def area :: number = calculateArea(shape);
    def category :: string = categorizeShape(shape);
    Console.log(`Shape ${index + 1}: ${category}, Area: ${area.toFixed(2)}`);
  });
  
  // Calculation processing
  Console.log('\n🧮 Calculation Processing:');
  def calculations :: [number, number, number][] = [
    [10, 2, 5],
    [15, 0, 3], // Division by zero
    [20, 4, 2],
    [8, 2, 0]   // Second division by zero
  ];
  
  calculations.forEach(([a, b, c]) => {
    def result :: Option<string> = processCalculation(a, b, c);
    match result {
      case Option.Some(message) => Console.log(`(${a}, ${b}, ${c}): ${message}`)
      case Option.None => Console.log(`(${a}, ${b}, ${c}): Calculation failed`)
    }
  });
  
  // JSON processing
  Console.log('\n📄 JSON Processing:');
  def jsonInputs :: string[] = [
    '{"name": "Alice", "age": 30, "hobbies": ["reading", "gaming"]}',
    '[1, 2, "hello", true, null]',
    '{"nested": {"data": "value", "numbers": [1, 2, 3]}}',
    'invalid json{'
  ];
  
  jsonInputs.forEach((input) => {
    def parseResult :: Result<JsonValue, string> = parseJsonValue(input);
    match parseResult {
      case Result.Ok(jsonValue) => {
        def strings :: string[] = extractJsonStrings(jsonValue);
        Console.log(`✅ Parsed JSON, found ${strings.length} strings: [${strings.join(', ')}]`);
      }
      case Result.Err(error) => Console.log(`❌ ${error}`)
    }
  });
  
  // Person description
  Console.log('\n👤 Person Descriptions:');
  def people :: Person[] = [
    {
      name: "Alice",
      age: 16,
      address: { street: "123 Main St", city: "Boston", country: "USA", zipCode: "02101" },
      hobbies: ["reading", "music"]
    },
    {
      name: "Bob", 
      age: 67,
      address: { street: "456 Oak Ave", city: "Toronto", country: "Canada", zipCode: "M5V 3A8" },
      hobbies: ["gardening", "cooking", "travel"]
    },
    {
      name: "Carol",
      age: 28,
      address: { street: "789 Pine Rd", city: "Seattle", country: "USA", zipCode: "98101" },
      hobbies: ["programming", "hiking", "photography"]
    },
    {
      name: "David",
      age: 35,
      address: { street: "321 Elm St", city: "London", country: "UK", zipCode: "SW1A 1AA" },
      hobbies: []
    }
  ];
  
  people.forEach((person) => {
    def description :: string = describePerson(person);
    Console.log(`- ${description}`);
  });
  
  // User input processing
  Console.log('\n💬 User Input Processing:');
  def inputs :: string[] = [
    "",
    "/help",
    "/status",
    "/unknown",
    "Hello world!",
    "Contact me at alice@example.com for more info",
    "Please email support@company.org or call us"
  ];
  
  inputs.forEach((input) => {
    def response :: string = processUserInput(input);
    Console.log(`Input: "${input}" → ${response}`);
  });
  
  // List analysis
  Console.log('\n📋 List Analysis:');
  def lists :: any[][] = [
    [],
    ["apple"],
    ["apple", "banana"],
    ["apple", "banana", "cherry"],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  ];
  
  lists.forEach((list, index) => {
    def analysis :: string = analyzeList(list);
    Console.log(`List ${index + 1}: ${analysis}`);
  });
  
  // Number categorization
  Console.log('\n🔢 Number Categorization:');
  def numbers :: number[] = [-5, 0, 3, 15, 150, 1500, NaN, Infinity, -Infinity];
  
  numbers.forEach((num) => {
    def category :: string = categorizeNumber(num);
    Console.log(`${num} → ${category}`);
  });
  
  Console.log('\n🎉 Pattern matching examples completed!');
};

// Run the demonstration
main();