// Modern Data Processing Pipeline with Enhanced Functional Programming
// Demonstrates: Stream processing, Functional composition, Error handling, Performance optimization, Type Safety

use { FileSystem, Stream, HTTP, Database, DateTime, Console, Math } from 'stdlib';

// Type definitions for better type safety
type RawEvent = {
  timestamp :: DateTime,
  userId :: number,
  event :: string,
  data :: any,
  sessionId :: string
};

type EnrichedEvent = RawEvent & {
  user :: User,
  geolocation :: GeoLocation,
  deviceInfo :: DeviceInfo
};

type ProcessingResult<T> = {
  success :: boolean,
  data :: T,
  errors :: string[],
  metadata :: any
};

type PipelineMetrics = {
  totalProcessed :: number,
  successful :: number,
  failed :: number,
  averageProcessingTime :: number,
  throughput :: number
};

type User = {
  id :: number,
  name :: string,
  email :: string,
  segment :: string,
  joinedAt :: DateTime
};

type GeoLocation = {
  country :: string,
  region :: string,
  city :: string,
  coordinates :: [number, number]
};

type DeviceInfo = {
  userAgent :: string,
  browser :: string,
  os :: string,
  deviceType :: string
};

// Enhanced functional utilities with type safety
def pipe :: <T>(...fns :: Function[]) -> (value :: T) -> T = (...fns) => 
  (value) => fns |> reduce(value, (acc, fn) => fn(acc));

def compose :: <T>(...fns :: Function[]) -> (value :: T) -> T = (...fns) =>
  (value) => fns |> reduceRight(value, (acc, fn) => fn(acc));

