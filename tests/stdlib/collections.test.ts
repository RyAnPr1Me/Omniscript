import { List, Map } from '../../src/stdlib/collections';
import { describe, expect, test } from '@jest/globals';

describe('Standard Library - Collections', () => {
  test('List operations', async () => {
    const list = new List<number>();
    await list.push(1);
    expect(await list.pop()).toBe(1);
  });

  test('Map operations', async () => {
    const map = new Map<string, number>();
    await map.set('one', 1);
    const value = await map.get('one');
    expect(value).toBe(1);
  });
});
