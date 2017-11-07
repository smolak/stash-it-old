function validateExtra(extra) {
    if (typeof extra !== 'object' || extra === null || Array.isArray(extra)) {
        throw new Error('`extra` must be an object.');
    }
}

export default function createItem(key, value, namespace, extra = {}) {
    validateExtra(extra);

    return {
        key,
        value,
        namespace,
        extra
    };
}
