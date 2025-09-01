import { Json } from '../../src/stdlib/json';
import { JSON as JsonAlias } from '../../src/stdlib/index';
import { describe, expect, test } from '@jest/globals';

describe('Standard Library - Json', () => {
  const testObject = {
    name: 'test',
    value: 42,
    nested: {
      array: [1, 2, 3],
      bool: true
    }
  };

  const testJson = '{"name":"test","value":42,"nested":{"array":[1,2,3],"bool":true}}';

  test('parse JSON string', () => {
    const result = Json.parse(testJson);
    expect(result).toEqual(testObject);
  });

  test('stringify object to JSON', () => {
    const result = Json.stringify(testObject);
    expect(result).toBe(testJson);
  });

  test('pretty print JSON', () => {
    const result = Json.prettyPrint(testObject, 2);
    expect(result).toContain('\n');
    expect(result).toContain('  ');
  });

  test('safeParse with valid JSON', () => {
    const result = Json.safeParse(testJson, null);
    expect(result).toEqual(testObject);
  });

  test('safeParse with invalid JSON returns default', () => {
    const defaultValue = { error: true };
    const result = Json.safeParse('invalid json', defaultValue);
    expect(result).toEqual(defaultValue);
  });

  test('isValid checks JSON validity', () => {
    expect(Json.isValid(testJson)).toBe(true);
    expect(Json.isValid('invalid json')).toBe(false);
    expect(Json.isValid('{"valid": true}')).toBe(true);
    expect(Json.isValid('{"invalid": }')).toBe(false);
  });

  test('clone object deeply', () => {
    const cloned = Json.clone(testObject);
    expect(cloned).toEqual(testObject);
    expect(cloned).not.toBe(testObject);
    expect(cloned.nested).not.toBe(testObject.nested);
  });

  test('merge objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = Json.merge(target, source);
    
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
    expect(result).not.toBe(target); // Should not mutate original
  });

  test('deep merge objects', () => {
    const target = { 
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark' }
    };
    const source = {
      user: { age: 31, email: 'john@example.com' },
      settings: { language: 'en' }
    };
    
    const result = Json.deepMerge(target, source);
    expect(result).toEqual({
      user: { name: 'John', age: 31, email: 'john@example.com' },
      settings: { theme: 'dark', language: 'en' }
    });
  });

  test('getPath extracts value at path', () => {
    expect(Json.getPath(testObject, 'name')).toBe('test');
    expect(Json.getPath(testObject, 'nested.array')).toEqual([1, 2, 3]);
    expect(Json.getPath(testObject, 'nested.bool')).toBe(true);
    expect(Json.getPath(testObject, 'nonexistent')).toBeUndefined();
    expect(Json.getPath(testObject, 'nested.nonexistent')).toBeUndefined();
  });

  test('setPath sets value at path', () => {
    const obj = Json.clone(testObject) as any;
    Json.setPath(obj, 'nested.newProp', 'newValue');
    expect(obj.nested.newProp).toBe('newValue');
    
    Json.setPath(obj, 'completely.new.path', 'value');
    expect(obj.completely.new.path).toBe('value');
  });

  test('removePath removes value at path', () => {
    const obj = Json.clone(testObject) as any;
    Json.removePath(obj, 'nested.bool');
    expect(obj.nested.bool).toBeUndefined();
    
    Json.removePath(obj, 'nonexistent.path');
    // Should not throw error
  });

  test('flatten nested object', () => {
    const flattened = Json.flatten(testObject);
    expect(flattened).toEqual({
      'name': 'test',
      'value': 42,
      'nested.array': [1, 2, 3],
      'nested.bool': true
    });
  });

  test('unflatten flattened object', () => {
    const flattened = {
      'user.name': 'John',
      'user.age': 30,
      'settings.theme': 'dark'
    };
    
    const unflattened = Json.unflatten(flattened);
    expect(unflattened).toEqual({
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark' }
    });
  });

  test('getAllKeys returns all nested keys', () => {
    const keys = Json.getAllKeys(testObject);
    expect(keys).toContain('name');
    expect(keys).toContain('value');
    expect(keys).toContain('nested');
    expect(keys).toContain('nested.array');
    expect(keys).toContain('nested.bool');
  });

  test('equals compares objects for deep equality', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    const obj3 = { a: 1, b: { c: 3 } };
    
    expect(Json.equals(obj1, obj2)).toBe(true);
    expect(Json.equals(obj1, obj3)).toBe(false);
  });

  test('JSON alias works', () => {
    expect(JsonAlias).toBe(Json);
  });

  test('error handling for invalid stringify', () => {
    const circular: any = {};
    circular.self = circular;
    
    expect(() => Json.stringify(circular)).toThrow('Serialization failed');
  });

  test('error handling for invalid parse', () => {
    expect(() => Json.parse('invalid json')).toThrow('Invalid JSON');
  });

  test('parse with reviver function', () => {
    const jsonWithDates = '{"date":"2023-01-01T00:00:00.000Z","value":42}';
    const result = Json.parse(jsonWithDates, {
      reviver: (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      }
    });
    
    expect(result.date).toBeInstanceOf(Date);
    expect(result.value).toBe(42);
  });

  test('stringify with replacer and space', () => {
    const result = Json.stringify(testObject, {
      replacer: (key, value) => {
        if (key === 'value') return undefined; // Remove this property
        return value;
      },
      space: 2
    });
    
    expect(result).not.toContain('"value"');
    expect(result).toContain('\n');
  });
});