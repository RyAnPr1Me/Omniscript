// Modern Microservices Architecture Example
// Demonstrates: Service discovery, Load balancing, Circuit breakers, Health checks, Type Safety

use { HTTP, Database, Crypto, ServiceMesh, DateTime, Console, UUID, Runtime } from 'stdlib';

// Type definitions for better type safety
type ServiceInstance = {
  id :: string,
  serviceName :: string,
  host :: string,
  port :: number,
  healthy :: boolean,
  metadata :: any,
  lastHealthCheck :: DateTime,
  version :: string
};

type ServiceCall = {
  method :: string,
  path :: string,
  body :: any,
  headers :: any,
  timeout :: number,
  retries :: number
};

type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

type HealthStatus = {
  status :: string,
  service :: string,
  timestamp :: DateTime,
  uptime :: number,
  dependencies :: any[]
};

// Enhanced Service Registry with type safety
object ServiceRegistry {
  def services :: Map<string, ServiceInstance[]>;
  def healthChecks :: Map<string, any>;
  def eventListeners :: Map<string, Function[]>;
  
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
    this.eventListeners = new Map();
  }
  
  def register :: (serviceName :: string, instance :: ServiceInstance) -> Either<string, boolean> = 
    (serviceName, instance) => {
      match this.validateInstance(instance) {
        case left(error) => left(error)
        case right(_) => {
          match this.services.has(serviceName) {
            case false => this.services.set(serviceName, [])
            case true => {}
          }
          
          def instances :: ServiceInstance[] = this.services.get(serviceName);
          instances.push(instance);
          this.services.set(serviceName, instances);
          
          this.startHealthCheck(serviceName, instance);
          this.emit('service-registered', { serviceName, instance });
          
          Console.log(`✅ Service ${serviceName} registered: ${instance.host}:${instance.port}`);
          return right(true);
        }
      }
    };
  
  def unregister :: (serviceName :: string, instanceId :: string) -> boolean = 
    (serviceName, instanceId) => {
      def instances :: ServiceInstance[] = this.services.get(serviceName) || [];
      def filtered :: ServiceInstance[] = instances.filter((inst) => inst.id !== instanceId);
      this.services.set(serviceName, filtered);
      
      match this.healthChecks.has(instanceId) {
        case true => {
          clearInterval(this.healthChecks.get(instanceId));
          this.healthChecks.delete(instanceId);
        }
        case false => {}
      }
      
      this.emit('service-unregistered', { serviceName, instanceId });
      Console.log(`❌ Service ${serviceName} unregistered: ${instanceId}`);
      return true;
    };
  
  def getInstances :: (serviceName :: string) -> ServiceInstance[] = (serviceName) => {
    return this.services.get(serviceName) || [];
  };
  
  def getHealthyInstances :: (serviceName :: string) -> ServiceInstance[] = (serviceName) => {
    return this.getInstances(serviceName) |> filter((inst) => inst.healthy);
  };
  
  def validateInstance :: (instance :: ServiceInstance) -> Either<string, boolean> = (instance) => {
    match {
      case !instance.id => left("Instance ID is required")
      case !instance.host => left("Host is required")
      case instance.port <= 0 => left("Valid port is required")
      case !instance.serviceName => left("Service name is required")
      case _ => right(true)
    }
  };
  
  def startHealthCheck :: (serviceName :: string, instance :: ServiceInstance) -> void = 
    (serviceName, instance) => {
      def interval :: any = setInterval(async () => {
        try {
          def response :: any = await HTTP.get(`http://${instance.host}:${instance.port}/health`, {
            timeout: 5000
          });
          
          instance.healthy = response.status === 200;
          instance.lastHealthCheck = DateTime.now();
          
          match instance.healthy {
            case false => {
              Console.warn(`❌ Health check failed for ${serviceName}:${instance.id}`);
              this.emit('health-check-failed', { serviceName, instance });
            }
            case true => {
              this.emit('health-check-passed', { serviceName, instance });
            }
          }
        } catch (error :: Error) {
          instance.healthy = false;
          instance.lastHealthCheck = DateTime.now();
          Console.error(`💥 Health check error for ${serviceName}:${instance.id}:`, error.message);
          this.emit('health-check-error', { serviceName, instance, error });
        }
      }, 30000); // 30 seconds
      
      this.healthChecks.set(instance.id, interval);
    };
  
  def on :: (event :: string, callback :: Function) -> void = (event, callback) => {
    match this.eventListeners.has(event) {
      case false => this.eventListeners.set(event, [])
      case true => {}
    }
    this.eventListeners.get(event).push(callback);
  };
  
  def emit :: (event :: string, data :: any) -> void = (event, data) => {
    def listeners :: Function[] = this.eventListeners.get(event) || [];
    listeners.forEach((callback) => callback(data));
  };
}

