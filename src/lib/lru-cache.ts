/**
 * ⚡ High-Throughput Memory-Aware LRU (Least Recently Used) Semantic Cache
 * Provides O(1) read/write caching with V8 heap pressure sensing, TTL expiration,
 * and adaptive proactive eviction to prevent Out-Of-Memory (OOM) fatal crashes.
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxEntries: number;
  private defaultTtlMs: number;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  constructor(maxEntries: number = 500, defaultTtlMs: number = 300000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiry
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      this.evictions++;
      return null;
    }

    // Refresh LRU order (delete and re-set to end of map)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    this.checkMemoryPressureAndEvict();

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.evictions++;
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs)
    });
  }

  public checkMemoryPressureAndEvict(): void {
    if (typeof process === "undefined" || !process.memoryUsage) return;

    try {
      const mem = process.memoryUsage();
      const heapRatio = mem.heapTotal > 0 ? mem.heapUsed / mem.heapTotal : 0;

      // If heap is > 85% full or RSS > 1.2GB, perform aggressive GC purge
      if (heapRatio > 0.85 || mem.rss > 1200 * 1024 * 1024) {
        const now = Date.now();
        // 1. Purge expired entries
        const keysToDelete: string[] = [];
        this.cache.forEach((v, k) => {
          if (now > v.expiresAt) {
            keysToDelete.push(k);
          }
        });

        keysToDelete.forEach((k) => {
          this.cache.delete(k);
          this.evictions++;
        });

        // 2. If still high, shed bottom 25% of entries
        const targetTrim = Math.ceil(this.cache.size * 0.25);
        const allKeys = Array.from(this.cache.keys());
        for (let i = 0; i < Math.min(targetTrim, allKeys.length); i++) {
          this.cache.delete(allKeys[i]);
          this.evictions++;
        }
      }
    } catch {
      // Ignored
    }
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  public getStats() {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : "0.000"
    };
  }
}

// Global shared instances for high-frequency subsystems
export const benchmarkCache = new LRUCache<any>(100, 60000); // 1-minute TTL for synthetic benchmarks
export const dryRunCache = new LRUCache<any>(200, 120000);   // 2-minute TTL for repeated dry-run simulations
