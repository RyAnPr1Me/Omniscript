# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [performance-monitor](#performance-monitor)

## performance-monitor

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/performance-monitor.ts`

### Classes

#### PerformanceMonitor

Performance monitoring and metrics collection for production environments

**Properties**:

- `metrics: PerformanceMetrics[]` - 
- `errors: number` - 
- `maxMetrics: number` - 
- `monitoringEnabled: boolean` - 

**Methods**:

##### startMeasurement

Start measuring a performance operation

**Signature**: `startMeasurement(): PerformanceMeasurement`

##### recordMetrics

Record a completed operation

**Signature**: `recordMetrics(metrics: PerformanceMetrics): void`

##### recordError

Record an error

**Signature**: `recordError(): void`

##### getStats

Get comprehensive performance statistics

**Signature**: `getStats(): PerformanceStats`

##### getStatsByOperation

Get stats filtered by operation type

**Signature**: `getStatsByOperation(operationType: 'encode' | 'decode'): PerformanceStats`

##### getStatsByMediaType

Get stats filtered by media type

**Signature**: `getStatsByMediaType(mediaType: 'audio' | 'video'): PerformanceStats`

##### getRecentMetrics

Get recent metrics (last N operations)

**Signature**: `getRecentMetrics(count: number = 10): PerformanceMetrics[]`

##### getPerformanceTrends

Get performance trends over time

**Signature**: `getPerformanceTrends(windowSize: number = 100):`

##### getSystemMetrics

Get system metrics

**Signature**: `getSystemMetrics(): SystemMetrics`

##### exportMetrics

Export metrics for external monitoring systems

**Signature**: `exportMetrics():`

##### clearMetrics

Clear all collected metrics

**Signature**: `clearMetrics(): void`

##### setEnabled

Enable or disable monitoring

**Signature**: `setEnabled(enabled: boolean): void`

##### getMemoryUsage

Get current memory usage (rough estimate)

**Signature**: `private getMemoryUsage(): number`

##### getAvailableMemory

Get available memory (rough estimate)

**Signature**: `private getAvailableMemory(): number`

#### PerformanceMeasurement

Helper class for measuring individual operations

**Properties**:

- `startTime: number` - 
- `monitor: PerformanceMonitor` - 

**Methods**:

##### complete

Complete the measurement and record metrics

**Signature**: `complete(
    operationType: 'encode' | 'decode',
    mediaType: 'audio' | 'video',
    inputSize: number,
    outputSize: number,
    simdEnabled: boolean = false,
    quality: number = 85
  ): void`

##### error

Record an error and abort the measurement

**Signature**: `error(): void`

### Interfaces

#### PerformanceMetrics

**Properties**:

- `operationType: 'encode' | 'decode'` - 
- `mediaType: 'audio' | 'video'` - 
- `inputSize: number` - 
- `outputSize: number` - 
- `compressionRatio: number` - 
- `duration: number` - 
- `simdEnabled: boolean` - 
- `quality: number` - 
- `timestamp: number` - 

#### PerformanceStats

**Properties**:

- `totalOperations: number` - 
- `averageDuration: number` - 
- `averageCompressionRatio: number` - 
- `simdPerformanceGain: number` - 
- `memoryUsage: number` - 
- `errors: number` - 

#### SystemMetrics

**Properties**:

- `cpuUsage: number` - 
- `memoryUsage: number` - 
- `availableMemory: number` - 
- `timestamp: number` - 


