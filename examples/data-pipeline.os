// Data Processing Pipeline with Functional Programming
// Demonstrates: Stream processing, Functional composition, Error handling, Performance optimization

import { FileSystem, Stream, HTTP, Database } from 'stdlib';

// Functional utilities for data processing
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

const curry = (fn) => (...args) => 
  args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

// Data transformation functions
const parseCSVLine = (line: string) => {
  const fields = line.split(',').map(field => field.trim().replace(/^"(.*)"$/, '$1'));
  return {
    timestamp: new Date(fields[0]),
    userId: parseInt(fields[1]),
    event: fields[2],
    data: fields[3] ? JSON.parse(fields[3]) : null,
    sessionId: fields[4]
  };
};

const validateEvent = (event: any) => {
  if (!event.timestamp || isNaN(event.timestamp.getTime())) {
    throw new Error(`Invalid timestamp: ${event.timestamp}`);
  }
  
  if (!event.userId || typeof event.userId !== 'number') {
    throw new Error(`Invalid userId: ${event.userId}`);
  }
  
  if (!event.event || typeof event.event !== 'string') {
    throw new Error(`Invalid event type: ${event.event}`);
  }
  
  return event;
};

const enrichWithUserData = curry(async (userCache: Map<number, any>, event: any) => {
  if (!userCache.has(event.userId)) {
    // Fetch user data from database
    const user = await Database.query(User)
      .where(u => u.id === event.userId)
      .first();
    
    if (user) {
      userCache.set(event.userId, user);
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