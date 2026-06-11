interface CacheEntry<T> {
  value: T;
  expires: number;
}

/** Map with automatic TTL-based entry expiration. Expired entries are lazily cleaned up on access. */
export class TTLMap<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private ttlMilliseconds: number;

  constructor(ttlMilliseconds: number) {
    this.ttlMilliseconds = ttlMilliseconds;
  }

  set(key: K, value: V): void {
    const expires = Date.now() + this.ttlMilliseconds;
    this.cache.set(key, { value, expires });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /** Triggers cleanup of all expired entries before returning count. */
  get size(): number {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) this.cache.delete(key);
    }
    return this.cache.size;
  }

  keys(): K[] {
    const now = Date.now();
    const valid: K[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) this.cache.delete(key);
      else valid.push(key);
    }
    return valid;
  }

  values(): V[] {
    const now = Date.now();
    const valid: V[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) this.cache.delete(key);
      else valid.push(entry.value);
    }
    return valid;
  }

  entries(): [K, V][] {
    const now = Date.now();
    const valid: [K, V][] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) this.cache.delete(key);
      else valid.push([key, entry.value]);
    }
    return valid;
  }
}
