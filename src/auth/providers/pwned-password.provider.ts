import {
  type Cache,
  type CacheEntry,
  cachified,
  totalTtl,
} from '@epic-web/cachified';
import { pwnedPassword } from 'hibp';
import { LRUCache } from 'lru-cache';
import { createHash } from 'node:crypto';

const lru = new LRUCache<string, CacheEntry<number>>({ max: 1_000 });
const cache: Cache<number> = {
  delete(key) {
    return lru.delete(key);
  },
  get(key) {
    return lru.get(key);
  },
  set(key, value) {
    const ttl = totalTtl(value.metadata);

    return lru.set(key, value, {
      start: value?.metadata?.createdTime,
      ttl: ttl === Infinity ? undefined : ttl,
    });
  },
};

export const PWNED_PASSWORD = Symbol.for('pwnedPassword');

export function hasPasswordBeenPwned(password: string): Promise<number> {
  const sha1 = createHash('sha1');
  const key = sha1.update(password).digest('base64').slice(0, 5);
  const ttl = 300e3;

  return cachified<number>({
    cache,
    getFreshValue() {
      return pwnedPassword(password);
    },
    key,
    ttl,
  });
}
