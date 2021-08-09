import { validateKey } from './validators/validateKey';
import { validateExtra } from './validators/validateExtra';

export type Value = string | number | boolean | null | [] | object;
export type NotFoundValue = null;
export type Key = string;
export type ExtraValue = Value;
export type Extra = Record<string, ExtraValue>;
export type Ttl = null | number | Date;

export interface Item {
  key: Key;
  value: Value;
  ttl: Ttl;
  extra: Extra;
}

const ONE_HOUR_IN_SECONDS = 3600;

export default function createItem(key: Key, value: Value, ttl: Ttl = ONE_HOUR_IN_SECONDS, extra: Extra = {}): Item {
  validateKey(key);
  validateExtra(extra);

  return {
    key,
    value,
    ttl,
    extra,
  };
}
