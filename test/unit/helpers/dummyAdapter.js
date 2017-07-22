import sinon from 'sinon';

import createItem from '../../../src/createItem';

function validateNamespace(namespace) {
    if (typeof namespace !== 'string') {
        throw new Error('`namespace` must be a string.');
    }

    if (false === /^[A-Za-z0-9_-]+$/i.test(namespace)) {
        throw Error('`namespace` can contain only letters, numbers, `_` or `-`.');
    }
}

export const FOO_KEY = 'foo';
export const FOO_WITH_EXTRA_KEY = 'fooWithExtra';
export const FOO_VALUE = 'fooValue';
export const BAR_KEY = 'bar';
export const BAR_WITH_EXTRA_KEY = 'barWithExtra';
export const BAR_VALUE = 'barValue';
export const FOO_EXTRA = { foo: 'extra' };
export const BAR_EXTRA = { bar: 'extra' };
export const NONEXISTENT_KEY = 'nonexistent';
export const NONEXISTENT_VALUE = undefined;

const defaultNamespace = 'namespace';

export function createDummyAdapter(options = {}) {
    const defaultOptions = {
        namespace: defaultNamespace
    };
    const mergedOptions = Object.assign({}, defaultOptions, options);
    const builtFooKey = `${mergedOptions.namespace}.${FOO_KEY}`;
    const builtBarKey = `${mergedOptions.namespace}.${BAR_KEY}`;
    const builtFooWithExtraKey = `${mergedOptions.namespace}.${FOO_WITH_EXTRA_KEY}`;
    const builtBarWithExtraKey = `${mergedOptions.namespace}.${BAR_WITH_EXTRA_KEY}`;

    validateNamespace(mergedOptions.namespace);

    const fooItem = createItem(builtFooKey, FOO_VALUE, mergedOptions.namespace);
    const barItem = createItem(builtBarKey, BAR_VALUE, mergedOptions.namespace);
    const fooWithExtraItem = createItem(builtFooWithExtraKey, FOO_VALUE, mergedOptions.namespace, FOO_EXTRA);
    const barWithExtraItem = createItem(builtBarWithExtraKey, BAR_VALUE, mergedOptions.name, BAR_EXTRA);

    const buildKeyStub = sinon.stub();

    buildKeyStub.withArgs(FOO_KEY).returns(builtFooKey);
    buildKeyStub.withArgs(BAR_KEY).returns(builtBarKey);
    buildKeyStub.withArgs(FOO_WITH_EXTRA_KEY).returns(`${mergedOptions.namespace}.${FOO_WITH_EXTRA_KEY}`);
    buildKeyStub.withArgs(BAR_WITH_EXTRA_KEY).returns(`${mergedOptions.namespace}.${BAR_WITH_EXTRA_KEY}`);

    const setItemStub = sinon.stub();

    setItemStub.withArgs(builtFooKey, FOO_VALUE).returns(fooItem);
    setItemStub.withArgs(builtBarKey, BAR_VALUE).returns(barItem);
    setItemStub.withArgs(builtFooWithExtraKey, FOO_VALUE, FOO_EXTRA).returns(fooWithExtraItem);
    setItemStub.withArgs(builtBarWithExtraKey, BAR_VALUE, BAR_EXTRA).returns(barWithExtraItem);

    const getItemStub = sinon.stub();

    getItemStub.withArgs(builtFooKey).returns(fooItem);
    getItemStub.withArgs(builtBarKey).returns(barItem);
    getItemStub.withArgs(builtFooWithExtraKey).returns(fooWithExtraItem);
    getItemStub.withArgs(builtBarWithExtraKey).returns(barWithExtraItem);
    getItemStub.withArgs(NONEXISTENT_KEY).returns(NONEXISTENT_VALUE);

    const getExtraStub = sinon.stub();

    getExtraStub.withArgs(builtFooKey).returns(fooItem.extra);
    getExtraStub.withArgs(builtBarKey).returns(barItem.extra);
    getExtraStub.withArgs(builtFooWithExtraKey).returns(fooWithExtraItem.extra);
    getExtraStub.withArgs(builtBarWithExtraKey).returns(barWithExtraItem.extra);
    getExtraStub.withArgs(NONEXISTENT_KEY).returns(undefined);

    const hasItemStub = sinon.stub();

    hasItemStub.withArgs(builtFooKey).returns(true);
    hasItemStub.withArgs(builtBarKey).returns(true);
    hasItemStub.withArgs(builtFooWithExtraKey).returns(true);
    hasItemStub.withArgs(builtBarWithExtraKey).returns(true);
    hasItemStub.withArgs(NONEXISTENT_KEY).returns(false);

    const removeItemStub = sinon.stub();

    removeItemStub.withArgs(builtFooKey).returns(true);
    removeItemStub.withArgs(builtBarKey).returns(true);
    removeItemStub.withArgs(builtFooWithExtraKey).returns(true);
    removeItemStub.withArgs(builtBarWithExtraKey).returns(true);
    removeItemStub.withArgs(NONEXISTENT_KEY).returns(false);

    return {
        buildKey: buildKeyStub,
        setItem: setItemStub,
        getItem: getItemStub,
        getExtra: getExtraStub,
        hasItem: hasItemStub,
        removeItem: removeItemStub
    };
}
