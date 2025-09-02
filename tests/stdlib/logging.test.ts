import { Logger, LoggerFactory, MemoryOutput, LogLevel } from '../../src/stdlib/logging';

describe('Logging Library', () => {
  describe('Basic Logging', () => {
    test('should log messages at different levels', () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'debug',
        outputs: [memoryOutput]
      });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(4);
      expect(entries[0].level).toBe('debug');
      expect(entries[1].level).toBe('info');
      expect(entries[2].level).toBe('warn');
      expect(entries[3].level).toBe('error');
    });

    test('should respect log level filtering', () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'warn',
        outputs: [memoryOutput]
      });

      logger.debug('Debug message'); // Should be filtered out
      logger.info('Info message'); // Should be filtered out
      logger.warn('Warning message'); // Should be logged
      logger.error('Error message'); // Should be logged

      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].level).toBe('warn');
      expect(entries[1].level).toBe('error');
    });

    test('should include metadata in log entries', () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'info',
        outputs: [memoryOutput]
      });

      logger.info('Test message', { userId: 123, action: 'login' });

      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].metadata).toEqual({ userId: 123, action: 'login' });
    });

    test('should handle errors with stack traces', () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'error',
        outputs: [memoryOutput],
        enableStackTrace: true
      });

      const error = new Error('Test error');
      logger.error('Something went wrong', error);

      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].error).toBe(error);
      expect(entries[0].message).toBe('Something went wrong');
    });
  });

  describe('Child Loggers', () => {
    test('should create child loggers with extended context', () => {
      const memoryOutput = new MemoryOutput(100);
      const parentLogger = new Logger({
        level: 'info',
        context: 'parent',
        outputs: [memoryOutput]
      });

      const childLogger = parentLogger.child('child', { module: 'test' });
      childLogger.info('Child message');

      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].context).toBe('parent.child');
      expect(entries[0].metadata).toEqual({ module: 'test' });
    });

    test('should inherit correlation ID from parent', () => {
      const memoryOutput = new MemoryOutput(100);
      const parentLogger = new Logger({
        level: 'info',
        outputs: [memoryOutput]
      });

      parentLogger.setCorrelationId('test-correlation-123');
      const childLogger = parentLogger.child('child');
      childLogger.info('Child message');

      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].traceId).toBe('test-correlation-123');
    });
  });

  describe('Performance Utilities', () => {
    test('should measure timing with time() method', (done) => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'info',
        outputs: [memoryOutput]
      });

      const stopTimer = logger.time('test-operation');
      
      setTimeout(() => {
        stopTimer();
        
        const entries = memoryOutput.getEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0].message).toContain('Timer: test-operation');
        expect(entries[0].metadata?.duration).toMatch(/\d+ms/);
        done();
      }, 10);
    });

    test('should profile async operations', async () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'debug', // Changed to debug to capture starting message
        outputs: [memoryOutput]
      });

      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      };

      const result = await logger.profile('async-test', asyncOperation);
      
      expect(result).toBe('result');
      
      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(2); // Start and completion messages
      expect(entries[0].message).toContain('Starting: async-test');
      expect(entries[1].message).toContain('Completed: async-test');
      expect(entries[1].metadata?.success).toBe(true);
    });

    test('should profile failed operations', async () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'debug',
        outputs: [memoryOutput]
      });

      const failingOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Operation failed');
      };

      try {
        await logger.profile('failing-test', failingOperation);
      } catch (error: any) {
        expect(error.message).toBe('Operation failed');
      }
      
      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].message).toContain('Starting: failing-test');
      expect(entries[1].message).toContain('Failed: failing-test');
      expect(entries[1].metadata?.success).toBe(false);
      expect(entries[1].level).toBe('error');
    });
  });

  describe('Memory Output', () => {
    test('should store entries in memory with size limit', () => {
      const memoryOutput = new MemoryOutput(3); // Limit to 3 entries
      const logger = new Logger({
        level: 'info',
        outputs: [memoryOutput]
      });

      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      logger.info('Message 4'); // Should evict Message 1

      const entries = memoryOutput.getEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0].message).toBe('Message 2');
      expect(entries[1].message).toBe('Message 3');
      expect(entries[2].message).toBe('Message 4');
    });

    test('should filter entries by level', () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'debug',
        outputs: [memoryOutput]
      });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      const errorEntries = memoryOutput.getEntriesByLevel('error');
      expect(errorEntries).toHaveLength(1);
      expect(errorEntries[0].message).toBe('Error message');

      const infoEntries = memoryOutput.getEntriesByLevel('info');
      expect(infoEntries).toHaveLength(1);
      expect(infoEntries[0].message).toBe('Info message');
    });

    test('should provide entry count', () => {
      const memoryOutput = new MemoryOutput(100);
      const logger = new Logger({
        level: 'info',
        outputs: [memoryOutput]
      });

      expect(memoryOutput.count()).toBe(0);

      logger.info('Message 1');
      logger.info('Message 2');

      expect(memoryOutput.count()).toBe(2);

      memoryOutput.clear();
      expect(memoryOutput.count()).toBe(0);
    });
  });

  describe('Logger Factory', () => {
    test('should create console logger', () => {
      const logger = LoggerFactory.createConsoleLogger('debug');
      expect(logger).toBeInstanceOf(Logger);
    });

    test('should create development logger', () => {
      const logger = LoggerFactory.createDevelopmentLogger('test-app');
      expect(logger).toBeInstanceOf(Logger);
    });

    test('should create production logger', () => {
      const logger = LoggerFactory.createProductionLogger('prod-service');
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('Formatters', () => {
    test('should format log entries as JSON', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { JsonFormatter } = require('../../src/stdlib/logging');
      const formatter = new JsonFormatter();
      
      const entry = {
        timestamp: { toISO: () => '2023-01-01T00:00:00.000Z' },
        level: 'info' as LogLevel,
        message: 'Test message',
        context: 'test',
        metadata: { key: 'value' }
      };

      const formatted = formatter.format(entry);
      expect(formatted).toEqual({
        timestamp: '2023-01-01T00:00:00.000Z',
        level: 'info',
        message: 'Test message',
        context: 'test',
        metadata: { key: 'value' },
        error: undefined,
        source: undefined,
        traceId: undefined,
        spanId: undefined
      });
    });

    test('should format log entries compactly', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { CompactFormatter } = require('../../src/stdlib/logging');
      const formatter = new CompactFormatter();
      
      const entry = {
        timestamp: { format: () => '12:34:56.789' },
        level: 'info' as LogLevel,
        message: 'Test message'
      };

      const formatted = formatter.format(entry);
      expect(formatted).toBe('12:34:56.789 I Test message');
    });
  });
});