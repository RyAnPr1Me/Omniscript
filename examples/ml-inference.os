// Modern Machine Learning Inference Service
// Demonstrates: Model serving, Feature engineering, Async processing, Performance optimization, Type Safety

use { HTTP, Database, Crypto, FileSystem, Math, DateTime, Console, UUID } from 'stdlib';

// Type definitions for ML operations
type ModelPrediction = {
  prediction :: any,
  confidence :: number,
  features :: any,
  modelVersion :: string,
  timestamp :: DateTime
};

type FeatureVector = {
  numerical :: number[],
  categorical :: string[],
  text :: string[],
  metadata :: any
};

type ModelConfig = {
  name :: string,
  version :: string,
  type :: string,
  inputSchema :: any,
  outputSchema :: any,
  preprocessor :: Function,
  predictor :: Function
};

type CacheEntry<T> = {
  value :: T,
  timestamp :: DateTime,
  hits :: number,
  ttl :: number
};

type MLMetrics = {
  totalPredictions :: number,
  averageLatency :: number,
  cacheHitRate :: number,
  errorRate :: number,
  throughput :: number
};

// Enhanced Feature Engineering with type safety
object FeatureEngineer {
  static def normalize :: (values :: number[]) -> number[] = (values) => {
    def mean :: number = values |> reduce(0, (sum, val) => sum + val) / values.length;
    def variance :: number = values |> reduce(0, (sum, val) => sum + Math.pow(val - mean, 2)) / values.length;
    def stdDev :: number = Math.sqrt(variance);
    
    return values |> map((val) => stdDev === 0 ? 0 : (val - mean) / stdDev);
  };
  
  static def standardize :: (values :: number[], mean :: number, std :: number) -> number[] = 
    (values, mean, std) => {
      return values |> map((val) => std === 0 ? 0 : (val - mean) / std);
    };
  
  static def oneHotEncode :: (categories :: string[], allCategories :: string[]) -> number[] = 
    (categories, allCategories) => {
      return allCategories |> map((cat) => categories.includes(cat) ? 1 : 0);
    };
  
  static def binNumeric :: (value :: number, bins :: number[]) -> number = (value, bins) => {
    for (def i = 0; i < bins.length - 1; i++) {
      match value >= bins[i] && value < bins[i + 1] {
        case true => return i
        case false => {}
      }
    }
    return bins.length - 1;
  };
  
  static def extractTextFeatures :: (text :: string) -> any = (text) => {
    def words :: string[] = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
    def wordCount :: number = words.length;
    def avgWordLength :: number = wordCount === 0 ? 0 : 
      words |> map((word) => word.length) |> reduce(0, (a, b) => a + b) / wordCount;
    def sentenceCount :: number = text.split(/[.!?]+/).length - 1;
    
    // Enhanced sentiment analysis
    def positiveWords :: string[] = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic', 'wonderful'];
    def negativeWords :: string[] = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'frustrating', 'annoying'];
    def intensifiers :: string[] = ['very', 'extremely', 'really', 'quite', 'absolutely'];
    
    def positiveCount :: number = words |> filter((word) => positiveWords.includes(word)) |> length;
    def negativeCount :: number = words |> filter((word) => negativeWords.includes(word)) |> length;
    def intensifierCount :: number = words |> filter((word) => intensifiers.includes(word)) |> length;
    
    // Advanced features
    def exclamationCount :: number = (text.match(/!/g) || []).length;
    def questionCount :: number = (text.match(/\?/g) || []).length;
    def capsRatio :: number = text.length === 0 ? 0 : (text.match(/[A-Z]/g) || []).length / text.length;
    
