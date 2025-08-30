// Machine Learning Inference Service
// Demonstrates: Model serving, Feature engineering, Async processing, Performance optimization

import { HTTP, Database, Crypto, FileSystem, Math as OMath } from 'stdlib';

// Feature engineering utilities
class FeatureEngineer {
  static normalize(values: number[]): number[] {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return values.map(val => (val - mean) / stdDev);
  }
  
  static oneHotEncode(categories: string[], allCategories: string[]): number[] {
    return allCategories.map(cat => categories.includes(cat) ? 1 : 0);
  }
  
  static binNumeric(value: number, bins: number[]): number {
    for (let i = 0; i < bins.length - 1; i++) {
      if (value >= bins[i] && value < bins[i + 1]) {
        return i;
      }
    }
    return bins.length - 1;
  }
  
  static extractTextFeatures(text: string): any {
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    const sentenceCount = text.split(/[.!?]+/).length - 1;
    
    // Sentiment indicators (simplified)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst'];
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    return {
      wordCount,
      avgWordLength,
      sentenceCount,
      positiveCount,
      negativeCount,
      sentimentScore: (positiveCount - negativeCount) / wordCount
    };
  }
  
  static createTimeFeatures(timestamp: Date): any {
    return {
      hour: timestamp.getHours(),
      dayOfWeek: timestamp.getDay(),
      dayOfMonth: timestamp.getDate(),
      month: timestamp.getMonth(),
      quarter: Math.floor(timestamp.getMonth() / 3),
      isWeekend: timestamp.getDay() === 0 || timestamp.getDay() === 6,
      isBusinessHour: timestamp.getHours() >= 9 && timestamp.getHours() <= 17
    };
  }
}

// Simple linear model implementation
class LinearModel {
  constructor(weights: number[], bias: number = 0) {
    this.weights = weights;
    this.bias = bias;
  }
  
  private weights: number[];
  private bias: number;
  
  predict(features: number[]): number {
    if (features.length !== this.weights.length) {
      throw new Error(`Feature dimension mismatch. Expected ${this.weights.length}, got ${features.length}`);
    }
    
    const dotProduct = features.reduce((sum, feature, i) => sum + feature * this.weights[i], 0);
    return dotProduct + this.bias;
  }
  
  predictProba(features: number[]): number {
    const logits = this.predict(features);
    return 1 / (1 + Math.exp(-logits)); // Sigmoid function
  }
}

// Decision tree node
interface TreeNode {
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number;
  isLeaf: boolean;
}

class DecisionTree {
  constructor(tree: TreeNode) {
    this.root = tree;
  }
  
  private root: TreeNode;
  
  predict(features: number[]): number {
    let node = this.root;
    
    while (!node.isLeaf) {
      if (features[node.feature!] <= node.threshold!) {
        node = node.left!;
      } else {
        node = node.right!;
      }
    }
    
    return node.prediction!;
  }
}

// Model registry for managing multiple models
class ModelRegistry {
  constructor() {
    this.models = new Map();
    this.modelMetadata = new Map();
  }
  
  private models: Map<string, any>;
  private modelMetadata: Map<string, any>;
  
  register(name: string, model: any, metadata: any = {}) {
    this.models.set(name, model);
    this.modelMetadata.set(name, {
      ...metadata,
      registeredAt: new Date(),
      version: metadata.version || '1.0.0'
    });
    
    console.log(`Model '${name}' registered successfully`);
  }
  
  get(name: string): any {
    return this.models.get(name);
  }
  
  getMetadata(name: string): any {
    return this.modelMetadata.get(name);
  }
  
  list(): string[] {
    return Array.from(this.models.keys());
  }
  
