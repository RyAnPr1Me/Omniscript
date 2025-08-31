// Microservices Architecture Example
// Demonstrates: Service discovery, Load balancing, Circuit breakers, Health checks

import { HTTP, Database, Crypto, ServiceMesh } from 'stdlib';

// Service Registry for service discovery
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
  }
  
  register(serviceName: string, instance: ServiceInstance) {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, []);
    }
    
    this.services.get(serviceName).push(instance);
    
    // Start health check for this instance
    this.startHealthCheck(serviceName, instance);
    
    console.log(`Service ${serviceName} registered: ${instance.host}:${instance.port}`);
  }
  
  unregister(serviceName: string, instanceId: string) {
    const instances = this.services.get(serviceName) || [];
    const filtered = instances.filter(inst => inst.id !== instanceId);
    this.services.set(serviceName, filtered);
    
    // Stop health check
    if (this.healthChecks.has(instanceId)) {
      clearInterval(this.healthChecks.get(instanceId));
      this.healthChecks.delete(instanceId);
    }
    
    console.log(`Service ${serviceName} unregistered: ${instanceId}`);
  }
  
  getInstances(serviceName: string): ServiceInstance[] {
    return this.services.get(serviceName) || [];
  }
  
  getHealthyInstances(serviceName: string): ServiceInstance[] {
    return this.getInstances(serviceName).filter(inst => inst.healthy);
  }
  
  private startHealthCheck(serviceName: string, instance: ServiceInstance) {
    const interval = setInterval(async () => {
      try {
        const response = await HTTP.get(`http://${instance.host}:${instance.port}/health`);
        instance.healthy = response.status === 200;
        instance.lastHealthCheck = new Date();
      } catch (error) {
        instance.healthy = false;
        instance.lastHealthCheck = new Date();
        console.warn(`Health check failed for ${serviceName}:${instance.id}`);
      }
    }, 30000); // Check every 30 seconds
    
    this.healthChecks.set(instance.id, interval);
  }
}

interface ServiceInstance {
  id: string;
  host: string;
  port: number;
  healthy: boolean;
  lastHealthCheck?: Date;
  metadata?: Record<string, any>;
}

const serviceRegistry = new ServiceRegistry();

// Load Balancer with multiple strategies
class LoadBalancer {
  constructor(private strategy: 'round-robin' | 'least-connections' | 'random' = 'round-robin') {
    this.counters = new Map();
    this.connections = new Map();
  }
  
  private counters: Map<string, number>;
  private connections: Map<string, number>;
  
  selectInstance(serviceName: string): ServiceInstance | null {
    const instances = serviceRegistry.getHealthyInstances(serviceName);
    
    if (instances.length === 0) {
      return null;
    }
    
    match this.strategy {
      'round-robin' => {
        const counter = this.counters.get(serviceName) || 0;
        const selected = instances[counter % instances.length];
        this.counters.set(serviceName, counter + 1);
        return selected;
      },
      
      'least-connections' => {
        return instances.reduce((least, current) => {
          const leastConns = this.connections.get(least.id) || 0;
          const currentConns = this.connections.get(current.id) || 0;
          return currentConns < leastConns ? current : least;
        });
      },
      
      'random' => {
        const randomIndex = Math.floor(Math.random() * instances.length);
        return instances[randomIndex];
      },
      
      _ => instances[0]
    }
  }
  
  incrementConnections(instanceId: string) {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, current + 1);
  }
  
  decrementConnections(instanceId: string) {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, Math.max(0, current - 1));
  }
}

const loadBalancer = new LoadBalancer('round-robin');

// Circuit Breaker pattern
class CircuitBreaker {
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private monitoringPeriod: number = 10000
  ) {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  private failureCount: number;
  private lastFailureTime: Date | null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
  
  private shouldAttemptReset(): boolean {
    return this.lastFailureTime && 
           (Date.now() - this.lastFailureTime.getTime()) >= this.timeout;
  }
  
  getState() {
    return this.state;
  }
}

// Service Mesh Proxy
class ServiceProxy {
  constructor() {
    this.circuitBreakers = new Map();
  }
  
  private circuitBreakers: Map<string, CircuitBreaker>;
  
