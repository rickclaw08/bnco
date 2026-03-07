/**
 * ClawOps Scanner - In-Memory Cache
 */

import { CacheEntry } from '../types';

export class MemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// Cache instances
export const placesCache = new MemoryCache('places');
export const geoBenchmarkCache = new MemoryCache('geoBenchmark');
export const scanCache = new MemoryCache('scan');