  async loadFromFile(name: string, filePath: string): Promise<void> {
    try {
      const modelData = JSON.parse(await FileSystem.readFile(filePath));
      
      match modelData.type {
        'linear' => {
          const model = new LinearModel(modelData.weights, modelData.bias);
          this.register(name, model, modelData.metadata);
        },
        
        'tree' => {
          const model = new DecisionTree(modelData.tree);
          this.register(name, model, modelData.metadata);
        },
        
        _ => {
          throw new Error(`Unsupported model type: ${modelData.type}`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to load model from ${filePath}: ${error.message}`);
    }
  }
}

// Feature store for caching and serving features
class FeatureStore {
  constructor() {
    this.features = new Map();
    this.cache = new Map();
    this.cacheTtl = 300000; // 5 minutes
  }
  
  private features: Map<string, any>;
  private cache: Map<string, any>;
  private cacheTtl: number;
  
  async getFeatures(entityId: string, featureNames: string[]): Promise<any> {
    const cacheKey = `${entityId}:${featureNames.join(',')}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTtl) {
        return cached.features;
      }
    }
    
    // Compute features
    const features = {};
    
    for (const featureName of featureNames) {
      const featureConfig = this.features.get(featureName);
      if (featureConfig) {
        features[featureName] = await this.computeFeature(entityId, featureConfig);
      }
    }
    
    // Cache results
    this.cache.set(cacheKey, {
      features,
      timestamp: Date.now()
    });
    
    return features;
  }
  
  registerFeature(name: string, config: any) {
    this.features.set(name, config);
  }
  
  private async computeFeature(entityId: string, config: any): Promise<any> {
    match config.type {
      'user_stats' => {
        // Fetch user statistics from database
        const stats = await Database.query()
          .raw(`
            SELECT 
              COUNT(*) as total_orders,
              AVG(order_amount) as avg_order_amount,
              MAX(order_date) as last_order_date
            FROM orders 
            WHERE user_id = ?
          `, [entityId]);
        
        return stats[0];
      },
      
      'session_behavior' => {
        // Get recent session behavior
        const sessions = await Database.query()
          .raw(`
            SELECT 
              AVG(session_duration) as avg_session_duration,
              COUNT(*) as session_count,
              AVG(page_views) as avg_page_views
            FROM user_sessions 
            WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
          `, [entityId]);
        
        return sessions[0];
      },
      
      'demographic' => {
        // Get user demographic information
        const user = await Database.query(User)
          .where(u => u.id === parseInt(entityId))
          .first();
        
        return {
          age: user?.age || 0,
          gender: user?.gender || 'unknown',
          location: user?.location || 'unknown'
        };
      },
      
      _ => null
    }
  }
}

// Prediction service with caching and monitoring
class PredictionService {
  constructor() {
    this.modelRegistry = new ModelRegistry();
    this.featureStore = new FeatureStore();
    this.predictionCache = new Map();
    this.metrics = {
      totalPredictions: 0,
      cacheHits: 0,
      averageLatency: 0,
      errorCount: 0
    };
    
    this.setupFeatures();
    this.loadModels();
  }
  
  private modelRegistry: ModelRegistry;
  private featureStore: FeatureStore;
  private predictionCache: Map<string, any>;
  private metrics: any;
  
  private setupFeatures() {
    this.featureStore.registerFeature('user_stats', { type: 'user_stats' });
    this.featureStore.registerFeature('session_behavior', { type: 'session_behavior' });
    this.featureStore.registerFeature('demographic', { type: 'demographic' });
  }
  
  private async loadModels() {
    // Register sample models (in production, these would be loaded from files)
    
    // Churn prediction model
    const churnModel = new LinearModel(
      [0.5, -0.3, 0.8, -0.2, 0.4, -0.6, 0.1],
      -0.5
    );
    this.modelRegistry.register('churn_prediction', churnModel, {
      description: 'Predicts user churn probability',
      features: ['total_orders', 'avg_order_amount', 'days_since_last_order', 'avg_session_duration', 'session_count', 'age', 'is_premium'],
      version: '2.1.0'
    });
    
    // Purchase propensity model
    const propensityModel = new LinearModel(
      [0.7, 0.4, -0.1, 0.6, 0.3],
      0.2
    );
    this.modelRegistry.register('purchase_propensity', propensityModel, {
      description: 'Predicts likelihood of purchase',
      features: ['page_views', 'time_on_site', 'previous_purchases', 'cart_value', 'email_engagement'],
      version: '1.8.0'
    });
    
    // Recommendation scoring model
    const recommendationTree: TreeNode = {
      isLeaf: false,
      feature: 0, // user_engagement_score
      threshold: 0.5,
      left: {
        isLeaf: false,
        feature: 1, // product_popularity
        threshold: 0.3,
        left: { isLeaf: true, prediction: 0.2 },
        right: { isLeaf: true, prediction: 0.6 }
      },
      right: {
        isLeaf: false,
        feature: 2, // category_affinity
        threshold: 0.7,
        left: { isLeaf: true, prediction: 0.8 },
        right: { isLeaf: true, prediction: 0.95 }
      }
    };
    
    const recommendationModel = new DecisionTree(recommendationTree);
    this.modelRegistry.register('recommendation_score', recommendationModel, {
      description: 'Scores product recommendations',
      features: ['user_engagement_score', 'product_popularity', 'category_affinity'],
      version: '3.0.0'
    });
  }
  
  async predict(modelName: string, input: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = `${modelName}:${JSON.stringify(input)}`;
      
      // Check cache
      if (this.predictionCache.has(cacheKey)) {
        this.metrics.cacheHits++;
        const cached = this.predictionCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
          return cached.prediction;
        }
      }
      
      const model = this.modelRegistry.get(modelName);
      if (!model) {
        throw new Error(`Model '${modelName}' not found`);
      }
      
      const metadata = this.modelRegistry.getMetadata(modelName);
      
      // Prepare features based on model requirements
      let features;
      
      match modelName {
        'churn_prediction' => {
          features = await this.prepareChurnFeatures(input);
        },
        
        'purchase_propensity' => {
          features = await this.preparePropensityFeatures(input);
        },
        
        'recommendation_score' => {
          features = await this.prepareRecommendationFeatures(input);
        },
        
        _ => {
          throw new Error(`No feature preparation defined for model '${modelName}'`);
        }
      }
      
      // Make prediction
      const prediction = model.predictProba ? model.predictProba(features) : model.predict(features);
      
      const result = {
        modelName,
        modelVersion: metadata.version,
        prediction,
        confidence: this.calculateConfidence(prediction, modelName),
        features: metadata.features.reduce((obj, feature, i) => {
          obj[feature] = features[i];
          return obj;
        }, {}),
        timestamp: new Date().toISOString()
      };
      
      // Cache result
      this.predictionCache.set(cacheKey, {
        prediction: result,
        timestamp: Date.now()
      });
      
      // Cleanup old cache entries
      if (this.predictionCache.size > 10000) {
        const oldEntries = Array.from(this.predictionCache.entries())
          .filter(([_, entry]) => Date.now() - entry.timestamp > 600000) // 10 minutes
          .map(([key]) => key);
        
        for (const key of oldEntries) {
          this.predictionCache.delete(key);
        }
      }
      
      // Update metrics
      this.metrics.totalPredictions++;
      const latency = Date.now() - startTime;
      this.metrics.averageLatency = 
        (this.metrics.averageLatency * (this.metrics.totalPredictions - 1) + latency) / 
        this.metrics.totalPredictions;
      
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      throw error;
    }
  }
  