    return {
      wordCount,
      avgWordLength,
      sentenceCount,
      positiveCount,
      negativeCount,
      intensifierCount,
      exclamationCount,
      questionCount,
      capsRatio,
      sentimentScore: wordCount === 0 ? 0 : (positiveCount - negativeCount) / wordCount,
      intensityScore: wordCount === 0 ? 0 : intensifierCount / wordCount,
      readabilityScore: sentenceCount === 0 ? 0 : wordCount / sentenceCount
    };
  };
  
  static def extractNumericalFeatures :: (data :: any) -> number[] = (data) => {
    def features :: number[] = [];
    
    // Extract common numerical features
    match data.age {
      case undefined => {}
      case age => features.push(age)
    }
    
    match data.income {
      case undefined => {}
      case income => features.push(income)
    }
    
    match data.score {
      case undefined => {}
      case score => features.push(score)
    }
    
    // Time-based features
    match data.timestamp {
      case undefined => {}
      case ts => {
        def date :: DateTime = new DateTime(ts);
        features.push(date.getHour());
        features.push(date.getDayOfWeek());
        features.push(date.getMonth());
      }
    }
    
    return features;
  };
  
  static def createFeatureVector :: (rawData :: any) -> FeatureVector = (rawData) => {
    def numerical :: number[] = FeatureEngineer.extractNumericalFeatures(rawData);
    def categorical :: string[] = [];
    def text :: string[] = [];
    
    // Extract categorical features
    if (rawData.category) categorical.push(rawData.category);
    if (rawData.region) categorical.push(rawData.region);
    if (rawData.deviceType) categorical.push(rawData.deviceType);
    
    // Extract text features
    if (rawData.description) text.push(rawData.description);
    if (rawData.title) text.push(rawData.title);
    if (rawData.comments) text.push(...rawData.comments);
    
    return {
      numerical,
      categorical,
      text,
      metadata: {
        originalData: rawData,
        extractionTime: DateTime.now()
      }
    };
  };
}

// Enhanced ML Cache with LRU eviction and TTL
object MLCache<T> {
  def cache :: Map<string, CacheEntry<T>>;
  def maxSize :: number;
  def defaultTTL :: number;
  def hits :: number;
  def misses :: number;
  
  constructor(maxSize :: number = 1000, defaultTTL :: number = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.hits = 0;
    this.misses = 0;
  }
  
  def get :: (key :: string) -> T | null = (key) => {
    def entry :: CacheEntry<T> | undefined = this.cache.get(key);
    
    match entry {
      case undefined => {
        this.misses++;
        return null;
      }
      case entry => {
        def now :: DateTime = DateTime.now();
        def isExpired :: boolean = now.getTime() - entry.timestamp.getTime() > entry.ttl;
        
        match isExpired {
          case true => {
            this.cache.delete(key);
            this.misses++;
            return null;
          }
          case false => {
            entry.hits++;
            this.hits++;
            // Move to end (LRU)
            this.cache.delete(key);
            this.cache.set(key, entry);
            return entry.value;
          }
        }
      }
    }
  };
  
  def set :: (key :: string, value :: T, ttl :: number) -> void = (key, value, ttl) => {
    // Check if we need to evict
    match this.cache.size >= this.maxSize {
      case true => {
        def firstKey :: string = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      case false => {}
    }
    
    def entry :: CacheEntry<T> = {
      value,
      timestamp: DateTime.now(),
      hits: 0,
      ttl: ttl || this.defaultTTL
    };
    
    this.cache.set(key, entry);
  };
  
  def getHitRate :: () -> number = () => {
    def total :: number = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  };
  
  def clear :: () -> void = () => {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  };
  
  def getStats :: () -> any = () => ({
    size: this.cache.size,
    hits: this.hits,
    misses: this.misses,
    hitRate: this.getHitRate(),
    maxSize: this.maxSize
  });
}

// Model Registry for managing multiple models
object ModelRegistry {
  def models :: Map<string, ModelConfig>;
  def loadedModels :: Map<string, any>;
  def modelMetrics :: Map<string, MLMetrics>;
  
  constructor() {
    this.models = new Map();
    this.loadedModels = new Map();
    this.modelMetrics = new Map();
  }
  
  def registerModel :: (config :: ModelConfig) -> Either<string, boolean> = (config) => {
    match this.validateModelConfig(config) {
      case left(error) => left(error)
      case right(_) => {
        this.models.set(config.name, config);
        this.initializeMetrics(config.name);
        Console.log(`🤖 Model registered: ${config.name} v${config.version}`);
        return right(true);
      }
    }
  };
  
  def getModel :: (modelName :: string) -> ModelConfig | null = (modelName) => {
    return this.models.get(modelName) || null;
  };
  
  def loadModel :: (modelName :: string) -> Either<string, any> = (modelName) => {
    def config :: ModelConfig | null = this.getModel(modelName);
    
    match config {
      case null => left(`Model not found: ${modelName}`)
      case config => {
        match this.loadedModels.has(modelName) {
          case true => right(this.loadedModels.get(modelName))
          case false => {
            try {
              // Simulate model loading (in real implementation, would load from file/database)
              def model :: any = this.createMockModel(config);
              this.loadedModels.set(modelName, model);
              Console.log(`✅ Model loaded: ${modelName}`);
              return right(model);
            } catch (error :: Error) {
              return left(`Failed to load model: ${error.message}`);
            }
          }
        }
      }
    }
  };
  
