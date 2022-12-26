import { createHash } from 'node:crypto';

import { type CacheEntry, cachified, lruCacheAdapter } from 'cachified';
import { pwnedPassword } from 'hibp';
import LRUCache from 'lru-cache';

const lru = new LRUCache<string, CacheEntry<number>>({ max: 1000 });

export const PWNED_PASSWORD = Symbol.for('pwnedPassword');

export function hasPasswordBeenPwned(password: string): Promise<number> {
  const sha1sum = createHash('sha1');
  const key = sha1sum.update(password).digest('base64').slice(0, 5);
  const cache = lruCacheAdapter(lru);
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