  async batchPredict(modelName: string, inputs: any[]): Promise<any[]> {
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchPromises = batch.map(input => this.predict(modelName, input));
      const batchResults = await Promise.allSettled(batchPromises);
      
      const successful = batchResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);
      
      results.push(...successful);
    }
    
    return results;
  }
  
  private async prepareChurnFeatures(input: any): Promise<number[]> {
    const userId = input.userId;
    const userFeatures = await this.featureStore.getFeatures(userId, [
      'user_stats', 'session_behavior', 'demographic'
    ]);
    
    const daysSinceLastOrder = input.lastOrderDate ? 
      (Date.now() - new Date(input.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24) : 365;
    
    return [
      userFeatures.user_stats?.total_orders || 0,
      userFeatures.user_stats?.avg_order_amount || 0,
      daysSinceLastOrder,
      userFeatures.session_behavior?.avg_session_duration || 0,
      userFeatures.session_behavior?.session_count || 0,
      userFeatures.demographic?.age || 25,
      input.isPremium ? 1 : 0
    ];
  }
  
  private async preparePropensityFeatures(input: any): Promise<number[]> {
    const timeFeatures = FeatureEngineer.createTimeFeatures(new Date());
    
    return [
      input.pageViews || 0,
      input.timeOnSite || 0,
      input.previousPurchases || 0,
      input.cartValue || 0,
      input.emailEngagement || 0
    ];
  }
  
  private async prepareRecommendationFeatures(input: any): Promise<number[]> {
    return [
      input.userEngagementScore || 0.5,
      input.productPopularity || 0.3,
      input.categoryAffinity || 0.4
    ];
  }
  
  private calculateConfidence(prediction: number, modelName: string): number {
    // Simplified confidence calculation
    match modelName {
      'churn_prediction' => {
        return Math.abs(prediction - 0.5) * 2; // Distance from neutral
      },
      
      'purchase_propensity' => {
        return prediction > 0.8 || prediction < 0.2 ? 0.9 : 0.6;
      },
      
      'recommendation_score' => {
        return 0.85; // Tree models generally have high confidence
      },
      
      _ => 0.5
    }
  }
  
  getMetrics(): any {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.totalPredictions > 0 ? 
        (this.metrics.cacheHits / this.metrics.totalPredictions * 100).toFixed(2) + '%' : '0%',
      errorRate: this.metrics.totalPredictions > 0 ? 
        (this.metrics.errorCount / this.metrics.totalPredictions * 100).toFixed(2) + '%' : '0%'
    };
  }
  
  getModels(): any[] {
    return this.modelRegistry.list().map(name => ({
      name,
      ...this.modelRegistry.getMetadata(name)
    }));
  }
}

