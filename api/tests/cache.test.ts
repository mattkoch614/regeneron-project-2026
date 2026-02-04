import { cache, cacheGet } from '../src/cache';

describe('Cache', () => {
  beforeEach(() => {
    cache.flushAll();
  });

  it('should return cached: true on second request', async () => {
    let fetchCount = 0;
    const fetchFn = async () => {
      fetchCount++;
      return { value: 'test-data' };
    };

    const first = await cacheGet('test-key', fetchFn);
    const second = await cacheGet('test-key', fetchFn);

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(fetchCount).toBe(1); // fetchFn only called once
    expect(second.data).toEqual({ value: 'test-data' });
  });

  it('should respect TTL and expire cached data', async () => {
    const shortTtl = 1; // 1 second
    let fetchCount = 0;
    const fetchFn = async () => {
      fetchCount++;
      return { value: `fetch-${fetchCount}` };
    };

    const first = await cacheGet('ttl-key', fetchFn, shortTtl);
    expect(first.cached).toBe(false);
    expect(first.data).toEqual({ value: 'fetch-1' });

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    const second = await cacheGet('ttl-key', fetchFn, shortTtl);
    expect(second.cached).toBe(false); // Cache expired, fetched again
    expect(second.data).toEqual({ value: 'fetch-2' });
    expect(fetchCount).toBe(2);
  });
});
