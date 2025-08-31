# Omniscript Examples

This directory contains comprehensive examples demonstrating Omniscript's production-ready capabilities across various domains.

## Basic Examples

### 1. Hello World (`hello.os`)
A simple introduction showing:
- Basic syntax and functions
- HTTP server creation
- Class definitions with operator overloading
- Vector mathematics

### 2. Functional Programming (`functional.os`)
Demonstrates functional programming concepts:
- Immutable let bindings
- Lambda functions and higher-order functions
- Function composition and reduction

### 3. REST API (`rest-api.os`)
Basic REST API example with:
- Database integration
- Type-safe ORM queries
- HTTP endpoint definitions

## Advanced Production Examples

### 4. E-commerce Application (`ecommerce-app.os`)
A complete e-commerce backend featuring:
- **Authentication & Authorization**: JWT-based user authentication
- **Database ORM**: Type-safe queries with relationships
- **Error Handling**: Comprehensive error handling with custom error types
- **Validation**: Input validation and business rule enforcement
- **Security**: Password hashing and secure token management

**Key Features:**
- User registration and login
- Product catalog management
- Order processing with inventory management
- RESTful API design
- Middleware for authentication and error handling

### 5. Real-time Chat Application (`chat-app.os`)
Advanced real-time messaging system using:
- **Actor Model**: Concurrent state management with actors
- **WebSocket Communication**: Real-time bidirectional messaging
- **State Management**: Room-based chat with user presence
- **Broadcasting**: Efficient message distribution
- **Typing Indicators**: Real-time typing status

**Key Features:**
- Multi-room chat support
- User presence tracking
- Message persistence
- Real-time typing indicators
- Connection management

### 6. Microservices Architecture (`microservices.os`)
Enterprise-grade microservices implementation with:
- **Service Discovery**: Automatic service registration and discovery
- **Load Balancing**: Multiple load balancing strategies (round-robin, least-connections, random)
- **Circuit Breakers**: Fault tolerance and cascading failure prevention
- **Health Checks**: Automated service health monitoring
- **API Gateway**: Central request routing and authentication

**Key Features:**
- Service registry with health monitoring
- Circuit breaker pattern implementation
- Request tracing and monitoring
- Rate limiting
- Service mesh proxy

### 7. Data Processing Pipeline (`data-pipeline.os`)
High-performance data processing system featuring:
- **Functional Programming**: Composition and pipeline operations
- **Stream Processing**: Real-time and batch data processing
- **Error Handling**: Resilient processing with error thresholds
- **Performance Optimization**: Concurrent processing and batching
- **Analytics**: Advanced data analysis and insights generation

**Key Features:**
- CSV data processing with validation
- Feature engineering and data transformation
- Session aggregation and metrics calculation
- Real-time stream processing
- Comprehensive analytics and reporting

### 8. Machine Learning Inference Service (`ml-inference.os`)
Production ML service with:
- **Model Serving**: Multiple model types (Linear, Decision Trees)
- **Feature Engineering**: Automated feature computation and caching
- **Caching**: Intelligent prediction and feature caching
- **Batch Processing**: Efficient batch prediction capabilities
- **Monitoring**: Performance metrics and model health tracking

**Key Features:**
- Model registry for version management
- Feature store with caching
- Multiple prediction models (churn, propensity, recommendations)
- Batch and real-time inference
- Performance monitoring and metrics

## Running the Examples

### Prerequisites
1. Build Omniscript: `npm run build`
2. Link CLI globally: `npm link`

### Basic Examples
```bash
# Run basic examples
omni run examples/hello.os
omni run examples/functional.os
omni run examples/rest-api.os
```

### Advanced Examples
```bash
# E-commerce API
omni run examples/ecommerce-app.os
# Server will start on http://localhost:3000

# Chat application  
omni run examples/chat-app.os
# HTTP API: http://localhost:3000
# WebSocket: ws://localhost:8080

# Microservices
omni run examples/microservices.os
# API Gateway: http://localhost:3000
# Service discovery: http://localhost:3000/api/services

# Data pipeline (requires CSV file)
omni run examples/data-pipeline.os sample-data.csv output.json

# ML inference service
omni run examples/ml-inference.os
# API available at http://localhost:3000
```

## Example API Usage

### E-commerce API
```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'

# Create order
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"productId": 1, "quantity": 2}]}'
```

### Chat Application WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8080');

// Authenticate
ws.send(JSON.stringify({
  type: 'AUTH',
  userId: 1
}));

// Join room
ws.send(JSON.stringify({
  type: 'JOIN_ROOM',
  roomId: 1
}));

// Send message
ws.send(JSON.stringify({
  type: 'SEND_MESSAGE',
  roomId: 1,
  content: 'Hello, world!',
  messageType: 'text'
}));
```

### ML Inference API
```bash
# Single prediction
curl -X POST http://localhost:3000/predict/churn_prediction \
  -H "Content-Type: application/json" \
  -d '{"userId": 123, "lastOrderDate": "2023-01-15", "isPremium": true}'

# Batch predictions
curl -X POST http://localhost:3000/predict/purchase_propensity/batch \
  -H "Content-Type: application/json" \
  -d '{"inputs": [{"pageViews": 5, "timeOnSite": 300, "cartValue": 99.99}]}'

# Get model info
curl http://localhost:3000/models/churn_prediction
```

## Production Deployment

### Docker Support
Each example includes production configuration. See `docker/` directory for:
- Dockerfile templates
- Docker Compose configurations
- Environment configuration examples

### Configuration
Production examples support environment-based configuration:
- `NODE_ENV=production` for production mode
- Database connection strings
- JWT secrets and encryption keys
- Service discovery endpoints

### Monitoring
Examples include:
- Health check endpoints (`/health`)
- Metrics endpoints (`/metrics`)
- Request tracing and logging
- Performance monitoring

### Security
Production examples implement:
- JWT authentication
- Rate limiting
- Input validation
- Error handling without information leakage
- CORS configuration

## Development

### Adding New Examples
1. Create new `.os` file in `examples/` directory
2. Follow the established patterns for:
   - Error handling
   - Configuration management
   - Logging and monitoring
   - Documentation

### Testing Examples
```bash
# Run example tests
npm test -- --testPathPattern=examples

# Test specific example
omni test examples/ecommerce-app.os
```

## Learn More

- [Language Guide](../docs/guide.md)
- [API Reference](../docs/api/README.md)
- [Best Practices](../docs/best-practices.md)
- [Production Deployment](../docs/deployment.md)