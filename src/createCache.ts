import { Extra, Item, Key, NotFoundValue, Ttl, Value } from './createItem';
import { MemoryAdapter } from './adapters/MemoryAdapter/MemoryAdapter';

export interface StashItAdapter {
  get: (key: Key) => Promise<Item | NotFoundValue>;
  set: (key: Key, value: Value, extra?: Extra, ttl?: Ttl) => Promise<Item>;
  has: (key: Key) => Promise<boolean>;
  delete: (key: Key) => Promise<boolean>;
  clear: () => Promise<number>;
}

export interface CacheInterface extends StashItAdapter {}

export class StashIt implements CacheInterface {
  #adapter: StashItAdapter;

  constructor(adapter: StashItAdapter) {
    this.#adapter = adapter;
  }

  get(key: Key): Promise<Item | NotFoundValue> {
    return this.#adapter.get(key);
  }

  set(key: Key, value: Value, extra: Extra = {}, ttl?: Ttl): Promise<Item> {
    return this.#adapter.set(key, value, extra, ttl);
  }

  has(key: Key): Promise<boolean> {
    return this.#adapter.has(key);
  }

  delete(key: Key): Promise<boolean> {
    return this.#adapter.delete(key);
  }

  clear(): Promise<number> {
    return this.#adapter.clear();
  }
}

