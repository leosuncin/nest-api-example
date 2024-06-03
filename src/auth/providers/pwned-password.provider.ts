import { createHash } from 'node:crypto';

import {
  cachified,
  type CacheEntry,
  type Cache,
  totalTtl,
} from '@epic-web/cachified';
import { pwnedPassword } from 'hibp';
import { LRUCache } from 'lru-cache';

const lru = new LRUCache<string, CacheEntry<number>>({ max: 1000 });
const cache: Cache<number> = {
  set(key, value) {
    const ttl = totalTtl(value.metadata);

    return lru.set(key, value, {
      ttl: ttl === Infinity ? undefined : ttl,
      start: value?.metadata?.createdTime,
    });
  },
  get(key) {
    return lru.get(key);
  },
  delete(key) {
    return lru.delete(key);
  },
};

export const PWNED_PASSWORD = Symbol.for('pwnedPassword');

export function hasPasswordBeenPwned(password: string): Promise<number> {
  const sha1sum = createHash('sha1');
  const key = sha1sum.update(password).digest('base64').slice(0, 5);
  const ttl = 300e3;

  return cachified<number>({
    key,
    cache,
    ttl,
    getFreshValue() {
      return pwnedPassword(password);
    },
  });
}
