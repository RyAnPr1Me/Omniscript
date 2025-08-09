fn main() {
  let message = "Hello, Omniscript!";
  Console.log(message);
  
  // Simple HTTP server
  HTTP.createServer("/", fn(req, res) {
    res.send(message);
  });
  
    // Class with operator overloading example (prototype)
    class Vector {
      operator + (other) {
        return Vector(this.x + other.x, this.y + other.y)
      }
      constructor(x, y) {
        this.x = x
        this.y = y
      }
    }
  
    let a = Vector(1,2)
    let b = Vector(3,4)
    let c = a + b
    print(c.x, c.y)
}