  def validateModelConfig :: (config :: ModelConfig) -> Either<string, boolean> = (config) => {
    match {
      case !config.name => left("Model name is required")
      case !config.version => left("Model version is required")
      case !config.type => left("Model type is required")
      case typeof config.predictor !== 'function' => left("Predictor function is required")
      case _ => right(true)
    }
  };
  
  def initializeMetrics :: (modelName :: string) -> void = (modelName) => {
    this.modelMetrics.set(modelName, {
      totalPredictions: 0,
      averageLatency: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0
    });
  };
  
  def updateMetrics :: (modelName :: string, latency :: number, success :: boolean) -> void = 
    (modelName, latency, success) => {
      def metrics :: MLMetrics = this.modelMetrics.get(modelName);
      
      match metrics {
        case undefined => {}
        case metrics => {
          metrics.totalPredictions++;
          
          // Update average latency
          def count :: number = metrics.totalPredictions;
          metrics.averageLatency = ((metrics.averageLatency * (count - 1)) + latency) / count;
          
          // Update error rate
          match success {
            case false => {
              def errors :: number = metrics.errorRate * (count - 1) + 1;
              metrics.errorRate = errors / count;
            }
            case true => {
              def errors :: number = metrics.errorRate * (count - 1);
              metrics.errorRate = errors / count;
            }
          }
          
          this.modelMetrics.set(modelName, metrics);
        }
      }
    };
  
  def createMockModel :: (config :: ModelConfig) -> any = (config) => {
    return {
      name: config.name,
      version: config.version,
      type: config.type,
      predict: config.predictor,
      preprocess: config.preprocessor || ((data) => data)
    };
  };
  
  def getModelStats :: (modelName :: string) -> MLMetrics | null = (modelName) => {
    return this.modelMetrics.get(modelName) || null;
  };
  
  def getAllModels :: () -> string[] = () => {
    return Array.from(this.models.keys());
  };
}

// ML Inference Engine
object MLInferenceEngine {
  def modelRegistry :: ModelRegistry;
  def predictionCache :: MLCache<ModelPrediction>;
  def featureCache :: MLCache<FeatureVector>;
  def batchProcessor :: any;
  
  constructor() {
    this.modelRegistry = new ModelRegistry();
    this.predictionCache = new MLCache(2000, 600000); // 10 minutes cache
    this.featureCache = new MLCache(5000, 300000); // 5 minutes cache
    this.initializeBatchProcessor();
    this.registerDefaultModels();
  }
  
  def predict :: (modelName :: string, inputData :: any, options :: any) -> Promise<Either<string, ModelPrediction>> = 
    async (modelName, inputData, options) => {
      def startTime :: number = DateTime.now().getTime();
      def cacheKey :: string = this.generateCacheKey(modelName, inputData);
      
      try {
        // Check cache first
        match options?.useCache !== false {
          case true => {
            def cachedPrediction :: ModelPrediction | null = this.predictionCache.get(cacheKey);
            match cachedPrediction {
              case null => {}
              case prediction => {
                Console.log(`💾 Cache hit for model ${modelName}`);
                return right(prediction);
              }
            }
          }
          case false => {}
        }
        
        // Load model
        def modelResult :: Either<string, any> = this.modelRegistry.loadModel(modelName);
        
        match modelResult {
          case left(error) => return left(error)
          case right(model) => {
            // Extract and cache features
            def features :: FeatureVector = await this.extractFeatures(inputData, cacheKey);
            
            // Preprocess data
            def preprocessedData :: any = model.preprocess(features);
            
            // Make prediction
            def prediction :: any = await model.predict(preprocessedData);
            
            def result :: ModelPrediction = {
              prediction,
              confidence: this.calculateConfidence(prediction, model.type),
              features: preprocessedData,
              modelVersion: model.version,
              timestamp: DateTime.now()
            };
            
            // Cache result
            match options?.useCache !== false {
              case true => this.predictionCache.set(cacheKey, result, 600000)
              case false => {}
            }
            
            def latency :: number = DateTime.now().getTime() - startTime;
            this.modelRegistry.updateMetrics(modelName, latency, true);
            
            Console.log(`🎯 Prediction completed for ${modelName} in ${latency}ms`);
            return right(result);
          }
        }
      } catch (error :: Error) {
        def latency :: number = DateTime.now().getTime() - startTime;
        this.modelRegistry.updateMetrics(modelName, latency, false);
        return left(`Prediction failed: ${error.message}`);
      }
    };
  
