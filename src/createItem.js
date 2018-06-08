import { validateExtra } from './validation';

export default function createItem(key, value, extra = {}) {
    validateExtra(extra);

    return {
        key,
        value,
        extra
    };
}
