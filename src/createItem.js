import { validateExtra } from './validation';

export default function createItem(key, value, namespace, extra = {}) {
    validateExtra(extra);

    return {
        key,
        value,
        namespace,
        extra
    };
}