  def batchPredict :: (modelName :: string, inputDataList :: any[], options :: any) -> Promise<Either<string, ModelPrediction[]>> = 
    async (modelName, inputDataList, options) => {
      try {
        def batchSize :: number = options?.batchSize || 10;
        def results :: ModelPrediction[] = [];
        
        Console.log(`🔄 Processing batch of ${inputDataList.length} items for ${modelName}`);
        
        for (def i = 0; i < inputDataList.length; i += batchSize) {
          def batch :: any[] = inputDataList.slice(i, i + batchSize);
          def batchPromises :: Promise<Either<string, ModelPrediction>>[] = batch |> map(async (item) => 
            this.predict(modelName, item, options)
          );
          
          def batchResults :: Either<string, ModelPrediction>[] = await Promise.all(batchPromises);
          
          // Extract successful predictions
          def successfulPredictions :: ModelPrediction[] = batchResults
            |> filter((result) => result.isRight)
            |> map((result) => result.value);
          
          results.push(...successfulPredictions);
          
          // Log progress
          Console.log(`📊 Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(inputDataList.length / batchSize)}`);
        }
        
        return right(results);
      } catch (error :: Error) {
        return left(`Batch prediction failed: ${error.message}`);
      }
    };
  
  def extractFeatures :: (inputData :: any, cacheKey :: string) -> Promise<FeatureVector> = 
    async (inputData, cacheKey) => {
      // Check feature cache
      def cachedFeatures :: FeatureVector | null = this.featureCache.get(cacheKey);
      
      match cachedFeatures {
        case null => {
          def features :: FeatureVector = FeatureEngineer.createFeatureVector(inputData);
          this.featureCache.set(cacheKey, features, 300000);
          return features;
        }
        case features => features
      }
    };
  
  def generateCacheKey :: (modelName :: string, inputData :: any) -> string = (modelName, inputData) => {
    def dataHash :: string = Crypto.hash(JSON.stringify(inputData), 'SHA-256');
    return `${modelName}:${dataHash}`;
  };
  
  def calculateConfidence :: (prediction :: any, modelType :: string) -> number = (prediction, modelType) => {
    match modelType {
      case "classification" => {
        match Array.isArray(prediction) {
          case true => Math.max(...prediction)
          case false => Math.min(Math.abs(prediction), 1.0)
        }
      }
      case "regression" => Math.min(Math.abs(prediction) / 100, 1.0) // Simplified confidence
      case _ => 0.5
    }
  };
  
  def initializeBatchProcessor :: () -> void = () => {
    // Initialize background batch processing queue
    Console.log('⚙️ Batch processor initialized');
  };
  
  def registerDefaultModels :: () -> void = () => {
    // Register sample models
    def churnModel :: ModelConfig = {
      name: "customer-churn",
      version: "1.0.0",
      type: "classification",
      inputSchema: {
        required: ["age", "income", "usage_days"],
        optional: ["region", "device_type"]
      },
      outputSchema: {
        type: "array",
        items: "number"
      },
      preprocessor: (features :: FeatureVector) => {
        // Normalize numerical features
        def normalized :: number[] = FeatureEngineer.normalize(features.numerical);
        
        // One-hot encode categorical features
        def categories :: string[] = ["mobile", "web", "desktop"];
        def encoded :: number[] = FeatureEngineer.oneHotEncode(features.categorical, categories);
        
        return [...normalized, ...encoded];
      },
      predictor: (features :: number[]) => {
        // Simple mock prediction logic
        def score :: number = features |> reduce(0, (sum, f) => sum + f) / features.length;
        def churnProbability :: number = Math.max(0, Math.min(1, score * 0.3 + Math.random() * 0.1));
        return [1 - churnProbability, churnProbability]; // [no_churn, churn]
      }
    };
    
    def sentimentModel :: ModelConfig = {
      name: "sentiment-analysis",
      version: "1.0.0", 
      type: "classification",
      inputSchema: {
        required: ["text"],
        optional: []
      },
      outputSchema: {
        type: "array", 
        items: "number"
      },
      preprocessor: (features :: FeatureVector) => {
        def textFeatures :: any = features.text |> map(FeatureEngineer.extractTextFeatures) |> reduce({}, (acc, f) => ({
          ...acc,
          wordCount: (acc.wordCount || 0) + f.wordCount,
          sentimentScore: (acc.sentimentScore || 0) + f.sentimentScore,
          intensityScore: (acc.intensityScore || 0) + f.intensityScore
        }));
        
        return [
          textFeatures.wordCount || 0,
          textFeatures.sentimentScore || 0,
          textFeatures.intensityScore || 0,
          textFeatures.capsRatio || 0
        ];
      },
      predictor: (features :: number[]) => {
        def [wordCount, sentiment, intensity, caps] = features;
        def positiveScore :: number = Math.max(0, sentiment + intensity * 0.5 + caps * 0.2);
        def negativeScore :: number = Math.max(0, -sentiment + caps * 0.3);
        def neutralScore :: number = 1 - positiveScore - negativeScore;
        
        // Normalize to probabilities
        def total :: number = positiveScore + negativeScore + neutralScore;
        return total === 0 ? [0.33, 0.33, 0.34] : [
          negativeScore / total,
          neutralScore / total, 
          positiveScore / total
        ]; // [negative, neutral, positive]
      }
    };
    
    this.modelRegistry.registerModel(churnModel);
    this.modelRegistry.registerModel(sentimentModel);
    
    Console.log('🤖 Default models registered');
  };
  
