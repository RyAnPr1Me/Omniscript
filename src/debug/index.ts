/**
 * Centralized debug logging system for Omniscript
 */

export enum DebugLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export class DebugLogger {
  private static instance: DebugLogger;
  private debugLevel: DebugLevel = DebugLevel.ERROR;
  private enabledComponents: Set<string> = new Set();

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  setLevel(level: DebugLevel): void {
    this.debugLevel = level;
  }

  enableComponent(component: string): void {
    this.enabledComponents.add(component);
  }

  disableComponent(component: string): void {
    this.enabledComponents.delete(component);
  }

  enableAllComponents(): void {
    this.enabledComponents.add('*');
  }

  isEnabled(component: string, level: DebugLevel): boolean {
    return (
      level <= this.debugLevel &&
      (this.enabledComponents.has('*') || this.enabledComponents.has(component))
    );
  }

  error(component: string, message: string, ...args: any[]): void {
    if (this.isEnabled(component, DebugLevel.ERROR)) {
      console.error(`[${component}] ERROR: ${message}`, ...args);
    }
  }

  warn(component: string, message: string, ...args: any[]): void {
    if (this.isEnabled(component, DebugLevel.WARN)) {
      console.warn(`[${component}] WARN: ${message}`, ...args);
    }
  }

  info(component: string, message: string, ...args: any[]): void {
    if (this.isEnabled(component, DebugLevel.INFO)) {
      console.info(`[${component}] INFO: ${message}`, ...args);
    }
  }

  debug(component: string, message: string, ...args: any[]): void {
    if (this.isEnabled(component, DebugLevel.DEBUG)) {
      console.debug(`[${component}] DEBUG: ${message}`, ...args);
    }
  }

  trace(component: string, message: string, ...args: any[]): void {
    if (this.isEnabled(component, DebugLevel.TRACE)) {
      console.trace(`[${component}] TRACE: ${message}`, ...args);
    }
  }

  time(component: string, label: string): void {
    if (this.isEnabled(component, DebugLevel.DEBUG)) {
      console.time(`[${component}] ${label}`);
    }
  }

  timeEnd(component: string, label: string): void {
    if (this.isEnabled(component, DebugLevel.DEBUG)) {
      console.timeEnd(`[${component}] ${label}`);
    }
  }
}

// Global debug instance
export const debug = DebugLogger.getInstance();

// Helper functions for common debugging scenarios
export function enableDebugger(): void {
  debug.setLevel(DebugLevel.DEBUG);
  debug.enableAllComponents();
}

export function enableComponentDebug(component: string, level: DebugLevel = DebugLevel.DEBUG): void {
  debug.setLevel(level);
  debug.enableComponent(component);
}

export function configureDebugFromEnv(): void {
  const debugLevel = process.env.OMNISCRIPT_DEBUG_LEVEL;
  const debugComponents = process.env.OMNISCRIPT_DEBUG_COMPONENTS;

  if (debugLevel) {
    const level = parseInt(debugLevel) as DebugLevel;
    debug.setLevel(level);
  }

  if (debugComponents) {
    const components = debugComponents.split(',');
    components.forEach(comp => debug.enableComponent(comp.trim()));
  }
}

// Initialize from environment
configureDebugFromEnv();