// HTTP API for serving predictions
async function createMLService(port: number = 3000): Promise<void> {
  const app = new HTTP.Server();
  const predictionService = new PredictionService();
  
  // Middleware for request logging
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  });
  
  // Single prediction endpoint
  app.post('/predict/:model', async (req, res) => {
    try {
      const modelName = req.params.model;
      const input = req.body;
      
      const result = await predictionService.predict(modelName, input);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Batch prediction endpoint
  app.post('/predict/:model/batch', async (req, res) => {
    try {
      const modelName = req.params.model;
      const inputs = req.body.inputs;
      
      if (!Array.isArray(inputs)) {
        return res.status(400).json({ error: 'inputs must be an array' });
      }
      
      const results = await predictionService.batchPredict(modelName, inputs);
      res.json({ predictions: results });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Model information endpoints
  app.get('/models', (req, res) => {
    const models = predictionService.getModels();
    res.json({ models });
  });
  
  app.get('/models/:model', (req, res) => {
    const modelName = req.params.model;
    const models = predictionService.getModels();
    const model = models.find(m => m.name === modelName);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json(model);
  });
  
  // Metrics endpoint
  app.get('/metrics', (req, res) => {
    const metrics = predictionService.getMetrics();
    res.json(metrics);
  });
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      service: 'ml-inference',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  app.listen(port, () => {
    console.log(`ML Inference Service running on port ${port}`);
    console.log('Available endpoints:');
    console.log(`  POST /predict/{model}        - Single prediction`);
    console.log(`  POST /predict/{model}/batch  - Batch predictions`);
    console.log(`  GET  /models                 - List models`);
    console.log(`  GET  /models/{model}         - Model details`);
    console.log(`  GET  /metrics                - Service metrics`);
    console.log(`  GET  /health                 - Health check`);
  });
}

export { 
  FeatureEngineer, 
  LinearModel, 
  DecisionTree, 
  ModelRegistry, 
  FeatureStore, 
  PredictionService, 
  createMLService 
};

// Start service if this is the main module
if (import.meta.main) {
  const port = parseInt(process.env.PORT || '3000');
  createMLService(port);
}