def curry :: <T>(fn :: Function) -> Function = (fn) => 
  (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

def memoize :: <T>(fn :: Function) -> Function = (fn) => {
  def cache :: Map<string, T> = new Map();
  return (...args) => {
    def key :: string = JSON.stringify(args);
    match cache.has(key) {
      case true => cache.get(key)
      case false => {
        def result :: T = fn(...args);
        cache.set(key, result);
        return result;
      }
    }
  };
};

def retry :: <T>(fn :: () -> Promise<T>, attempts :: number, delay :: number) -> Promise<T> = 
  async (fn, attempts, delay) => {
    for (def attempt of range(attempts)) {
      try {
        return await fn();
      } catch (error :: Error) {
        match attempt === attempts - 1 {
          case true => throw error
          case false => {
            Console.warn(`Retry attempt ${attempt + 1} failed:`, error.message);
            await sleep(delay * Math.pow(2, attempt)); // Exponential backoff
          }
        }
      }
    }
  };

def sleep :: (ms :: number) -> Promise<void> = (ms) => 
  new Promise((resolve) => setTimeout(resolve, ms));

// Enhanced data transformation functions with error handling
def parseCSVLine :: (line :: string) -> Either<string, RawEvent> = (line) => {
  try {
    def fields :: string[] = line.split(',') |> map((field) => field.trim().replace(/^"(.*)"$/, '$1'));
    
    match fields.length < 5 {
      case true => left(`Invalid CSV line: insufficient fields (${fields.length}/5)`)
      case false => {
        def timestamp :: DateTime = new DateTime(fields[0]);
        def userId :: number = parseInt(fields[1]);
        def data :: any = fields[3] ? JSON.parse(fields[3]) : null;
        
        match isNaN(timestamp.getTime()) || isNaN(userId) {
          case true => left(`Invalid data types in CSV line: ${line}`)
          case false => right({
            timestamp,
            userId,
            event: fields[2],
            data,
            sessionId: fields[4]
          })
        }
      }
    }
  } catch (error :: Error) {
    return left(`Failed to parse CSV line: ${error.message}`);
  }
};

def validateEvent :: (event :: RawEvent) -> Either<string, RawEvent> = (event) => {
  match {
    case !event.timestamp || isNaN(event.timestamp.getTime()) => 
      left(`Invalid timestamp: ${event.timestamp}`)
    case !event.userId || typeof event.userId !== 'number' => 
      left(`Invalid userId: ${event.userId}`)
    case !event.event || typeof event.event !== 'string' => 
      left(`Invalid event type: ${event.event}`)
    case !event.sessionId || typeof event.sessionId !== 'string' => 
      left(`Invalid sessionId: ${event.sessionId}`)
    case _ => right(event)
  }
};

// Memoized user data enrichment
def enrichWithUserData :: (userCache :: Map<number, User>) -> (event :: RawEvent) -> Promise<Either<string, RawEvent & { user: User }>> = 
  curry(async (userCache, event) => {
    try {
      match userCache.has(event.userId) {
        case true => {
          def user :: User = userCache.get(event.userId);
          return right({ ...event, user });
        }
        case false => {
          def user :: User | null = await Database.query<User>()
            .where((u) => u.id === event.userId)
            .first();
          
          match user {
            case null => left(`User not found: ${event.userId}`)
            case user => {
              userCache.set(event.userId, user);
              return right({ ...event, user });
            }
          }
        }
      }
    } catch (error :: Error) {
      return left(`Failed to enrich user data: ${error.message}`);
    }
  });

// Geolocation enrichment with caching
def enrichWithGeoLocation :: (geoCache :: Map<string, GeoLocation>) -> (event :: any) -> Promise<Either<string, any>> = 
  curry(async (geoCache, event) => {
    try {
      def ipAddress :: string = event.data?.ipAddress || 'unknown';
      
      match ipAddress === 'unknown' {
        case true => right({ ...event, geolocation: null })
        case false => {
          match geoCache.has(ipAddress) {
            case true => {
              def geo :: GeoLocation = geoCache.get(ipAddress);
              return right({ ...event, geolocation: geo });
            }
            case false => {
              def geoResponse :: any = await HTTP.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEO_API_KEY}&ip=${ipAddress}`);
              
              def geolocation :: GeoLocation = {
                country: geoResponse.country_name,
                region: geoResponse.state_prov,
                city: geoResponse.city,
                coordinates: [parseFloat(geoResponse.latitude), parseFloat(geoResponse.longitude)]
              };
              
              geoCache.set(ipAddress, geolocation);
              return right({ ...event, geolocation });
            }
          }
        }
      }
    } catch (error :: Error) {
      return left(`Failed to enrich geolocation: ${error.message}`);
    }
  });

// Device information extraction
def enrichWithDeviceInfo :: (event :: any) -> Either<string, any> = (event) => {
  try {
    def userAgent :: string = event.data?.userAgent || '';
    
    match userAgent === '' {
      case true => right({ ...event, deviceInfo: null })
      case false => {
        def deviceInfo :: DeviceInfo = {
          userAgent,
          browser: extractBrowser(userAgent),
          os: extractOS(userAgent),
          deviceType: extractDeviceType(userAgent)
        };
        
        return right({ ...event, deviceInfo });
      }
    }
  } catch (error :: Error) {
    return left(`Failed to enrich device info: ${error.message}`);
  }
};

// Helper functions for device parsing
def extractBrowser :: (userAgent :: string) -> string = (userAgent) => {
  match {
    case userAgent.includes('Chrome') => 'Chrome'
    case userAgent.includes('Firefox') => 'Firefox'
    case userAgent.includes('Safari') => 'Safari'
    case userAgent.includes('Edge') => 'Edge'
    case _ => 'Unknown'
  }
};

def extractOS :: (userAgent :: string) -> string = (userAgent) => {
  match {
    case userAgent.includes('Windows') => 'Windows'
    case userAgent.includes('Mac OS') => 'macOS'
    case userAgent.includes('Linux') => 'Linux'
    case userAgent.includes('Android') => 'Android'
    case userAgent.includes('iOS') => 'iOS'
    case _ => 'Unknown'
  }
};

def extractDeviceType :: (userAgent :: string) -> string = (userAgent) => {
  match {
    case userAgent.includes('Mobile') => 'Mobile'
    case userAgent.includes('Tablet') => 'Tablet'
    case _ => 'Desktop'
  }
};

// Stream processing with functional composition
object DataPipeline {
  def userCache :: Map<number, User>;
  def geoCache :: Map<string, GeoLocation>;
  def metrics :: PipelineMetrics;
  def errorThreshold :: number;
  def batchSize :: number;
  
  constructor(errorThreshold :: number = 0.1, batchSize :: number = 1000) {
    this.userCache = new Map();
    this.geoCache = new Map();
    this.errorThreshold = errorThreshold;
    this.batchSize = batchSize;
    this.metrics = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      averageProcessingTime: 0,
      throughput: 0
    };
  }
  
  def processCSVFile :: (filePath :: string) -> Promise<ProcessingResult<any[]>> = async (filePath) => {
    def startTime :: number = DateTime.now().getTime();
    def results :: any[] = [];
    def errors :: string[] = [];
    
    try {
      def fileContent :: string = await FileSystem.readFile(filePath, 'utf8');
      def lines :: string[] = fileContent.split('\n') |> filter((line) => line.trim().length > 0);
      
      Console.log(`📊 Processing ${lines.length} lines from ${filePath}`);
      
      // Process in batches for better performance
      def batches :: string[][] = this.chunkArray(lines, this.batchSize);
      
      for (def batch of batches) {
        def batchResults :: any[] = await this.processBatch(batch);
        results.push(...batchResults.filter((r) => r.success).map((r) => r.data));
        errors.push(...batchResults.filter((r) => !r.success).map((r) => r.error));
        
        // Check error threshold
        def errorRate :: number = errors.length / (this.metrics.totalProcessed || 1);
        match errorRate > this.errorThreshold {
          case true => {
            throw new Error(`Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(this.errorThreshold * 100).toFixed(2)}%`);
          }
          case false => {}
        }
      }
      
      def endTime :: number = DateTime.now().getTime();
      def processingTime :: number = endTime - startTime;
      
      this.updateMetrics(lines.length, results.length, errors.length, processingTime);
      
      return {
        success: true,
        data: results,
        errors,
        metadata: {
          processingTime,
          throughput: this.metrics.throughput,
          errorRate: errors.length / lines.length
        }
      };
      
    } catch (error :: Error) {
      return {
        success: false,
        data: [],
        errors: [error.message],
        metadata: { processingTime: DateTime.now().getTime() - startTime }
      };
    }
  };
  
  def processBatch :: (lines :: string[]) -> Promise<any[]> = async (lines) => {
    def promises :: Promise<any>[] = lines |> map(async (line) => {
      try {
        def result :: any = await this.processLine(line);
        return { success: true, data: result };
      } catch (error :: Error) {
        return { success: false, error: error.message };
      }
    });
    
    return Promise.all(promises);
  };
  
  def processLine :: (line :: string) -> Promise<any> = async (line) => {
    // Create functional processing pipeline
    def pipeline :: Function = pipe(
      parseCSVLine,
      (result) => result.flatMap(validateEvent),
      (result) => result.flatMapAsync(enrichWithUserData(this.userCache)),
      (result) => result.flatMapAsync(enrichWithGeoLocation(this.geoCache)),
      (result) => result.flatMap(enrichWithDeviceInfo)
    );
    
    def result :: Either<string, any> = await pipeline(line);
    
    match result {
      case left(error) => throw new Error(error)
      case right(data) => data
    }
  };
  
  def chunkArray :: <T>(array :: T[], chunkSize :: number) -> T[][] = (array, chunkSize) => {
    def chunks :: T[][] = [];
    for (def i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };
  
  def updateMetrics :: (total :: number, successful :: number, failed :: number, processingTime :: number) -> void = 
    (total, successful, failed, processingTime) => {
      this.metrics.totalProcessed += total;
      this.metrics.successful += successful;
      this.metrics.failed += failed;
      
      // Calculate moving average processing time
      def currentAvg :: number = this.metrics.averageProcessingTime;
      def totalEvents :: number = this.metrics.totalProcessed;
      this.metrics.averageProcessingTime = (currentAvg * (totalEvents - total) + processingTime) / totalEvents;
      
      // Calculate throughput (events per second)
      this.metrics.throughput = (total / processingTime) * 1000;
    };
  
  def generateReport :: () -> any = () => ({
    metrics: this.metrics,
    cacheStats: {
      userCacheSize: this.userCache.size,
      geoCacheSize: this.geoCache.size
    },
    performance: {
      successRate: (this.metrics.successful / this.metrics.totalProcessed) * 100,
      errorRate: (this.metrics.failed / this.metrics.totalProcessed) * 100,
      averageProcessingTimeMs: this.metrics.averageProcessingTime,
      throughputPerSecond: this.metrics.throughput
    }
  });
  
  def clearCaches :: () -> void = () => {
    this.userCache.clear();
    this.geoCache.clear();
    Console.log('🧹 Caches cleared');
  };
}

// Session aggregation and analytics
def aggregateUserSessions :: (events :: any[]) -> Map<string, any> = (events) => {
  def sessionMap :: Map<string, any> = new Map();
  
  events
    |> groupBy((event) => event.sessionId)
    |> forEach((sessionEvents, sessionId) => {
      def session :: any = {
        sessionId,
        userId: sessionEvents[0]?.userId,
        startTime: sessionEvents |> map((e) => e.timestamp) |> min,
        endTime: sessionEvents |> map((e) => e.timestamp) |> max,
        eventCount: sessionEvents.length,
        events: sessionEvents |> map((e) => e.event) |> unique,
        duration: 0,
        pages: sessionEvents |> filter((e) => e.event === 'page_view') |> map((e) => e.data?.page) |> unique,
        country: sessionEvents[0]?.geolocation?.country,
        deviceType: sessionEvents[0]?.deviceInfo?.deviceType
      };
      
      session.duration = session.endTime.getTime() - session.startTime.getTime();
      sessionMap.set(sessionId, session);
    });
  
  return sessionMap;
};

// Real-time stream processing example
def createRealTimeProcessor :: () -> any = () => {
  def pipeline :: DataPipeline = new DataPipeline(0.05, 100); // Lower error threshold, smaller batches
  def eventBuffer :: any[] = [];
  def bufferTimeout :: any = null;
  
  def flushBuffer :: () -> Promise<void> = async () => {
    match eventBuffer.length > 0 {
      case true => {
        Console.log(`⚡ Processing ${eventBuffer.length} real-time events`);
        
        def promises :: Promise<any>[] = eventBuffer |> map(async (event) => {
          try {
            return await pipeline.processLine(JSON.stringify([
              event.timestamp,
              event.userId,
              event.event,
              JSON.stringify(event.data),
              event.sessionId
            ].join(',')));
          } catch (error :: Error) {
            Console.error('Real-time processing error:', error.message);
            return null;
          }
        });
        
        def results :: any[] = await Promise.all(promises);
        def validResults :: any[] = results.filter((r) => r !== null);
        
        Console.log(`✅ Processed ${validResults.length}/${eventBuffer.length} events`);
        
        // Clear buffer
        eventBuffer.length = 0;
        
        // Emit processed events for further downstream processing
        return validResults;
      }
      case false => {}
    }
  };
  
  return {
    addEvent: (event :: any) => {
      eventBuffer.push(event);
      
      // Auto-flush on buffer size or timeout
      match eventBuffer.length >= 100 {
        case true => flushBuffer()
        case false => {
          match bufferTimeout {
            case null => {
              bufferTimeout = setTimeout(() => {
                flushBuffer();
                bufferTimeout = null;
              }, 5000); // 5 second timeout
            }
            case _ => {}
          }
        }
      }
    },
    
    flush: flushBuffer,
    
    getMetrics: () => pipeline.generateReport()
  };
};

// Advanced analytics and insights
def generateInsights :: (events :: any[]) -> any = (events) => {
  def sessions :: Map<string, any> = aggregateUserSessions(events);
  def userEvents :: Map<number, any[]> = events |> groupBy((e) => e.userId);
  
  def insights :: any = {
    totalSessions: sessions.size,
    totalUsers: userEvents.size,
    totalEvents: events.length,
    
    // Session insights
    avgSessionDuration: Array.from(sessions.values()) 
      |> map((s) => s.duration) 
      |> reduce(0, (a, b) => a + b) / sessions.size,
      
    avgEventsPerSession: Array.from(sessions.values()) 
      |> map((s) => s.eventCount) 
      |> reduce(0, (a, b) => a + b) / sessions.size,
    
    // Geographic insights
    topCountries: events 
      |> filter((e) => e.geolocation?.country)
      |> groupBy((e) => e.geolocation.country)
      |> map((group) => ({ country: group.key, count: group.items.length }))
      |> sortBy((item) => -item.count)
      |> take(10),
    
    // Device insights
    deviceBreakdown: events
      |> filter((e) => e.deviceInfo?.deviceType)
      |> groupBy((e) => e.deviceInfo.deviceType)
      |> map((group) => ({ device: group.key, count: group.items.length })),
    
    // User behavior insights
    mostActiveUsers: Array.from(userEvents.entries())
      |> map(([userId, userEventList]) => ({ userId, eventCount: userEventList.length }))
      |> sortBy((item) => -item.eventCount)
      |> take(10),
    
    // Event type distribution
    eventTypeDistribution: events
      |> groupBy((e) => e.event)
      |> map((group) => ({ event: group.key, count: group.items.length }))
      |> sortBy((item) => -item.count)
  };
  
  return insights;
};

// Example usage and demonstration
def main :: () -> Promise<void> = async () => {
  Console.log('🚀 Starting Modern Data Processing Pipeline...');
  
  def pipeline :: DataPipeline = new DataPipeline();
  
  // Example 1: Process CSV file
  try {
    Console.log('📊 Processing sample CSV file...');
    def sampleData :: string = `
"2024-01-15T10:30:00Z",1,"page_view","{\\"page\\": \\"/home\\", \\"ipAddress\\": \\"192.168.1.1\\", \\"userAgent\\": \\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\\"}","session-123"
"2024-01-15T10:31:00Z",1,"click","{\\"element\\": \\"signup-button\\", \\"ipAddress\\": \\"192.168.1.1\\"}","session-123"
"2024-01-15T10:32:00Z",2,"page_view","{\\"page\\": \\"/products\\", \\"ipAddress\\": \\"192.168.1.2\\", \\"userAgent\\": \\"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)\\"}","session-456"
"2024-01-15T10:33:00Z",1,"purchase","{\\"product\\": \\"premium-plan\\", \\"amount\\": 99.99}","session-123"
    `.trim();
    
    // Write sample data to temporary file
    await FileSystem.writeFile('/tmp/sample_events.csv', sampleData);
    
    def result :: ProcessingResult<any[]> = await pipeline.processCSVFile('/tmp/sample_events.csv');
    
    match result.success {
      case true => {
        Console.log('✅ CSV processing completed successfully');
        Console.log(`📈 Processed ${result.data.length} events`);
        
        def insights :: any = generateInsights(result.data);
        Console.log('🔍 Analytics Insights:', JSON.stringify(insights, null, 2));
      }
      case false => {
        Console.error('❌ CSV processing failed:', result.errors);
      }
    }
    
    // Show pipeline report
    def report :: any = pipeline.generateReport();
    Console.log('📊 Pipeline Report:', JSON.stringify(report, null, 2));
    
  } catch (error :: Error) {
    Console.error('💥 Pipeline error:', error.message);
  }
  
  // Example 2: Real-time processing
  Console.log('\n⚡ Starting real-time processing demo...');
  def realTimeProcessor :: any = createRealTimeProcessor();
  
  // Simulate real-time events
  def sampleEvents :: any[] = [
    {
      timestamp: DateTime.now().toISOString(),
      userId: 1,
      event: 'page_view',
      data: { page: '/dashboard', ipAddress: '192.168.1.1' },
      sessionId: 'real-time-session-1'
    },
    {
      timestamp: DateTime.now().toISOString(),
      userId: 2,
      event: 'search',
      data: { query: 'omniscript tutorial', ipAddress: '192.168.1.2' },
      sessionId: 'real-time-session-2'
    }
  ];
  
  sampleEvents.forEach((event) => realTimeProcessor.addEvent(event));
  
  // Wait for processing
  await sleep(1000);
  def rtMetrics :: any = realTimeProcessor.getMetrics();
  Console.log('⚡ Real-time processing metrics:', JSON.stringify(rtMetrics, null, 2));
  
  Console.log('\n🎉 Data pipeline demonstration completed!');
};

// Run the example
main().catch((error) => {
  Console.error('💥 Main execution error:', error);
  process.exit(1);
});
    }
  }
  
  const user = userCache.get(event.userId);
  return {
    ...event,
    user: user ? {
      id: user.id,
      name: user.name,
      segment: user.segment || 'default'
    } : null
  };
});

const filterByEventType = curry((allowedTypes: string[], event: any) => {
  return allowedTypes.includes(event.event) ? event : null;
});

const aggregateBySession = (events: any[]) => {
  const sessions = new Map();
  
  for (const event of events) {
    if (!sessions.has(event.sessionId)) {
      sessions.set(event.sessionId, {
        sessionId: event.sessionId,
        userId: event.userId,
        user: event.user,
        events: [],
        startTime: event.timestamp,
        endTime: event.timestamp,
        duration: 0,
        eventCounts: {}
      });
    }
    
    const session = sessions.get(event.sessionId);
    session.events.push(event);
    session.endTime = new Date(Math.max(session.endTime.getTime(), event.timestamp.getTime()));
    session.duration = session.endTime.getTime() - session.startTime.getTime();
    
    session.eventCounts[event.event] = (session.eventCounts[event.event] || 0) + 1;
  }
  
  return Array.from(sessions.values());
};

const calculateMetrics = (session: any) => {
  const metrics = {
    ...session,
    totalEvents: session.events.length,
    uniqueEvents: Object.keys(session.eventCounts).length,
    averageTimeBetweenEvents: session.events.length > 1 ? 
      session.duration / (session.events.length - 1) : 0,
    engagementScore: 0
  };
  
  // Calculate engagement score based on various factors
  metrics.engagementScore = 
    (metrics.totalEvents * 2) +
    (metrics.uniqueEvents * 5) +
    (metrics.duration > 300000 ? 10 : 0) + // Bonus for sessions > 5 minutes
    (session.eventCounts['purchase'] || 0) * 20 +
    (session.eventCounts['signup'] || 0) * 15;
  
  return metrics;
};

// Streaming data processor
class DataProcessor {
  constructor(options: {
    batchSize?: number;
    maxConcurrency?: number;
    errorThreshold?: number;
  } = {}) {
    this.batchSize = options.batchSize || 1000;
    this.maxConcurrency = options.maxConcurrency || 4;
    this.errorThreshold = options.errorThreshold || 0.1; // 10% error threshold
    this.userCache = new Map();
    this.errorCount = 0;
    this.processedCount = 0;
  }
  
  private batchSize: number;
  private maxConcurrency: number;
  private errorThreshold: number;
  private userCache: Map<number, any>;
  private errorCount: number;
  private processedCount: number;
  
  async processFile(filePath: string): Promise<any[]> {
    console.log(`Starting to process file: ${filePath}`);
    
    const results = [];
    const fileStream = await FileSystem.createReadStream(filePath);
    let buffer = '';
    let lineNumber = 0;
    let batch = [];
    
    return new Promise((resolve, reject) => {
      fileStream.on('data', async (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          lineNumber++;
          
          if (line.trim() === '' || lineNumber === 1) { // Skip empty lines and header
            continue;
          }
          
          batch.push({ line: line.trim(), lineNumber });
          
          if (batch.length >= this.batchSize) {
            const batchResults = await this.processBatch(batch);
            results.push(...batchResults);
            batch = [];
          }
        }
      });
      
      fileStream.on('end', async () => {
        try {
          // Process remaining lines in buffer
          if (buffer.trim() !== '') {
            lineNumber++;
            batch.push({ line: buffer.trim(), lineNumber });
          }
          
          if (batch.length > 0) {
            const batchResults = await this.processBatch(batch);
            results.push(...batchResults);
          }
          
          console.log(`Finished processing file. Total events: ${this.processedCount}, Errors: ${this.errorCount}`);
          resolve(results);
        } finally {
          // Cleanup resources
          fileStream.close();
          this.userCache.clear();
        }
      });
      
      fileStream.on('error', (error) => {
        fileStream.close(); // Cleanup on error
        reject(error);
      });
    });
  }
  
  private async processBatch(batch: any[]): Promise<any[]> {
    const chunks = this.chunkArray(batch, Math.ceil(batch.length / this.maxConcurrency));
    
    const chunkPromises = chunks.map(chunk => this.processChunk(chunk));
    const chunkResults = await Promise.allSettled(chunkPromises);
    
    const successfulResults = chunkResults
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => (result as PromiseFulfilledResult<any[]>).value);
    
    const errors = chunkResults
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason);
    
    this.errorCount += errors.length;
    this.processedCount += successfulResults.length;
    
    // Check error threshold
    const errorRate = this.errorCount / (this.processedCount + this.errorCount);
    if (errorRate > this.errorThreshold) {
      throw new Error(`Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(this.errorThreshold * 100)}%`);
    }
    
    return successfulResults;
  }
  
  private async processChunk(chunk: any[]): Promise<any[]> {
    const results = [];
    
    for (const { line, lineNumber } of chunk) {
      try {
        const processedEvent = await this.processLine(line, lineNumber);
        if (processedEvent) {
          results.push(processedEvent);
        }
      } catch (error) {
        console.warn(`Error processing line ${lineNumber}: ${error.message}`);
        // Continue processing other lines
      }
    }
    
    return results;
  }
  
  private async processLine(line: string, lineNumber: number): Promise<any> {
    // Create processing pipeline
    const processEvent = pipe(
      parseCSVLine,
      validateEvent,
      await enrichWithUserData(this.userCache),
      filterByEventType(['pageview', 'click', 'purchase', 'signup', 'logout'])
    );
    
    try {
      return await processEvent(line);
    } catch (error) {
      throw new Error(`Line ${lineNumber}: ${error.message}`);
    }
  }
  
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// Real-time stream processor using functional composition
class StreamProcessor {
  constructor() {
    this.transformations = [];
    this.filters = [];
    this.aggregators = [];
  }
  
  private transformations: Function[];
  private filters: Function[];
  private aggregators: Function[];
  
  transform(fn: Function): StreamProcessor {
    this.transformations.push(fn);
    return this;
  }
  
  filter(predicate: Function): StreamProcessor {
    this.filters.push(predicate);
    return this;
  }
  
  aggregate(fn: Function): StreamProcessor {
    this.aggregators.push(fn);
    return this;
  }
  
  async process(dataStream: AsyncIterable<any>): Promise<any[]> {
    const results = [];
    const buffer = [];
    
    for await (const item of dataStream) {
      try {
        // Apply transformations
        let transformed = item;
        for (const transform of this.transformations) {
          transformed = await transform(transformed);
        }
        
        // Apply filters
        let shouldInclude = true;
        for (const filter of this.filters) {
          if (!await filter(transformed)) {
            shouldInclude = false;
            break;
          }
        }
        
        if (shouldInclude) {
          buffer.push(transformed);
        }
        
        // Apply aggregations when buffer reaches certain size
        if (buffer.length >= 100) {
          for (const aggregator of this.aggregators) {
            const aggregated = await aggregator(buffer);
            results.push(...aggregated);
          }
          buffer.length = 0; // Clear buffer
        }
      } catch (error) {
        console.error('Error processing stream item:', error);
      }
    }
    
    // Process remaining items in buffer
    if (buffer.length > 0) {
      for (const aggregator of this.aggregators) {
        const aggregated = await aggregator(buffer);
        results.push(...aggregated);
      }
    }
    
    return results;
  }
}

// Data analysis and reporting
class DataAnalyzer {
  static async generateInsights(sessions: any[]): Promise<any> {
    const insights = {
      totalSessions: sessions.length,
      totalUsers: new Set(sessions.map(s => s.userId)).size,
      averageSessionDuration: sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length,
      averageEventsPerSession: sessions.reduce((sum, s) => sum + s.totalEvents, 0) / sessions.length,
      topEvents: this.getTopEvents(sessions),
      userSegmentAnalysis: this.analyzeUserSegments(sessions),
      engagementDistribution: this.analyzeEngagement(sessions),
      conversionFunnel: this.analyzeConversions(sessions)
    };
    
    return insights;
  }
  
  private static getTopEvents(sessions: any[]): any[] {
    const eventCounts = new Map();
    
    for (const session of sessions) {
      for (const [event, count] of Object.entries(session.eventCounts)) {
        eventCounts.set(event, (eventCounts.get(event) || 0) + count);
      }
    }
    
    return Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));
  }
  
  private static analyzeUserSegments(sessions: any[]): any {
    const segments = new Map();
    
    for (const session of sessions) {
      const segment = session.user?.segment || 'unknown';
      if (!segments.has(segment)) {
        segments.set(segment, {
          sessions: 0,
          totalDuration: 0,
          totalEvents: 0,
          totalEngagement: 0
        });
      }
      
      const segmentData = segments.get(segment);
      segmentData.sessions++;
      segmentData.totalDuration += session.duration;
      segmentData.totalEvents += session.totalEvents;
      segmentData.totalEngagement += session.engagementScore;
    }
    
    const result = {};
    for (const [segment, data] of segments.entries()) {
      result[segment] = {
        sessions: data.sessions,
        averageDuration: data.totalDuration / data.sessions,
        averageEvents: data.totalEvents / data.sessions,
        averageEngagement: data.totalEngagement / data.sessions
      };
    }
    
    return result;
  }
  
  private static analyzeEngagement(sessions: any[]): any {
    const buckets = {
      low: 0,      // 0-25
      medium: 0,   // 26-75
      high: 0,     // 76-150
      veryHigh: 0  // 150+
    };
    
    for (const session of sessions) {
      if (session.engagementScore <= 25) buckets.low++;
      else if (session.engagementScore <= 75) buckets.medium++;
      else if (session.engagementScore <= 150) buckets.high++;
      else buckets.veryHigh++;
    }
    
    return buckets;
  }
  
  private static analyzeConversions(sessions: any[]): any {
    const funnel = {
      totalSessions: sessions.length,
      withPageviews: 0,
      withClicks: 0,
      withSignups: 0,
      withPurchases: 0
    };
    
    for (const session of sessions) {
      if (session.eventCounts.pageview > 0) funnel.withPageviews++;
      if (session.eventCounts.click > 0) funnel.withClicks++;
      if (session.eventCounts.signup > 0) funnel.withSignups++;
      if (session.eventCounts.purchase > 0) funnel.withPurchases++;
    }
    
    return {
      ...funnel,
      pageviewRate: (funnel.withPageviews / funnel.totalSessions * 100).toFixed(2) + '%',
      clickRate: (funnel.withClicks / funnel.totalSessions * 100).toFixed(2) + '%',
      signupRate: (funnel.withSignups / funnel.totalSessions * 100).toFixed(2) + '%',
      purchaseRate: (funnel.withPurchases / funnel.totalSessions * 100).toFixed(2) + '%'
    };
  }
}

// Main processing function
async function processDataPipeline(inputFile: string, outputFile?: string): Promise<void> {
  console.log('Starting data processing pipeline...');
  
  const startTime = Date.now();
  
  try {
    // Step 1: Process raw data file
    const processor = new DataProcessor({
      batchSize: 5000,
      maxConcurrency: 8,
      errorThreshold: 0.05
    });
    
    const events = await processor.processFile(inputFile);
    console.log(`Processed ${events.length} events`);
    
    // Step 2: Filter and aggregate data
    const validEvents = events.filter(event => event !== null);
    const sessions = aggregateBySession(validEvents);
    const sessionsWithMetrics = sessions.map(calculateMetrics);
    
    console.log(`Created ${sessionsWithMetrics.length} session records`);
    
    // Step 3: Generate insights
    const insights = await DataAnalyzer.generateInsights(sessionsWithMetrics);
    
    // Step 4: Save results
    if (outputFile) {
      await FileSystem.writeFile(outputFile, JSON.stringify({
        processedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        sessions: sessionsWithMetrics,
        insights
      }, null, 2));
      
      console.log(`Results saved to ${outputFile}`);
    }
    
    // Step 5: Display summary
    console.log('\n=== Processing Summary ===');
    console.log(`Total processing time: ${Date.now() - startTime}ms`);
    console.log(`Sessions analyzed: ${insights.totalSessions}`);
    console.log(`Unique users: ${insights.totalUsers}`);
    console.log(`Average session duration: ${(insights.averageSessionDuration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`Average events per session: ${insights.averageEventsPerSession.toFixed(2)}`);
    
    console.log('\n=== Top Events ===');
    insights.topEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.event}: ${event.count} occurrences`);
    });
    
    console.log('\n=== Conversion Funnel ===');
    console.log(`Pageview Rate: ${insights.conversionFunnel.pageviewRate}`);
    console.log(`Click Rate: ${insights.conversionFunnel.clickRate}`);
    console.log(`Signup Rate: ${insights.conversionFunnel.signupRate}`);
    console.log(`Purchase Rate: ${insights.conversionFunnel.purchaseRate}`);
    
  } catch (error) {
    console.error('Pipeline error:', error.message);
    throw error;
  }
}

// Stream processing example
async function processLiveStream(streamUrl: string): Promise<void> {
  console.log('Starting real-time stream processing...');
  
  const processor = new StreamProcessor()
    .transform(parseCSVLine)
    .transform(validateEvent)
    .filter(event => ['click', 'purchase'].includes(event.event))
    .aggregate(aggregateBySession)
    .aggregate(sessions => sessions.map(calculateMetrics));
  
  // Simulate real-time data stream
  async function* createDataStream() {
    const response = await HTTP.get(streamUrl);
    const lines = response.text().split('\n');
    
    for (const line of lines) {
      if (line.trim() !== '') {
        yield line;
        // Simulate real-time delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  const results = await processor.process(createDataStream());
  console.log(`Processed ${results.length} session records from stream`);
}

export { 
  DataProcessor, 
  StreamProcessor, 
  DataAnalyzer, 
  processDataPipeline, 
  processLiveStream 
};

// Example usage
if (import.meta.main) {
  const inputFile = process.argv[2] || 'sample-data.csv';
  const outputFile = process.argv[3] || 'processed-data.json';
  
  processDataPipeline(inputFile, outputFile)
    .then(() => console.log('Pipeline completed successfully'))
    .catch(error => console.error('Pipeline failed:', error));
}