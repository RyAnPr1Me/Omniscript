// Modern E-commerce Application Example
// Demonstrates: Database ORM, HTTP Server, Error Handling, Authentication, Type Safety

use { HTTP, Database, Crypto, DateTime, Console } from 'stdlib';

// Type definitions
type UserRegistration = {
  name :: string,
  email :: string,
  password :: string
};

type UserLogin = {
  email :: string,
  password :: string
};

type OrderItemInput = {
  productId :: number,
  quantity :: number
};

type AuthToken = {
  userId :: number,
  email :: string,
  exp :: number
};

// Define data models with modern syntax
object User {
  @id id :: number;
  @field name :: string;
  @field email :: string;
  @field passwordHash :: string;
  @timestamp createdAt :: DateTime;
  @relation orders :: Order[];
  
  constructor(data :: UserRegistration) {
    this.name = data.name;
    this.email = data.email;
    this.createdAt = DateTime.now();
  }
  
  def validate :: () -> Either<string, boolean> = () => {
    match {
      case this.name.length < 2 => left("Name must be at least 2 characters")
      case !this.email.includes("@") => left("Invalid email format")
      case this.email.length < 5 => left("Email too short")
      case _ => right(true)
    }
  };
  
  def setPassword :: (password :: string) -> Promise<void> = async (password) => {
    this.passwordHash = await Crypto.hash(password, 'SHA-256');
  };
  
  def verifyPassword :: (password :: string) -> Promise<boolean> = async (password) => {
    def hash :: string = await Crypto.hash(password, 'SHA-256');
    return hash === this.passwordHash;
  };
}

object Product {
  @id id :: number;
  @field name :: string;
  @field description :: string;
  @field price :: number;
  @field stockQuantity :: number;
  @field category :: string;
  @field imageUrl :: string;
  @timestamp createdAt :: DateTime;
  
  constructor(data :: any) {
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.stockQuantity = data.stockQuantity;
    this.category = data.category;
    this.imageUrl = data.imageUrl || "";
    this.createdAt = DateTime.now();
  }
  
  def validate :: () -> Either<string, boolean> = () => {
    match {
      case this.name.length === 0 => left("Product name is required")
      case this.price <= 0 => left("Price must be positive")
      case this.stockQuantity < 0 => left("Stock quantity cannot be negative")
      case _ => right(true)
    }
  };
  
  def isInStock :: (quantity :: number) -> boolean = (quantity) => {
    return this.stockQuantity >= quantity;
  };
  
  def calculateTotal :: (quantity :: number) -> number = (quantity) => {
    return this.price * quantity;
  };
}

object Order {
  @id id :: number;
  @field userId :: number;
  @field items :: OrderItem[];
  @field totalAmount :: number;
  @field status :: OrderStatus;
  @timestamp createdAt :: DateTime;
  @timestamp updatedAt :: DateTime;
  
  constructor(userId :: number, items :: OrderItem[]) {
    this.userId = userId;
    this.items = items;
    this.totalAmount = items |> map((item) => item.getTotal()) |> reduce(0, (a, b) => a + b);
    this.status = OrderStatus.Pending;
    this.createdAt = DateTime.now();
    this.updatedAt = DateTime.now();
  }
  
  def updateStatus :: (newStatus :: OrderStatus) -> void = (newStatus) => {
    this.status = newStatus;
    this.updatedAt = DateTime.now();
  };
}

object OrderItem {
  @id id :: number;
  @field orderId :: number;
  @field productId :: number;
  @field quantity :: number;
  @field unitPrice :: number;
  