// Enhanced Load Balancer with multiple strategies
object LoadBalancer {
  def strategies :: Map<string, Function>;
  
  constructor() {
    this.strategies = new Map();
    this.setupStrategies();
  }
  
  def setupStrategies :: () -> void = () => {
    this.strategies.set("round-robin", this.roundRobin);
    this.strategies.set("random", this.random);
    this.strategies.set("least-connections", this.leastConnections);
    this.strategies.set("weighted", this.weighted);
  };
  
  def selectInstance :: (instances :: ServiceInstance[], strategy :: string) -> ServiceInstance | null = 
    (instances, strategy) => {
      match instances.length {
        case 0 => null
        case _ => {
          def strategyFn :: Function = this.strategies.get(strategy) || this.strategies.get("round-robin");
          return strategyFn(instances);
        }
      }
    };
  
  def roundRobin :: (instances :: ServiceInstance[]) -> ServiceInstance = (instances) => {
    // Simplified round-robin (would need persistent counter in real implementation)
    def index :: number = Math.floor(Math.random() * instances.length);
    return instances[index];
  };
  
  def random :: (instances :: ServiceInstance[]) -> ServiceInstance = (instances) => {
    def index :: number = Math.floor(Math.random() * instances.length);
    return instances[index];
  };
  
  def leastConnections :: (instances :: ServiceInstance[]) -> ServiceInstance = (instances) => {
    // Simplified - would track actual connections in real implementation
    return instances |> sortBy((inst) => inst.metadata.connections || 0) |> head;
  };
  
  def weighted :: (instances :: ServiceInstance[]) -> ServiceInstance = (instances) => {
    def totalWeight :: number = instances |> map((inst) => inst.metadata.weight || 1) |> reduce(0, (a, b) => a + b);
    def random :: number = Math.random() * totalWeight;
    def weightSum :: number = 0;
    
    for (def instance of instances) {
      weightSum += instance.metadata.weight || 1;
      match weightSum >= random {
        case true => return instance
        case false => {}
      }
    }
    
    return instances[0]; // Fallback
  };
}

// Circuit Breaker pattern implementation
object CircuitBreaker {
  def serviceName :: string;
  def state :: CircuitBreakerState;
  def failureCount :: number;
  def successCount :: number;
  def lastFailureTime :: DateTime;
  def threshold :: number;
  def timeout :: number;
  def halfOpenMaxCalls :: number;
  
  constructor(serviceName :: string, threshold :: number = 5, timeout :: number = 60000) {
    this.serviceName = serviceName;
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.halfOpenMaxCalls = 3;
  }
  
  def call :: <T>(fn :: () -> Promise<T>) -> Promise<T> = async (fn) => {
    match this.canExecute() {
      case false => throw new Error(`Circuit breaker is OPEN for ${this.serviceName}`)
      case true => {
        try {
          def result :: T = await fn();
          this.onSuccess();
          return result;
        } catch (error :: Error) {
          this.onFailure();
          throw error;
        }
      }
    }
  };
  
  def canExecute :: () -> boolean = () => {
    match this.state {
      case "CLOSED" => true
      case "OPEN" => {
        def now :: DateTime = DateTime.now();
        def timeSinceLastFailure :: number = now.getTime() - this.lastFailureTime.getTime();
        
        match timeSinceLastFailure >= this.timeout {
          case true => {
            this.state = "HALF_OPEN";
            this.successCount = 0;
            Console.log(`🔄 Circuit breaker for ${this.serviceName} moved to HALF_OPEN`);
            return true;
          }
          case false => false
        }
      }
      case "HALF_OPEN" => this.successCount < this.halfOpenMaxCalls
    }
  };
  