  def getStats :: () -> any = () => ({
    models: this.modelRegistry.getAllModels(),
    predictionCache: this.predictionCache.getStats(),
    featureCache: this.featureCache.getStats(),
    modelMetrics: Object.fromEntries(this.modelRegistry.modelMetrics.entries())
  });
  
  def clearCaches :: () -> void = () => {
    this.predictionCache.clear();
    this.featureCache.clear();
    Console.log('🧹 ML caches cleared');
  };
}

// ML API Server
def createMLAPIServer :: (port :: number) -> HTTP.Server = (port) => {
  def app :: HTTP.Server = HTTP.createServer();
  def mlEngine :: MLInferenceEngine = new MLInferenceEngine();
  
  app.use(HTTP.middleware.json());
  app.use(HTTP.middleware.cors());
  
  // Request validation middleware
  def validateRequest :: (req :: HTTP.Request, res :: HTTP.Response, next :: Function) -> void = 
    (req, res, next) => {
      match !req.body {
        case true => {
          res.status(400).json({ error: 'Request body is required' });
          return;
        }
        case false => next()
      }
    };
  
  // Single prediction endpoint
  app.post('/predict/:modelName', validateRequest, async (req :: HTTP.Request, res :: HTTP.Response) => {
    try {
      def modelName :: string = req.params.modelName;
      def inputData :: any = req.body.data;
      def options :: any = req.body.options || {};
      
      def result :: Either<string, ModelPrediction> = await mlEngine.predict(modelName, inputData, options);
      
      match result {
        case left(error) => res.status(400).json({ error })
        case right(prediction) => res.json({
          success: true,
          prediction: prediction.prediction,
          confidence: prediction.confidence,
          modelVersion: prediction.modelVersion,
          timestamp: prediction.timestamp
        })
      }
    } catch (error :: Error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Batch prediction endpoint
  app.post('/predict/:modelName/batch', validateRequest, async (req :: HTTP.Request, res :: HTTP.Response) => {
    try {
      def modelName :: string = req.params.modelName;
      def inputDataList :: any[] = req.body.data;
      def options :: any = req.body.options || {};
      
      def result :: Either<string, ModelPrediction[]> = await mlEngine.batchPredict(modelName, inputDataList, options);
      
      match result {
        case left(error) => res.status(400).json({ error })
        case right(predictions) => res.json({
          success: true,
          predictions: predictions |> map((p) => ({
            prediction: p.prediction,
            confidence: p.confidence,
            modelVersion: p.modelVersion,
            timestamp: p.timestamp
          })),
          count: predictions.length
        })
      }
    } catch (error :: Error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Model information endpoint
  app.get('/models', (req :: HTTP.Request, res :: HTTP.Response) => {
    def models :: string[] = mlEngine.modelRegistry.getAllModels();
    def modelInfo :: any = models |> map((name) => {
      def config :: ModelConfig = mlEngine.modelRegistry.getModel(name);
      def stats :: MLMetrics = mlEngine.modelRegistry.getModelStats(name);
      return {
        name: config.name,
        version: config.version,
        type: config.type,
        inputSchema: config.inputSchema,
        outputSchema: config.outputSchema,
        stats
      };
    });
    
    res.json({ models: modelInfo });
  });
  
  // System statistics endpoint
  app.get('/stats', (req :: HTTP.Request, res :: HTTP.Response) => {
    def stats :: any = mlEngine.getStats();
    res.json({
      system: stats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: DateTime.now()
    });
  });
  
  // Clear caches endpoint
  app.post('/admin/clear-caches', (req :: HTTP.Request, res :: HTTP.Response) => {
    mlEngine.clearCaches();
    res.json({ message: 'Caches cleared successfully' });
  });
  
  // Health check endpoint
  app.get('/health', (req :: HTTP.Request, res :: HTTP.Response) => {
    res.json({
      status: 'healthy',
      service: 'ml-inference',
      timestamp: DateTime.now(),
      models: mlEngine.modelRegistry.getAllModels().length
    });
  });
  
  app.listen(port, () => {
    Console.log(`🧠 ML Inference API server running on port ${port}`);
  });
  
  return app;
};

// Example usage and demonstration
def main :: () -> Promise<void> = async () => {
  Console.log('🚀 Starting Modern ML Inference Service...');
  
  // Start the API server
  createMLAPIServer(4000);
  
  // Example predictions
  def mlEngine :: MLInferenceEngine = new MLInferenceEngine();
  
  // Test customer churn prediction
  Console.log('\n🔮 Testing customer churn prediction...');
  def customerData :: any = {
    age: 35,
    income: 75000,
    usage_days: 120,
    region: "North America",
    device_type: "mobile"
  };
  
  def churnResult :: Either<string, ModelPrediction> = await mlEngine.predict('customer-churn', customerData, {});
  
  match churnResult {
    case left(error) => Console.error('❌ Churn prediction failed:', error)
    case right(prediction) => {
      Console.log('✅ Churn prediction result:', {
        churnProbability: prediction.prediction[1],
        confidence: prediction.confidence,
        modelVersion: prediction.modelVersion
      });
    }
  }
  
  // Test sentiment analysis
  Console.log('\n💭 Testing sentiment analysis...');
  def textData :: any = {
    text: "I absolutely love this product! It's amazing and works perfectly."
  };
  
  def sentimentResult :: Either<string, ModelPrediction> = await mlEngine.predict('sentiment-analysis', textData, {});
  
  match sentimentResult {
    case left(error) => Console.error('❌ Sentiment analysis failed:', error)
    case right(prediction) => {
      def [negative, neutral, positive] = prediction.prediction;
      Console.log('✅ Sentiment analysis result:', {
        sentiment: positive > 0.5 ? 'positive' : negative > 0.5 ? 'negative' : 'neutral',
        scores: { negative, neutral, positive },
        confidence: prediction.confidence
      });
    }
  }
  
  // Test batch prediction
  Console.log('\n📦 Testing batch prediction...');
  def batchData :: any[] = [
    { age: 25, income: 50000, usage_days: 30 },
    { age: 45, income: 90000, usage_days: 365 },
    { age: 30, income: 60000, usage_days: 180 }
  ];
  
  def batchResult :: Either<string, ModelPrediction[]> = await mlEngine.batchPredict('customer-churn', batchData, { batchSize: 2 });
  
  match batchResult {
    case left(error) => Console.error('❌ Batch prediction failed:', error)
    case right(predictions) => {
      Console.log(`✅ Batch prediction completed: ${predictions.length} results`);
      predictions.forEach((p, i) => {
        Console.log(`  Customer ${i + 1}: ${(p.prediction[1] * 100).toFixed(1)}% churn probability`);
      });
    }
  }
  
  // Display final statistics
  def stats :: any = mlEngine.getStats();
  Console.log('\n📊 Final ML Engine Statistics:', JSON.stringify(stats, null, 2));
  
  Console.log('\n🎉 ML Inference Service demonstration completed!');
  Console.log('🌐 API Server endpoints:');
  Console.log('  POST   /predict/:modelName');
  Console.log('  POST   /predict/:modelName/batch');
  Console.log('  GET    /models');
  Console.log('  GET    /stats');
  Console.log('  POST   /admin/clear-caches');
  Console.log('  GET    /health');
};

// Run the example
main().catch((error) => {
  Console.error('💥 Main execution error:', error);
  process.exit(1);
});
  
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