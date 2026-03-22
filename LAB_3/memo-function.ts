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