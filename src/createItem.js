function validateExtra(extra) {
    if (typeof extra !== 'object' || extra === null || Array.isArray(extra)) {
        throw new Error('`extra` must be an object.');
    }

    if (extra.namespace) {
        throw new Error('`extra` can\'t contain `namespace` property.');
    }
}

export default function createItem(key, value, namespace, extra = {}) {
    validateExtra(extra);

    return {
        key,
        value,
        extra: Object.assign({}, { namespace }, extra)
    };
}
