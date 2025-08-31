fn main() {
  var message = "Hello, Omniscript!";
  Console.log(message);
  
  // Simple HTTP server
  HTTP.createServer("/", fn(req, res) {
    res.send(message);
  });
  
    // Object with operator overloading example (prototype)
    object Vector {
      operator + (other) {
        return Vector(this.x + other.x, this.y + other.y)
      }
      constructor(x, y) {
        this.x = x
        this.y = y
      }
    }
  
    var a = Vector(1,2)
    var b = Vector(3,4)
    var c = a + b
    print(c.x, c.y)
}