  def onSuccess :: () -> void = () => {
    this.failureCount = 0;
    
    match this.state {
      case "HALF_OPEN" => {
        this.successCount++;
        match this.successCount >= this.halfOpenMaxCalls {
          case true => {
            this.state = "CLOSED";
            Console.log(`✅ Circuit breaker for ${this.serviceName} moved to CLOSED`);
          }
          case false => {}
        }
      }
      case _ => {}
    }
  };
  
  def onFailure :: () -> void = () => {
    this.failureCount++;
    this.lastFailureTime = DateTime.now();
    
    match this.state {
      case "CLOSED" => {
        match this.failureCount >= this.threshold {
          case true => {
            this.state = "OPEN";
            Console.log(`🚨 Circuit breaker for ${this.serviceName} moved to OPEN`);
          }
          case false => {}
        }
      }
      case "HALF_OPEN" => {
        this.state = "OPEN";
        Console.log(`🚨 Circuit breaker for ${this.serviceName} moved back to OPEN`);
      }
      case _ => {}
    }
  };
  
  def getStats :: () -> any = () => ({
    serviceName: this.serviceName,
    state: this.state,
    failureCount: this.failureCount,
    successCount: this.successCount,
    lastFailureTime: this.lastFailureTime
  });
}

// Enhanced Service Proxy with circuit breakers and retries
object ServiceProxy {
  def serviceRegistry :: ServiceRegistry;
  def loadBalancer :: LoadBalancer;
  def circuitBreakers :: Map<string, CircuitBreaker>;
  def defaultTimeout :: number;
  def defaultRetries :: number;
  
  constructor(serviceRegistry :: ServiceRegistry, loadBalancer :: LoadBalancer) {
    this.serviceRegistry = serviceRegistry;
    this.loadBalancer = loadBalancer;
    this.circuitBreakers = new Map();
    this.defaultTimeout = 30000;
    this.defaultRetries = 3;
  }
  
  def call :: (serviceName :: string, path :: string, options :: any) -> Promise<any> = 
    async (serviceName, path, options) => {
      def circuitBreaker :: CircuitBreaker = this.getCircuitBreaker(serviceName);
      
      return circuitBreaker.call(async () => {
        def instances :: ServiceInstance[] = this.serviceRegistry.getHealthyInstances(serviceName);
        
        match instances.length {
          case 0 => throw new Error(`No healthy instances available for service: ${serviceName}`)
          case _ => {
            def instance :: ServiceInstance = this.loadBalancer.selectInstance(instances, "round-robin");
            return this.makeRequest(instance, path, options);
          }
        }
      });
    };
  
  def getCircuitBreaker :: (serviceName :: string) -> CircuitBreaker = (serviceName) => {
    match this.circuitBreakers.has(serviceName) {
      case false => {
        def circuitBreaker :: CircuitBreaker = new CircuitBreaker(serviceName);
        this.circuitBreakers.set(serviceName, circuitBreaker);
        return circuitBreaker;
      }
      case true => this.circuitBreakers.get(serviceName)
    }
  };
  
  def makeRequest :: (instance :: ServiceInstance, path :: string, options :: any) -> Promise<any> = 
    async (instance, path, options) => {
      def url :: string = `http://${instance.host}:${instance.port}${path}`;
      def requestOptions :: any = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-ID': options.traceId || UUID.generate(),
          'X-Service-Version': instance.version,
          ...options.headers
        },
        timeout: options.timeout || this.defaultTimeout,
        body: options.body ? JSON.stringify(options.body) : undefined
      };
      
      def retries :: number = options.retries || this.defaultRetries;
      
      for (def attempt of range(retries + 1)) {
        try {
          def response :: any = await HTTP.request(url, requestOptions);
          
          match response.status >= 200 && response.status < 300 {
            case true => return response.data
            case false => throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (error :: Error) {
          Console.warn(`🔄 Request attempt ${attempt + 1} failed for ${url}: ${error.message}`);
          
          match attempt === retries {
            case true => throw error
            case false => {
              def delay :: number = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff
              await this.sleep(delay);
            }
          }
        }
      }
    };
  
  def sleep :: (ms :: number) -> Promise<void> = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  
  def getCircuitBreakerStats :: () -> any[] = () => {
    return Array.from(this.circuitBreakers.values()) |> map((cb) => cb.getStats());
  };
}

