import { debug } from '../../debug';

// Metadata storage for decorators
const metadataMap = new WeakMap<any, Map<string, any>>();

export function getMetadata(target: any, key?: string): any {
  const metadata = metadataMap.get(target) || new Map();
  return key ? metadata.get(key) : Object.fromEntries(metadata);
}

export function setMetadata(target: any, key: string, value: any): void {
  if (!metadataMap.has(target)) {
    metadataMap.set(target, new Map());
  }
  metadataMap.get(target)!.set(key, value);
}

// Database field decorators
export function id(target: any, propertyKey: string): void {
  debug.debug('Database', `@id decorator applied to ${propertyKey}`);
  setMetadata(target.constructor, `field:${propertyKey}`, {
    type: 'id',
    primary: true,
    autoIncrement: true
  });
}

export function field(options: { type?: string; nullable?: boolean; unique?: boolean } = {}) {
  return function(target: any, propertyKey: string): void {
    debug.debug('Database', `@field decorator applied to ${propertyKey}`);
    setMetadata(target.constructor, `field:${propertyKey}`, {
      type: 'field',
      ...options
    });
  };
}

export function relation(options: { relationType: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany'; target: () => any }) {
  return function(target: any, propertyKey: string): void {
    debug.debug('Database', `@relation decorator applied to ${propertyKey}`);
    setMetadata(target.constructor, `field:${propertyKey}`, {
      type: 'relation',
      relationType: options.relationType,
      target: options.target
    });
  };
}

export function timestamp(options: { autoCreate?: boolean; autoUpdate?: boolean } = {}) {
  return function(target: any, propertyKey: string): void {
    debug.debug('Database', `@timestamp decorator applied to ${propertyKey}`);
    setMetadata(target.constructor, `field:${propertyKey}`, {
      type: 'timestamp',
      autoCreate: options.autoCreate !== false,
      autoUpdate: options.autoUpdate !== false
    });
  };
}

// Component system decorators
export function component(target: any): any {
  debug.debug('Component', `@component decorator applied to ${target.name}`);
  setMetadata(target, 'component', true);
  return target;
}

export function state(target: any, propertyKey: string): void {
  debug.debug('Component', `@state decorator applied to ${propertyKey}`);
  setMetadata(target.constructor, `state:${propertyKey}`, true);
}

export function effect(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  debug.debug('Component', `@effect decorator applied to ${propertyKey}`);
  setMetadata(target.constructor, `effect:${propertyKey}`, true);
  
  const originalMethod = descriptor.value;
  descriptor.value = async function(...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      debug.error('Component', `Effect ${propertyKey} failed:`, error);
      throw error;
    }
  };
}

export function computed(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  debug.debug('Component', `@computed decorator applied to ${propertyKey}`);
  setMetadata(target.constructor, `computed:${propertyKey}`, true);
  
  const originalGetter = descriptor.get;
  if (originalGetter) {
    let cachedValue: any;
    let hasCache = false;
    
    descriptor.get = function() {
      if (!hasCache) {
        cachedValue = originalGetter.call(this);
        hasCache = true;
      }
      return cachedValue;
    };
  }
}