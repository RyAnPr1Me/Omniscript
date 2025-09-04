/**
 * Advanced logging library for Omniscript
 * Supports structured logging, multiple outputs, and log aggregation
 */

import { DateTime } from './datetime';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: DateTime;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  error?: Error;
  source?: {
    file?: string;
    line?: number;
    function?: string;
  };
  traceId?: string;
  spanId?: string;
}

export interface LogOutput {
  write(entry: LogEntry): Promise<void> | void;
  flush?(): Promise<void> | void;
  close?(): Promise<void> | void;
}

export interface LoggerConfig {
  level: LogLevel;
  outputs: LogOutput[];
  context?: string;
  enableStackTrace?: boolean;
  enableDistributedTracing?: boolean;
  filters?: LogFilter[];
  formatters?: LogFormatter[];
}

export interface LogFilter {
  shouldLog(entry: LogEntry): boolean;
}

export interface LogFormatter {
  format(entry: LogEntry): string | object;
}

// Log levels with numeric values for comparison
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
};

export class Logger {
  private config: Required<LoggerConfig>;
  private correlationId?: string;
  private metadata: Record<string, any> = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level || 'info',
      outputs: config.outputs || [new ConsoleOutput()],
      context: config.context || 'default',
      enableStackTrace: config.enableStackTrace || false,
      enableDistributedTracing: config.enableDistributedTracing || false,
      filters: config.filters || [],
      formatters: config.formatters || []
    };
  }

  // Core logging methods
  trace(message: string, metadata?: Record<string, any>): void {
    this.log('trace', message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log('error', message, metadata, error);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log('fatal', message, metadata, error);
  }

  // Core log method
  private log(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: DateTime.now(),
      level,
      message,
      context: this.config.context,
      metadata: { ...this.metadata, ...metadata },
      error,
      traceId: this.correlationId
    };

    // Add stack trace if enabled
    if (this.config.enableStackTrace && level === 'error' || level === 'fatal') {
      entry.source = this.captureSource();
    }

    // Apply filters
    for (const filter of this.config.filters) {
      if (!filter.shouldLog(entry)) return;
    }

    // Send to outputs
    this.config.outputs.forEach(output => {
      try {
        output.write(entry);
      } catch (outputError) {
        console.error('Logger output error:', outputError);
      }
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private captureSource(): LogEntry['source'] {
    const stack = new Error().stack;
    if (!stack) return undefined;

    const lines = stack.split('\n');
    // Skip the first few lines to get to the actual calling code
    const callerLine = lines[4] || '';
    
    const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):\d+\)/);
    if (match) {
      return {
        function: match[1],
        file: match[2],
        line: parseInt(match[3])
      };
    }

    return undefined;
  }

  // Configuration methods
  setLevel(level: LogLevel): this {
    this.config.level = level;
    return this;
  }

  setContext(context: string): this {
    this.config.context = context;
    return this;
  }

  addOutput(output: LogOutput): this {
    this.config.outputs.push(output);
    return this;
  }

  removeOutput(output: LogOutput): this {
    const index = this.config.outputs.indexOf(output);
    if (index > -1) {
      this.config.outputs.splice(index, 1);
    }
    return this;
  }

  addFilter(filter: LogFilter): this {
    this.config.filters.push(filter);
    return this;
  }

  addFormatter(formatter: LogFormatter): this {
    this.config.formatters.push(formatter);
    return this;
  }

  // Correlation and metadata
  setCorrelationId(id: string): this {
    this.correlationId = id;
    return this;
  }

  addMetadata(key: string, value: any): this {
    this.metadata[key] = value;
    return this;
  }

  clearMetadata(): this {
    this.metadata = {};
    return this;
  }

  // Child logger
  child(context: string, metadata?: Record<string, any>): Logger {
    const childLogger = new Logger({
      ...this.config,
      context: `${this.config.context}.${context}`
    });
    
    if (metadata) {
      Object.assign(childLogger.metadata, metadata);
    }
    
    childLogger.correlationId = this.correlationId;
    return childLogger;
  }

  // Timing utilities
  time(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.info(`Timer: ${label}`, { duration: `${duration}ms` });
    };
  }

  async profile<T>(label: string, operation: () => Promise<T>): Promise<T> {
    const start = Date.now();
    this.debug(`Starting: ${label}`);
    
    try {
      const result = await operation();
      const duration = Date.now() - start;
      this.info(`Completed: ${label}`, { duration: `${duration}ms`, success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Failed: ${label}`, error as Error, { duration: `${duration}ms`, success: false });
      throw error;
    }
  }

  // Flush and cleanup
  async flush(): Promise<void> {
    const flushPromises = this.config.outputs
      .filter(output => output.flush)
      .map(output => output.flush!());
    
    await Promise.all(flushPromises);
  }

  async close(): Promise<void> {
    await this.flush();
    
    const closePromises = this.config.outputs
      .filter(output => output.close)
      .map(output => output.close!());
    
    await Promise.all(closePromises);
  }
}

// Built-in outputs
export class ConsoleOutput implements LogOutput {
  private formatter: LogFormatter;

  constructor(formatter?: LogFormatter) {
    this.formatter = formatter || new DefaultFormatter();
  }

  write(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    const message = typeof formatted === 'string' ? formatted : JSON.stringify(formatted);

    switch (entry.level) {
      case 'trace':
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'fatal':
        console.error(message);
        break;
    }
  }
}

export class FileOutput implements LogOutput {
  private buffer: string[] = [];
  private lastFlush = Date.now();
  private readonly flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private filename: string,
    private formatter: LogFormatter = new JsonFormatter(),
    private maxBufferSize = 100
  ) {
    // Only set up auto-flush if not in CLI or test context
    const isCLI = process.argv.some(arg => arg.includes('cli.js') || arg.includes('bin/cli'));
    const isTest = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('jest'));
    
    if (!isCLI && !isTest) {
      // Auto-flush periodically with unref() to allow process to exit
      this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
      this.flushTimer.unref();
    }
  }

  write(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    const line = typeof formatted === 'string' ? formatted : JSON.stringify(formatted);
    
    this.buffer.push(line);
    
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const lines = this.buffer.join('\n') + '\n';
    this.buffer = [];

    // In a real implementation, this would write to the filesystem
    // For now, we'll simulate with a debug message
    console.debug(`[FileOutput] Writing ${lines.length} chars to ${this.filename}`);
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    await this.flush();
  }
}

export class MemoryOutput implements LogOutput {
  private entries: LogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;
  }

  write(entry: LogEntry): void {
    this.entries.push(entry);
    
    if (this.entries.length > this.maxEntries) {
      this.entries.shift(); // Remove oldest entry
    }
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter(entry => entry.level === level);
  }

  getEntriesSince(timestamp: DateTime): LogEntry[] {
    return this.entries.filter(entry => entry.timestamp.isAfter(timestamp));
  }

  clear(): void {
    this.entries = [];
  }

  count(): number {
    return this.entries.length;
  }
}

// Built-in formatters
export class DefaultFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.format('YYYY-MM-DD HH:mm:ss.SSS');
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? `[${entry.context}]` : '';
    
    let message = `${timestamp} ${level} ${context} ${entry.message}`;
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      message += ` ${JSON.stringify(entry.metadata)}`;
    }
    
    if (entry.error) {
      message += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return message;
  }
}

export class JsonFormatter implements LogFormatter {
  format(entry: LogEntry): object {
    return {
      timestamp: entry.timestamp.toISO(),
      level: entry.level,
      message: entry.message,
      context: entry.context,
      metadata: entry.metadata,
      error: entry.error ? {
        message: entry.error.message,
        stack: entry.error.stack,
        name: entry.error.name
      } : undefined,
      source: entry.source,
      traceId: entry.traceId,
      spanId: entry.spanId
    };
  }
}

export class CompactFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const time = entry.timestamp.format('HH:mm:ss.SSS');
    const level = entry.level.charAt(0).toUpperCase();
    return `${time} ${level} ${entry.message}`;
  }
}

// Built-in filters
export class LevelFilter implements LogFilter {
  constructor(private minLevel: LogLevel) {}

  shouldLog(entry: LogEntry): boolean {
    return LOG_LEVELS[entry.level] >= LOG_LEVELS[this.minLevel];
  }
}

export class ContextFilter implements LogFilter {
  constructor(
    private allowedContexts: string[],
    private mode: 'include' | 'exclude' = 'include'
  ) {}

  shouldLog(entry: LogEntry): boolean {
    const isInList = this.allowedContexts.includes(entry.context || '');
    return this.mode === 'include' ? isInList : !isInList;
  }
}

export class RateLimitFilter implements LogFilter {
  private counts = new Map<string, { count: number; window: number }>();
  
  constructor(
    private maxPerWindow: number,
    private windowMs: number = 60000 // 1 minute
  ) {}

  shouldLog(entry: LogEntry): boolean {
    const key = `${entry.context}:${entry.level}:${entry.message}`;
    const now = Date.now();
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
    
    const current = this.counts.get(key);
    
    if (!current || current.window !== windowStart) {
      this.counts.set(key, { count: 1, window: windowStart });
      return true;
    }
    
    if (current.count >= this.maxPerWindow) {
      return false;
    }
    
    current.count++;
    return true;
  }
}

// Utility functions for creating common logger configurations
export class LoggerFactory {
  static createConsoleLogger(level: LogLevel = 'info'): Logger {
    return new Logger({
      level,
      outputs: [new ConsoleOutput()]
    });
  }

  static createFileLogger(filename: string, level: LogLevel = 'info'): Logger {
    return new Logger({
      level,
      outputs: [new FileOutput(filename)]
    });
  }

  static createDualLogger(filename: string, level: LogLevel = 'info'): Logger {
    return new Logger({
      level,
      outputs: [
        new ConsoleOutput(new CompactFormatter()),
        new FileOutput(filename, new JsonFormatter())
      ]
    });
  }

  static createProductionLogger(serviceName: string): Logger {
    return new Logger({
      level: 'info',
      context: serviceName,
      enableStackTrace: true,
      enableDistributedTracing: true,
      outputs: [
        new ConsoleOutput(new JsonFormatter()),
        new FileOutput(`logs/${serviceName}.log`, new JsonFormatter())
      ],
      filters: [
        new RateLimitFilter(100, 60000) // Max 100 logs per minute for same message
      ]
    });
  }

  static createDevelopmentLogger(context: string = 'dev'): Logger {
    return new Logger({
      level: 'debug',
      context,
      enableStackTrace: true,
      outputs: [
        new ConsoleOutput(new DefaultFormatter()),
        new MemoryOutput(500) // Keep last 500 entries in memory for debugging
      ]
    });
  }
}

// Global logger instance
export const logger = LoggerFactory.createDevelopmentLogger('omniscript');

// Convenience exports
export { Logger as Log };
export default logger;