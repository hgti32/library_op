type EvictionStrategy = 'LRU' | 'LFU' | 'TTL' | 'CUSTOM';

interface MemoOptions<TArgs extends any[], TResult> {
  maxSize?: number;
  strategy?: EvictionStrategy;
  ttl?: number;
  customEviction?: (cache: Map<string, CacheEntry<TResult>>) => string;
}

interface CacheEntry<TResult> {
  value: TResult;
  lastAccessed: number;
  accessCount: number;
  createdAt: number;
}


function memoize<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
  options: MemoOptions<TArgs, TResult> = {}
) {
  const cache = new Map<string, CacheEntry<TResult>>();
  const { maxSize = Infinity, strategy = 'LRU', ttl, customEviction } = options;

  const pruneCache = () => {
    if (cache.size <= maxSize) return;

    let keyToDelete: string | null = null;

    if (strategy === 'CUSTOM' && customEviction) {
      keyToDelete = customEviction(cache);
    } else if (strategy === 'LRU') {
      let oldest = Infinity;
      for (const [key, entry] of cache.entries()) {
        if (entry.lastAccessed < oldest) {
          oldest = entry.lastAccessed;
          keyToDelete = key;
        }
      }
    } else if (strategy === 'LFU') {
      let minCalls = Infinity;
      for (const [key, entry] of cache.entries()) {
        if (entry.accessCount < minCalls) {
          minCalls = entry.accessCount;
          keyToDelete = key;
        }
      }
    }

    if (keyToDelete) cache.delete(keyToDelete);
  };

  return (...args: TArgs): TResult => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const entry = cache.get(key);

    if (entry && strategy === 'TTL' && ttl && now - entry.createdAt > ttl) {
      cache.delete(key);
    } else if (entry) {
      entry.lastAccessed = now;
      entry.accessCount++;
      return entry.value;
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      pruneCache();
    }

    cache.set(key, {
      value: result,
      lastAccessed: now,
      accessCount: 1,
      createdAt: now,
    });

    return result;
  };
}

const slowSum = (a: number, b: number) => {
  console.log('--- Обчислення...');
  return a + b;
};

const memoizedLRU = memoize(slowSum, { maxSize: 2, strategy: 'LRU' });
memoizedLRU(1, 2);
memoizedLRU(3, 4);
memoizedLRU(1, 2);
memoizedLRU(5, 6);

const memoizedTTL = memoize(slowSum, { strategy: 'TTL', ttl: 1000 });
memoizedTTL(10, 10);
setTimeout(() => console.log("Через 2 сек:", memoizedTTL(10, 10)), 2000);