// User Service implementation
def createUserService :: (port :: number) -> HTTP.Server = (port) => {
  def app :: HTTP.Server = HTTP.createServer();
  
  // Sample data
  def users :: any[] = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", role: "user" }
  ];
  
  app.use(HTTP.middleware.json());
  
  app.get("/users/:id", (req :: HTTP.Request, res :: HTTP.Response) => {
    def userId :: number = parseInt(req.params.id);
    def user :: any = users.find((u) => u.id === userId);
    
    match user {
      case undefined => res.status(404).json({ error: "User not found" })
      case user => res.json({ user })
    }
  });
  
  app.post("/users", (req :: HTTP.Request, res :: HTTP.Response) => {
    def userData :: any = req.body;
    def newUser :: any = {
      id: users.length + 1,
      name: userData.name,
      email: userData.email,
      role: userData.role || "user"
    };
    
    users.push(newUser);
    res.status(201).json({ user: newUser });
  });
  
  app.get("/health", (req :: HTTP.Request, res :: HTTP.Response) => {
    def healthStatus :: HealthStatus = {
      status: "healthy",
      service: "user-service",
      timestamp: DateTime.now(),
      uptime: process.uptime(),
      dependencies: [
        { name: "database", status: "healthy" },
        { name: "cache", status: "healthy" }
      ]
    };
    res.json(healthStatus);
  });
  
  app.listen(port, () => {
    Console.log(`👤 User Service running on port ${port}`);
  });
  
  return app;
};

// Order Service implementation
def createOrderService :: (port :: number) -> HTTP.Server = (port) => {
  def app :: HTTP.Server = HTTP.createServer();
  
  def orders :: any[] = [
    { id: 1, userId: 1, items: ["Product A", "Product B"], total: 99.99, status: "shipped" },
    { id: 2, userId: 2, items: ["Product C"], total: 49.99, status: "pending" }
  ];
  
  app.use(HTTP.middleware.json());
  
  app.get("/orders/:id", (req :: HTTP.Request, res :: HTTP.Response) => {
    def orderId :: number = parseInt(req.params.id);
    def order :: any = orders.find((o) => o.id === orderId);
    
    match order {
      case undefined => res.status(404).json({ error: "Order not found" })
      case order => res.json({ order })
    }
  });
  
  app.post("/orders", (req :: HTTP.Request, res :: HTTP.Response) => {
    def orderData :: any = req.body;
    def newOrder :: any = {
      id: orders.length + 1,
      userId: orderData.userId,
      items: orderData.items || [],
      total: orderData.total || 0,
      status: "pending",
      createdAt: DateTime.now()
    };
    
    orders.push(newOrder);
    res.status(201).json({ order: newOrder });
  });
  
  app.get("/health", (req :: HTTP.Request, res :: HTTP.Response) => {
    def healthStatus :: HealthStatus = {
      status: "healthy",
      service: "order-service", 
      timestamp: DateTime.now(),
      uptime: process.uptime(),
      dependencies: [
        { name: "database", status: "healthy" },
        { name: "payment-service", status: "healthy" }
      ]
    };
    res.json(healthStatus);
  });
  
  app.listen(port, () => {
    Console.log(`📦 Order Service running on port ${port}`);
  });
  
  return app;
};

