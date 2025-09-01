/**
 * Performance monitoring and metrics for OmniCodec
 */

import { debug } from '../debug';

export interface PerformanceMetrics {
  operationType: 'encode' | 'decode';
  mediaType: 'audio' | 'video';
  inputSize: number;
  outputSize: number;
  compressionRatio: number;
  duration: number;
  simdEnabled: boolean;
  quality: number;
  timestamp: number;
}

export interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  averageCompressionRatio: number;
  simdPerformanceGain: number;
  memoryUsage: number;
  errors: number;
}

export interface SystemMetrics {
  cpuUsage?: number;
  memoryUsage: number;
  availableMemory: number;
  timestamp: number;
}

/**
 * Performance monitoring and metrics collection for production environments
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private errors: number = 0;
  private maxMetrics: number;
  private monitoringEnabled: boolean;

  constructor(maxMetrics: number = 1000, enabled: boolean = true) {
    this.maxMetrics = maxMetrics;
    this.monitoringEnabled = enabled;
    
    if (enabled) {
      debug.info('Media', 'Performance monitoring enabled');
    }
  }

  /**
   * Start measuring a performance operation
   */
  startMeasurement(): PerformanceMeasurement {
    return new PerformanceMeasurement(this);
  }

  /**
   * Record a completed operation
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    if (!this.monitoringEnabled) return;

    this.metrics.push(metrics);

    // Cleanup old metrics if we exceed the limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    debug.debug('Media', `Recorded performance metrics: ${metrics.operationType} ${metrics.mediaType} - ${metrics.duration}ms`);
  }

  /**
   * Record an error
   */
  recordError(): void {
    this.errors++;
  }

  /**
   * Get comprehensive performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        averageCompressionRatio: 0,
        simdPerformanceGain: 0,
        memoryUsage: this.getMemoryUsage(),
        errors: this.errors
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / this.metrics.length;

    const totalCompressionRatio = this.metrics.reduce((sum, m) => sum + m.compressionRatio, 0);
    const averageCompressionRatio = totalCompressionRatio / this.metrics.length;

    // Calculate SIMD performance gain
    const simdMetrics = this.metrics.filter(m => m.simdEnabled);
    const nonSimdMetrics = this.metrics.filter(m => !m.simdEnabled);
    
    let simdPerformanceGain = 0;
    if (simdMetrics.length > 0 && nonSimdMetrics.length > 0) {
      const avgSimdDuration = simdMetrics.reduce((sum, m) => sum + m.duration, 0) / simdMetrics.length;
      const avgNonSimdDuration = nonSimdMetrics.reduce((sum, m) => sum + m.duration, 0) / nonSimdMetrics.length;
      simdPerformanceGain = ((avgNonSimdDuration - avgSimdDuration) / avgNonSimdDuration) * 100;
    }

    return {
      totalOperations: this.metrics.length,
      averageDuration,
      averageCompressionRatio,
      simdPerformanceGain,
      memoryUsage: this.getMemoryUsage(),
      errors: this.errors
    };
  }

  /**
   * Get stats filtered by operation type
   */
  getStatsByOperation(operationType: 'encode' | 'decode'): PerformanceStats {
    const filtered = this.metrics.filter(m => m.operationType === operationType);
    const originalMetrics = this.metrics;
    this.metrics = filtered;
    const stats = this.getStats();
    this.metrics = originalMetrics;
    return stats;
  }

  /**
   * Get stats filtered by media type
   */
  getStatsByMediaType(mediaType: 'audio' | 'video'): PerformanceStats {
    const filtered = this.metrics.filter(m => m.mediaType === mediaType);
    const originalMetrics = this.metrics;
    this.metrics = filtered;
    const stats = this.getStats();
    this.metrics = originalMetrics;
    return stats;
  }

  /**
   * Get recent metrics (last N operations)
   */
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(windowSize: number = 100): {
    durationTrend: number;
    compressionTrend: number;
    errorRate: number;
  } {
    if (this.metrics.length < windowSize) {
      return { durationTrend: 0, compressionTrend: 0, errorRate: 0 };
    }

    const recent = this.metrics.slice(-windowSize);
    const older = this.metrics.slice(-windowSize * 2, -windowSize);

    const recentAvgDuration = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
    const olderAvgDuration = older.reduce((sum, m) => sum + m.duration, 0) / older.length;
    
    const recentAvgCompression = recent.reduce((sum, m) => sum + m.compressionRatio, 0) / recent.length;
    const olderAvgCompression = older.reduce((sum, m) => sum + m.compressionRatio, 0) / older.length;

    const durationTrend = ((recentAvgDuration - olderAvgDuration) / olderAvgDuration) * 100;
    const compressionTrend = ((recentAvgCompression - olderAvgCompression) / olderAvgCompression) * 100;
    const errorRate = (this.errors / this.metrics.length) * 100;

    return { durationTrend, compressionTrend, errorRate };
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    return {
      memoryUsage: this.getMemoryUsage(),
      availableMemory: this.getAvailableMemory(),
      timestamp: Date.now()
    };
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(): {
    summary: PerformanceStats;
    recent: PerformanceMetrics[];
    trends: any;
    system: SystemMetrics;
  } {
    return {
      summary: this.getStats(),
      recent: this.getRecentMetrics(20),
      trends: this.getPerformanceTrends(),
      system: this.getSystemMetrics()
    };
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.errors = 0;
    debug.info('Media', 'Performance metrics cleared');
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    debug.info('Media', `Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current memory usage (rough estimate)
   */
  private getMemoryUsage(): number {
    // In Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    
    // In browser environment (rough estimate)
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    
    return 0;
  }

  /**
   * Get available memory (rough estimate)
   */
  private getAvailableMemory(): number {
    // In Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      return mem.heapTotal - mem.heapUsed;
    }
    
    // In browser environment
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      return (mem.totalJSHeapSize || 0) - (mem.usedJSHeapSize || 0);
    }
    
    return 0;
  }
}

/**
 * Helper class for measuring individual operations
 */
export class PerformanceMeasurement {
  private startTime: number;
  private monitor: PerformanceMonitor;

  constructor(monitor: PerformanceMonitor) {
    this.monitor = monitor;
    this.startTime = performance.now();
  }

  /**
   * Complete the measurement and record metrics
   */
  complete(
    operationType: 'encode' | 'decode',
    mediaType: 'audio' | 'video',
    inputSize: number,
    outputSize: number,
    simdEnabled: boolean = false,
    quality: number = 85
  ): void {
    const duration = performance.now() - this.startTime;
    const compressionRatio = outputSize / inputSize;

    const metrics: PerformanceMetrics = {
      operationType,
      mediaType,
      inputSize,
      outputSize,
      compressionRatio,
      duration,
      simdEnabled,
      quality,
      timestamp: Date.now()
    };

    this.monitor.recordMetrics(metrics);
  }

  /**
   * Record an error and abort the measurement
   */
  error(): void {
    this.monitor.recordError();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();