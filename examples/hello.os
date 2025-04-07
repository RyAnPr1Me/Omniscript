fn main() {
  let message = "Hello, Omniscript!";
  Console.log(message);
  
  // Simple HTTP server
  HTTP.createServer("/", fn(req, res) {
    res.send(message);
  });
}
