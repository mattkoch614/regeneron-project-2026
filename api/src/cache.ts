import NodeCache from 'node-cache';

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10); // 1 hour default

export const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 120, // Check for expired keys every 2 minutes
});

// Cache-aside helper with hit tracking for observability
export async function cacheGet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<{ data: T; cached: boolean }> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return { data: cached, cached: true };
  }

  const data = await fetchFn();

  if (data !== null && data !== undefined) {
    cache.set(key, data, ttl);
  }

  return { data, cached: false };
}

export function cacheInvalidate(key: string): boolean {
  return cache.del(key) > 0;
}

export function cacheStats() {
  return cache.getStats();
}
