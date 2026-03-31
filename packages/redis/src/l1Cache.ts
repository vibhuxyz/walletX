export class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }>;
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.cache = new Map();
    this.maxSize = maxSize;

    // Cleanup interval every 1 minute
    setInterval(() => this.cleanup(), 60000).unref();
  }

  set(key: string, value: any, ttlSeconds: number): void {
    if (this.cache.size >= this.maxSize) {
      // Very basic LRU: remove first key if at capacity
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Global L1 instance strictly capping out at exactly 10,000 active instances (safeguarding the standard memory heap limits)
export const l1Cache = new MemoryCache(10000);
