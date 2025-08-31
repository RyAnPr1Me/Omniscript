use { HTTP, Console } from 'stdlib';

def main :: () -> void = () => {
  def message :: string = "Hello, Omniscript!";
  Console.log(message);
  
  // Simple HTTP server with modern syntax
  HTTP.createServer("/", (req :: Request, res :: Response) => {
    res.send(message);
  });
  
  // Object with operator overloading using updated syntax
  object Vector {
    def x :: number;
    def y :: number;
    
    constructor(x :: number, y :: number) {
      this.x = x;
      this.y = y;
    }
    
    operator + (other :: Vector) :: Vector {
      return Vector(this.x + other.x, this.y + other.y);
    }
    
    operator * (scalar :: number) :: Vector {
      return Vector(this.x * scalar, this.y * scalar);
    }
  }
  
  def a :: Vector = Vector(1, 2);
  def b :: Vector = Vector(3, 4);
  def c :: Vector = a + b;
  def scaled :: Vector = c * 2;
  
  Console.log(`Vector addition: (${c.x}, ${c.y})`);
  Console.log(`Scaled vector: (${scaled.x}, ${scaled.y})`);
};

// Pattern matching example
def processNumber :: (n :: number) -> string = (n) => {
  match n {
    case 0 => "zero"
    case x if x > 0 => "positive"
    case _ => "negative"
  }
};

// Functional programming example
def numbers :: number[] = [1, 2, 3, 4, 5];
def result :: number = numbers
  |> filter((x) => x % 2 === 0)
  |> map((x) => x * x)
  |> reduce(0, (acc, x) => acc + x);

Console.log(`Functional result: ${result}`);

main();
