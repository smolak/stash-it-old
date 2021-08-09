import createItem, { Extra, Item, Key, NotFoundValue, Ttl, Value } from '../../createItem';
import { StashItAdapter } from '../../createCache';

export class MemoryAdapter implements StashItAdapter {
  #items: Record<Key, Item> = {};

  async get(key: Key): Promise<Item | NotFoundValue> {
    const item = (await this.has(key)) ? this.#items[key] : null;

    return Promise.resolve(item);
  }

  set(key: Key, value: Value, extra?: Extra, ttl?: Ttl): Promise<Item> {
    if (ttl !== undefined) {
      if (typeof ttl !== 'number') {
        return Promise.reject(new Error(`'ttl' needs to be a number.`));
      }

      if (!Number.isInteger(ttl)) {
        return Promise.reject(new Error(`'ttl' needs to be an intiger.`));
      }

      if (ttl <= 0) {
        return Promise.reject(new Error(`'ttl' needs to be greater than 0 (value passed: ${ttl}).`));
      }
    }

    this.#items[key] = createItem(key, value, ttl, extra);

    return Promise.resolve(this.#items[key]);
  }

  has(key: Key): Promise<boolean> {
    return Promise.resolve(key in this.#items);
  }

  async delete(key: Key): Promise<boolean> {
    const hasItem = await this.has(key);
    if (hasItem) {
      delete this.#items[key];
    }

    return Promise.resolve(hasItem);
  }

  clear(): Promise<number> {
    const numberOfItemsSet = Object.keys(this.#items).length;

    this.#items = {};

    return Promise.resolve(numberOfItemsSet);
  }
}
