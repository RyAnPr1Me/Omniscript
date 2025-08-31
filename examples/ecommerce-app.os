// E-commerce Application Example
// Demonstrates: Database ORM, HTTP Server, Error Handling, Authentication

import { HTTP, Database, Crypto } from 'stdlib';

// Define data models
class User {
  @id id: number;
  @field name: string;
  @field email: string;
  @field passwordHash: string;
  @timestamp createdAt: DateTime;
  @relation orders: Order[];
}

class Product {
  @id id: number;
  @field name: string;
  @field description: string;
  @field price: number;
  @field stockQuantity: number;
  @field category: string;
  @timestamp createdAt: DateTime;
}

class Order {
  @id id: number;
  @field userId: number;
  @field items: OrderItem[];
  @field totalAmount: number;
  @field status: string; // "pending", "processing", "shipped", "delivered"
  @timestamp createdAt: DateTime;
  @timestamp updatedAt: DateTime;
}

class OrderItem {
  @id id: number;
  @field orderId: number;
  @field productId: number;
  @field quantity: number;
  @field unitPrice: number;
}

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }
  
  try {
    // Verify JWT token (simplified)
    const decoded = await Crypto.verifyJWT(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  match err.type {
    'ValidationError' => res.status(400).json({ error: err.message }),
    'NotFoundError' => res.status(404).json({ error: 'Resource not found' }),
    'UnauthorizedError' => res.status(401).json({ error: 'Unauthorized' }),
    _ => res.status(500).json({ error: 'Internal server error' })
  }
};

// Create HTTP server
const app = new HTTP.Server();

// User Authentication Routes
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await Database.query(User)
      .where(u => u.email === email)
      .first();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const passwordHash = await Crypto.hash(password, 'SHA-256');
    
    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      createdAt: new DateTime()
    });
    
    await Database.save(user);
    
    // Generate JWT token
    const token = await Crypto.generateJWT({ userId: user.id, email: user.email });
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await Database.query(User)
      .where(u => u.email === email)
      .first();
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const passwordHash = await Crypto.hash(password, 'SHA-256');
    if (passwordHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = await Crypto.generateJWT({ userId: user.id, email: user.email });
    
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Product Routes
app.get("/products", async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    
    let query = Database.query(Product);
    
    if (category) {
      query = query.where(p => p.category === category);
    }
    
    const products = await query
      .orderBy("createdAt", "desc")
      .skip((page - 1) * limit)
      .take(limit);
    
    res.json({ products });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const product = await Database.query(Product)
      .where(p => p.id === productId)
      .first();
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Order Routes (Protected)
app.post("/orders", authenticateUser, async (req, res) => {
  try {
    const { items } = req.body; // Array of { productId, quantity }
    const userId = req.user.userId;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Database.query(Product)
        .where(p => p.id === item.productId)
        .first();
      
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}` 
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price
      });
    }
    
    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      createdAt: new DateTime(),
      updatedAt: new DateTime()
    });
    
    await Database.save(order);
    
    // Update stock quantities
    for (const item of items) {
      await Database.query(Product)
        .where(p => p.id === item.productId)
        .update({ stockQuantity: stockQuantity - item.quantity });
    }
    
    res.status(201).json({ 
      message: 'Order created successfully',
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.get("/orders", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const orders = await Database.query(Order)
      .where(o => o.userId === userId)
      .include('items')
      .orderBy("createdAt", "desc");
    
    res.json({ orders });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.patch("/orders/:id/status", authenticateUser, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user.userId;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await Database.query(Order)
      .where(o => o.id === orderId && o.userId === userId)
      .first();
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await Database.query(Order)
      .where(o => o.id === orderId)
      .update({ status, updatedAt: new DateTime() });
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: 'healthy', timestamp: new DateTime() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`E-commerce API server running on port ${PORT}`);
});

export default app;