// API Gateway implementation
def createAPIGateway :: (port :: number, serviceRegistry :: ServiceRegistry, serviceProxy :: ServiceProxy) -> HTTP.Server = 
  (port, serviceRegistry, serviceProxy) => {
    def app :: HTTP.Server = HTTP.createServer();
    
    app.use(HTTP.middleware.json());
    app.use(HTTP.middleware.cors());
    
    // Enhanced authentication middleware
    def authenticate :: (req :: HTTP.Request, res :: HTTP.Response, next :: Function) -> void = 
      (req, res, next) => {
        def authHeader :: string = req.headers['authorization'];
        
        match authHeader {
          case undefined => {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
          }
          case header => {
            def token :: string = header.replace('Bearer ', '');
            
            match token === 'valid-token' {
              case false => {
                res.status(401).json({ error: 'Invalid token' });
                return;
              }
              case true => {
                req.user = { id: 1, name: 'Test User', role: 'admin' };
                next();
              }
            }
          }
        }
      };
    
    // Enhanced rate limiting with user-based limits
    def rateLimitMap :: Map<string, number[]> = new Map();
    def rateLimit :: (limit :: number) -> Function = (limit = 100) => 
      (req :: HTTP.Request, res :: HTTP.Response, next :: Function) => {
        def clientIP :: string = req.ip || 'unknown';
        def now :: number = DateTime.now().getTime();
        def windowStart :: number = now - (60 * 1000); // 1 minute window
        
        match rateLimitMap.has(clientIP) {
          case false => rateLimitMap.set(clientIP, [])
          case true => {}
        }
        
        def requests :: number[] = rateLimitMap.get(clientIP).filter((time) => time > windowStart);
        
        match requests.length >= limit {
          case true => {
            res.status(429).json({ 
              error: 'Rate limit exceeded',
              resetTime: new Date(windowStart + 60000).toISOString()
            });
            return;
          }
          case false => {
            requests.push(now);
            rateLimitMap.set(clientIP, requests);
            next();
          }
        }
      };
    
    app.use(rateLimit(100));
    
    // Request tracing middleware
    def tracing :: (req :: HTTP.Request, res :: HTTP.Response, next :: Function) -> void = 
      (req, res, next) => {
        req.traceId = req.headers['x-trace-id'] || UUID.generate();
        res.setHeader('X-Trace-ID', req.traceId);
        Console.log(`🔍 ${req.method} ${req.path} [${req.traceId}]`);
        next();
      };
    
    app.use(tracing);
    
    // Proxy routes to User Service
    app.get('/api/users/:id', authenticate, async (req :: HTTP.Request, res :: HTTP.Response) => {
      try {
        def result :: any = await serviceProxy.call('user-service', `/users/${req.params.id}`, {
          traceId: req.traceId
        });
        res.json(result);
      } catch (error :: Error) {
        Console.error(`❌ User service error [${req.traceId}]:`, error.message);
        res.status(502).json({ 
          error: 'User service unavailable',
          traceId: req.traceId
        });
      }
    });
    
    app.post('/api/users', authenticate, async (req :: HTTP.Request, res :: HTTP.Response) => {
      try {
        def result :: any = await serviceProxy.call('user-service', '/users', {
          method: 'POST',
          body: req.body,
          traceId: req.traceId
        });
        res.status(201).json(result);
      } catch (error :: Error) {
        Console.error(`❌ User service error [${req.traceId}]:`, error.message);
        res.status(502).json({ 
          error: 'User service unavailable',
          traceId: req.traceId
        });
      }
    });
    
    // Proxy routes to Order Service
    app.post('/api/orders', authenticate, async (req :: HTTP.Request, res :: HTTP.Response) => {
      try {
        def result :: any = await serviceProxy.call('order-service', '/orders', {
          method: 'POST',
          body: req.body,
          traceId: req.traceId
        });
        res.status(201).json(result);
      } catch (error :: Error) {
        Console.error(`❌ Order service error [${req.traceId}]:`, error.message);
        res.status(502).json({ 
          error: 'Order service unavailable',
          traceId: req.traceId
        });
      }
    });
    
    app.get('/api/orders/:id', authenticate, async (req :: HTTP.Request, res :: HTTP.Response) => {
      try {
        def result :: any = await serviceProxy.call('order-service', `/orders/${req.params.id}`, {
          traceId: req.traceId
        });
        res.json(result);
      } catch (error :: Error) {
        Console.error(`❌ Order service error [${req.traceId}]:`, error.message);
        res.status(502).json({ 
          error: 'Order service unavailable',
          traceId: req.traceId
        });
      }
    });
    
    // Service discovery endpoint
    app.get('/api/services', (req :: HTTP.Request, res :: HTTP.Response) => {
      def services :: any = {};
      
      serviceRegistry.services.forEach((instances, name) => {
        services[name] = instances |> map((inst) => ({
          id: inst.id,
          host: inst.host,
          port: inst.port,
          healthy: inst.healthy,
          lastHealthCheck: inst.lastHealthCheck,
          version: inst.version
        }));
      });
      
      res.json({ services });
    });
    
    // Circuit breaker status endpoint
    app.get('/api/circuit-breakers', (req :: HTTP.Request, res :: HTTP.Response) => {
      def stats :: any[] = serviceProxy.getCircuitBreakerStats();
      res.json({ circuitBreakers: stats });
    });
    
    // Health check endpoint
    app.get('/health', (req :: HTTP.Request, res :: HTTP.Response) => {
      def healthStatus :: HealthStatus = {
        status: 'healthy',
        service: 'api-gateway',
        timestamp: DateTime.now(),
        uptime: process.uptime(),
        dependencies: []
      };
      res.json(healthStatus);
    });
    
    app.listen(port, () => {
      Console.log(`🌐 API Gateway running on port ${port}`);
    });
    
    return app;
  };

