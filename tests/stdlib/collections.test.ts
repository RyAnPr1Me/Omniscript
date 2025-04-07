import { List, Map } from '../../src/stdlib/collections';
import { describe, expect, test } from '@jest/globals';

describe('Standard Library - Collections', () => {
  test('List operations', () => {
    const list = new List<number>();
    list.push(1);
    expect(list.pop()).toBe(1);
  });

  test('Map operations', () => {
    const map = new Map<string, number>();
    map.set('one', 1);
    expect(map.get('one')).toBe(1);
  });
});