  constructor(productId :: number, quantity :: number, unitPrice :: number) {
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
  
  def getTotal :: () -> number = () => {
    return this.quantity * this.unitPrice;
  };
}

// Enums for better type safety
enum OrderStatus {
  Pending = "pending",
  Processing = "processing", 
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled"
}

// Authentication middleware with type safety
def authenticateUser :: (req :: HTTP.Request, res :: HTTP.Response, next :: Function) -> Promise<void> = 
  async (req, res, next) => {
    def authHeader :: string | undefined = req.headers['authorization'];
    
    match authHeader {
      case undefined => {
        res.status(401).json({ error: 'No authentication token provided' });
        return;
      }
      case header => {
        def token :: string = header.replace('Bearer ', '');
        
        try {
          def decoded :: AuthToken = await Crypto.verifyJWT(token, process.env.JWT_SECRET);
          req.user = decoded;
          next();
        } catch (error :: Error) {
          res.status(401).json({ error: 'Invalid authentication token' });
        }
      }
    }
  };

// Error handling with pattern matching
def handleError :: (error :: Error, req :: HTTP.Request, res :: HTTP.Response) -> void = 
  (error, req, res) => {
    Console.error('Error:', error.message);
    
    match error.name {
      case "ValidationError" => res.status(400).json({ error: error.message })
      case "NotFoundError" => res.status(404).json({ error: 'Resource not found' })
      case "UnauthorizedError" => res.status(401).json({ error: 'Unauthorized' })
      case "DatabaseError" => res.status(500).json({ error: 'Database operation failed' })
      case _ => res.status(500).json({ error: 'Internal server error' })
    }
  };

// Create HTTP server
def app :: HTTP.Server = HTTP.createServer();

// Middleware
app.use(HTTP.middleware.json());
app.use(HTTP.middleware.cors());

// User Authentication Routes
app.post("/auth/register", async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def userData :: UserRegistration = req.body;
    def user :: User = new User(userData);
    
    def validation :: Either<string, boolean> = user.validate();
    
    match validation {
      case left(error) => {
        res.status(400).json({ error });
        return;
      }
      case right(_) => {
        // Check if user already exists
        def existingUser :: User | null = await Database.query<User>()
          .where((u) => u.email === userData.email)
          .first();
        
        match existingUser {
          case null => {
            await user.setPassword(userData.password);
            def savedUser :: User = await Database.save(user);
            
            def tokenPayload :: AuthToken = {
              userId: savedUser.id,
              email: savedUser.email,
              exp: DateTime.now().getTime() + (24 * 60 * 60 * 1000) // 24 hours
            };
            
            def token :: string = await Crypto.generateJWT(tokenPayload);
            
            res.status(201).json({
              message: 'User created successfully',
              token,
              user: {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email
              }
            });
          }
          case user => res.status(400).json({ error: 'User with this email already exists' })
        }
      }
    }
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

app.post("/auth/login", async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def loginData :: UserLogin = req.body;
    
    def user :: User | null = await Database.query<User>()
      .where((u) => u.email === loginData.email)
      .first();
    
    match user {
      case null => res.status(401).json({ error: 'Invalid credentials' })
      case user => {
        def isValid :: boolean = await user.verifyPassword(loginData.password);
        
        match isValid {
          case false => res.status(401).json({ error: 'Invalid credentials' })
          case true => {
            def tokenPayload :: AuthToken = {
              userId: user.id,
              email: user.email,
              exp: DateTime.now().getTime() + (24 * 60 * 60 * 1000)
            };
            
            def token :: string = await Crypto.generateJWT(tokenPayload);
            
            res.json({
              message: 'Login successful',
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              }
            });
          }
        }
      }
    }
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

// Product Routes
app.get("/products", async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def { category, page = "1", limit = "20" } = req.query;
    def pageNum :: number = parseInt(page);
    def limitNum :: number = parseInt(limit);
    def offset :: number = (pageNum - 1) * limitNum;
    
    def query = Database.query<Product>();
    
    def filteredQuery = match category {
      case undefined => query
      case cat => query.where((p) => p.category === cat)
    };
    
    def products :: Product[] = await filteredQuery
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(limitNum)
      .execute();
    
    def total :: number = await Database.count<Product>();
    
    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

app.get("/products/:id", async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def productId :: number = parseInt(req.params.id);
    
    match productId {
      case x if isNaN(x) => res.status(400).json({ error: 'Invalid product ID' })
      case id => {
        def product :: Product | null = await Database.findById<Product>(id);
        
        match product {
          case null => res.status(404).json({ error: 'Product not found' })
          case product => res.json({ product })
        }
      }
    }
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

// Order Routes (Protected)
app.post("/orders", authenticateUser, async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def { items } :: { items: OrderItemInput[] } = req.body;
    def userId :: number = req.user.userId;
    
    match items {
      case [] => res.status(400).json({ error: 'Order must contain at least one item' })
      case items => {
        // Validate and process items
        def processedItems :: OrderItem[] = [];
        def totalAmount :: number = 0;
        
        for (def item of items) {
          def product :: Product | null = await Database.findById<Product>(item.productId);
          
          match product {
            case null => {
              res.status(400).json({ error: `Product ${item.productId} not found` });
              return;
            }
            case product => {
              match product.isInStock(item.quantity) {
                case false => {
                  res.status(400).json({
                    error: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}`
                  });
                  return;
                }
                case true => {
                  def orderItem :: OrderItem = new OrderItem(
                    item.productId, 
                    item.quantity, 
                    product.price
                  );
                  processedItems.push(orderItem);
                  totalAmount += product.calculateTotal(item.quantity);
                }
              }
            }
          }
        }
        
        // Create order
        def order :: Order = new Order(userId, processedItems);
        def savedOrder :: Order = await Database.save(order);
        
        // Update stock quantities using functional approach
        def stockUpdates :: Promise<void>[] = items |> map(async (item) => {
          def product :: Product = await Database.findById<Product>(item.productId);
          product.stockQuantity -= item.quantity;
          await Database.save(product);
        });
        
        await Promise.all(stockUpdates);
        
        res.status(201).json({
          message: 'Order created successfully',
          order: {
            id: savedOrder.id,
            totalAmount: savedOrder.totalAmount,
            status: savedOrder.status,
            createdAt: savedOrder.createdAt
          }
        });
      }
    }
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

app.get("/orders", authenticateUser, async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def userId :: number = req.user.userId;
    
    def orders :: Order[] = await Database.query<Order>()
      .where((o) => o.userId === userId)
      .include('items')
      .orderBy("createdAt", "desc")
      .execute();
    
    res.json({ orders });
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

app.patch("/orders/:id/status", authenticateUser, async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def orderId :: number = parseInt(req.params.id);
    def { status } :: { status: string } = req.body;
    def userId :: number = req.user.userId;
    
    def statusValues :: string[] = Object.values(OrderStatus);
    
    match statusValues.includes(status) {
      case false => res.status(400).json({ error: 'Invalid status' })
      case true => {
        def order :: Order | null = await Database.query<Order>()
          .where((o) => o.id === orderId && o.userId === userId)
          .first();
        
        match order {
          case null => res.status(404).json({ error: 'Order not found' })
          case order => {
            order.updateStatus(status as OrderStatus);
            await Database.save(order);
            res.json({ message: 'Order status updated successfully' });
          }
        }
      }
    }
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

// Analytics endpoint
app.get("/analytics/sales", authenticateUser, async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def orders :: Order[] = await Database.query<Order>()
      .where((o) => o.status === OrderStatus.Delivered)
      .execute();
    
    def analytics = orders
      |> groupBy((o) => o.createdAt.toDateString())
      |> map((group) => ({
          date: group.key,
          totalSales: group.items |> map((o) => o.totalAmount) |> reduce(0, (a, b) => a + b),
          orderCount: group.items.length
        }))
      |> sortBy((item) => item.date);
    
    res.json({ analytics });
  } catch (error :: Error) {
    handleError(error, req, res);
  }
});

// Health check endpoint
app.get("/health", (req :: HTTP.Request, res :: HTTP.Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: DateTime.now(),
    version: '2.0.0',
    features: ['authentication', 'orders', 'analytics', 'type-safety']
  });
});

// Start server
def PORT :: number = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  Console.log(`🛒 Modern E-commerce API server running on port ${PORT}`);
  Console.log(`📋 Available endpoints:`);
  Console.log(`  POST   /auth/register`);
  Console.log(`  POST   /auth/login`);
  Console.log(`  GET    /products`);
  Console.log(`  GET    /products/:id`);
  Console.log(`  POST   /orders (protected)`);
  Console.log(`  GET    /orders (protected)`);
  Console.log(`  PATCH  /orders/:id/status (protected)`);
  Console.log(`  GET    /analytics/sales (protected)`);
  Console.log(`  GET    /health`);
});

// Export main functionality
export { app, User, Product, Order, OrderItem, OrderStatus, authenticateUser, handleError };

// Example usage:
// Run this file to start the e-commerce server
// Register: curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
// Login: curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password123"}'