// Initialize and start all services
def main :: () -> void = () => {
  Console.log('🚀 Starting Modern Microservices Architecture...');
  
  // Create service registry and load balancer
  def serviceRegistry :: ServiceRegistry = new ServiceRegistry();
  def loadBalancer :: LoadBalancer = new LoadBalancer();
  def serviceProxy :: ServiceProxy = new ServiceProxy(serviceRegistry, loadBalancer);
  
  // Set up event listeners
  serviceRegistry.on('service-registered', (data) => {
    Console.log(`📡 Service registered: ${data.serviceName}`);
  });
  
  serviceRegistry.on('health-check-failed', (data) => {
    Console.warn(`💔 Health check failed: ${data.serviceName}:${data.instance.id}`);
  });
  
  // Start services
  createUserService(3001);
  createUserService(3002); // Second instance for load balancing
  createOrderService(3003);
  createOrderService(3004); // Second instance for load balancing
  
  // Register service instances
  def userInstances :: ServiceInstance[] = [
    {
      id: UUID.generate(),
      serviceName: 'user-service',
      host: 'localhost',
      port: 3001,
      healthy: true,
      metadata: { weight: 1, connections: 0 },
      lastHealthCheck: DateTime.now(),
      version: '1.0.0'
    },
    {
      id: UUID.generate(),
      serviceName: 'user-service', 
      host: 'localhost',
      port: 3002,
      healthy: true,
      metadata: { weight: 1, connections: 0 },
      lastHealthCheck: DateTime.now(),
      version: '1.0.0'
    }
  ];
  
  def orderInstances :: ServiceInstance[] = [
    {
      id: UUID.generate(),
      serviceName: 'order-service',
      host: 'localhost',
      port: 3003,
      healthy: true,
      metadata: { weight: 1, connections: 0 },
      lastHealthCheck: DateTime.now(),
      version: '1.0.0'
    },
    {
      id: UUID.generate(),
      serviceName: 'order-service',
      host: 'localhost',
      port: 3004,
      healthy: true,
      metadata: { weight: 1, connections: 0 },
      lastHealthCheck: DateTime.now(),
      version: '1.0.0'
    }
  ];
  
  // Register all instances
  userInstances.forEach((instance) => {
    serviceRegistry.register('user-service', instance);
  });
  
  orderInstances.forEach((instance) => {
    serviceRegistry.register('order-service', instance);
  });
  
  // Start API Gateway
  createAPIGateway(3000, serviceRegistry, serviceProxy);
  
  Console.log('✅ All services started successfully!');
  Console.log('📋 Available endpoints:');
  Console.log('  🌐 API Gateway: http://localhost:3000');
  Console.log('  👤 User Service: http://localhost:3001, http://localhost:3002');
  Console.log('  📦 Order Service: http://localhost:3003, http://localhost:3004');
  Console.log('');
  Console.log('🔗 API Gateway endpoints:');
  Console.log('  GET    /api/users/:id');
  Console.log('  POST   /api/users');
  Console.log('  GET    /api/orders/:id');
  Console.log('  POST   /api/orders');
  Console.log('  GET    /api/services');
  Console.log('  GET    /api/circuit-breakers');
  Console.log('  GET    /health');
  Console.log('');
  Console.log('🔑 Authentication: Use "Bearer valid-token" in Authorization header');
};

// Graceful shutdown
process.on('SIGTERM', () => {
  Console.log('🛑 Shutting down microservices...');
  process.exit(0);
});

// Start the application
main();

// Export main functionality
export { ServiceRegistry, LoadBalancer, CircuitBreaker, ServiceProxy, createAPIGateway, main };

// Example usage:
// Run this file to start the microservices architecture demo
// The API gateway will be available at http://localhost:3000
// Health checks can be monitored at http://localhost:3000/health