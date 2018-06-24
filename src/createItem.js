import { validateKey, validateExtra } from './validation';

export default function createItem(key, value, extra = {}) {
    validateKey(key);
    validateExtra(extra);

    return {
        key,
        value,
        extra
    };
}