  async call(serviceName: string, path: string, options: any = {}): Promise<any> {
    const instance = loadBalancer.selectInstance(serviceName);
    
    if (!instance) {
      throw new Error(`No healthy instances available for service: ${serviceName}`);
    }
    
    // Get or create circuit breaker for this service
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker());
    }
    
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    
    // Track connection
    loadBalancer.incrementConnections(instance.id);
    
    try {
      const result = await circuitBreaker.call(async () => {
        const url = `http://${instance.host}:${instance.port}${path}`;
        
        const requestOptions = {
          method: options.method || 'GET',
          headers: {
            'X-Service-Name': serviceName,
            'X-Request-ID': Crypto.generateUUID(),
            'X-Trace-ID': options.traceId || Crypto.generateUUID(),
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        };
        
        const response = await HTTP.request(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`Service ${serviceName} returned ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      });
      
      return result;
    } finally {
      loadBalancer.decrementConnections(instance.id);
    }
  }
}

const serviceProxy = new ServiceProxy();

// User Service
class UserService {
  static async start(port: number = 3001) {
    const app = new HTTP.Server();
    
    // Register with service registry
    serviceRegistry.register('user-service', {
      id: `user-service-${port}`,
      host: 'localhost',
      port,
      healthy: true
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'user-service', timestamp: new Date() });
    });
    
    // User endpoints
    app.get('/users/:id', async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        
        const user = await Database.query(User)
          .where(u => u.id === userId)
          .first();
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.post('/users', async (req, res) => {
      try {
        const { name, email } = req.body;
        
        const user = new User({ name, email, createdAt: new Date() });
        await Database.save(user);
        
        res.status(201).json({ user });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.listen(port, () => {
      console.log(`User service running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

// Order Service
class OrderService {
  static async start(port: number = 3002) {
    const app = new HTTP.Server();
    
    // Register with service registry
    serviceRegistry.register('order-service', {
      id: `order-service-${port}`,
      host: 'localhost',
      port,
      healthy: true
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'order-service', timestamp: new Date() });
    });
    
    // Order endpoints
    app.post('/orders', async (req, res) => {
      try {
        const { userId, items } = req.body;
        
        // Validate user exists via User Service
        try {
          await serviceProxy.call('user-service', `/users/${userId}`, {
            traceId: req.headers['x-trace-id']
          });
        } catch (error) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        // Calculate total (in real app, would call Product Service)
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        
        const order = new Order({
          userId,
          items,
          totalAmount,
          status: 'pending',
          createdAt: new Date()
        });
        
        await Database.save(order);
        
        res.status(201).json({ order });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.get('/orders/:id', async (req, res) => {
      try {
        const orderId = parseInt(req.params.id);
        
        const order = await Database.query(Order)
          .where(o => o.id === orderId)
          .first();
        
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ order });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.listen(port, () => {
      console.log(`Order service running on port ${port}`);
    });
  }
}

// API Gateway
class APIGateway {
  static async start(port: number = 3000) {
    const app = new HTTP.Server();
    
    // Request logging middleware
    app.use((req, res, next) => {
      const traceId = req.headers['x-trace-id'] || Crypto.generateUUID();
      req.headers['x-trace-id'] = traceId;
      
      console.log(`${new Date().toISOString()} ${req.method} ${req.path} [${traceId}]`);
      next();
    });
    
    // Authentication middleware (simplified)
    const authenticate = (req, res, next) => {
      const token = req.headers['authorization']?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No authentication token' });
      }
      
      // In real app, verify JWT token
      req.user = { id: 1, name: 'Test User' };
      next();
    };
    
    // Rate limiting middleware
    const rateLimitMap = new Map();
    const rateLimit = (limit: number = 100) => (req, res, next) => {
      const clientIP = req.ip || 'unknown';
      const now = Date.now();
      const windowStart = now - (60 * 1000); // 1 minute window
      
      if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, []);
      }
      
      const requests = rateLimitMap.get(clientIP).filter(time => time > windowStart);
      
      if (requests.length >= limit) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      
      requests.push(now);
      rateLimitMap.set(clientIP, requests);
      next();
    };
    
    // Apply rate limiting
    app.use(rateLimit(100));
    
    // Proxy to User Service
    app.get('/api/users/:id', authenticate, async (req, res) => {
      try {
        const result = await serviceProxy.call('user-service', `/users/${req.params.id}`, {
          traceId: req.headers['x-trace-id']
        });
        res.json(result);
      } catch (error) {
        res.status(502).json({ error: 'User service unavailable' });
      }
    });
    
    app.post('/api/users', authenticate, async (req, res) => {
      try {
        const result = await serviceProxy.call('user-service', '/users', {
          method: 'POST',
          body: req.body,
          traceId: req.headers['x-trace-id']
        });
        res.status(201).json(result);
      } catch (error) {
        res.status(502).json({ error: 'User service unavailable' });
      }
    });
    
    // Proxy to Order Service
    app.post('/api/orders', authenticate, async (req, res) => {
      try {
        const result = await serviceProxy.call('order-service', '/orders', {
          method: 'POST',
          body: req.body,
          traceId: req.headers['x-trace-id']
        });
        res.status(201).json(result);
      } catch (error) {
        res.status(502).json({ error: 'Order service unavailable' });
      }
    });
    
    app.get('/api/orders/:id', authenticate, async (req, res) => {
      try {
        const result = await serviceProxy.call('order-service', `/orders/${req.params.id}`, {
          traceId: req.headers['x-trace-id']
        });
        res.json(result);
      } catch (error) {
        res.status(502).json({ error: 'Order service unavailable' });
      }
    });
    
    // Service discovery endpoint
    app.get('/api/services', (req, res) => {
      const services = {};
      for (const [name, instances] of serviceRegistry.services.entries()) {
        services[name] = instances.map(inst => ({
          id: inst.id,
          host: inst.host,
          port: inst.port,
          healthy: inst.healthy,
          lastHealthCheck: inst.lastHealthCheck
        }));
      }
      res.json({ services });
    });
    
    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'api-gateway', timestamp: new Date() });
    });
    
    app.listen(port, () => {
      console.log(`API Gateway running on port ${port}`);
    });
  }
}

// Start all services
async function startMicroservices() {
  console.log('Starting microservices architecture...');
  
  // Start multiple instances of each service for load balancing
  await UserService.start(3001);
  await UserService.start(3011); // Second instance
  
  await OrderService.start(3002);
  await OrderService.start(3012); // Second instance
  
  // Start API Gateway
  await APIGateway.start(3000);
  
  console.log('All services started successfully!');
  console.log('API Gateway available at: http://localhost:3000');
  console.log('Service discovery: http://localhost:3000/api/services');
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down services...');
  // In real app, would properly shutdown all services
  process.exit(0);
});

export { startMicroservices, ServiceRegistry, LoadBalancer, CircuitBreaker, ServiceProxy };

// Auto-start if this is the main module
if (import.meta.main) {
  startMicroservices();
}