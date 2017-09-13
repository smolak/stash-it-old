const methodIsPresentIn = (methods) => (method) => methods.includes(method);
const isAFunction = (something) => typeof something === 'function';

function validateAdapter(adapter, requiredMethods) {
    if (typeof adapter !== 'object' || adapter === null || Array.isArray(adapter)) {
        throw new Error('`adapter` must be an object.');
    }

    const adaptersMethods = Object.keys(adapter);
    const allRequiredMethodsArePresent = requiredMethods.every(methodIsPresentIn(adaptersMethods));
    const allMethodsAreFunctions = adaptersMethods.every((methodName) => isAFunction(adapter[methodName]));

    if (!allRequiredMethodsArePresent) {
        throw new Error('Not all required methods are present in adapter.');
    }

    if (!allMethodsAreFunctions) {
        throw new Error('Not all required methods are functions.');
    }
}

function validateArgs(args) {
    if (typeof args !== 'object' || args === null || Array.isArray(args)) {
        throw new Error('`args` must be an object.');
    }

    if (!args.cacheInstance) {
        throw new Error('`args` must contain `cacheInstance` property.');
    }
}

function validateMethodName(methodName) {
    if (typeof methodName !== 'string') {
        throw new Error('`methodName` must be a string.');
    }
}

function upperFirst(string) {
    const firstLetter = string[0];
    const restOfTheString = string.substr(1);

    return `${firstLetter.toUpperCase()}${restOfTheString}`;
}

function passDataThroughHooks(hooks, event, args) {
    return Array.isArray(hooks[event])
        ? hooks[event].reduce((prev, next, index) => hooks[event][index](prev), args)
        : args;
}

export const getPreData = (methodName, args) => {
    validateMethodName(methodName);
    validateArgs(args);

    const hooks = args.cacheInstance.getHooks();
    const event = `pre${upperFirst(methodName)}`;

    return passDataThroughHooks(hooks, event, args);
};

export const getPostData = (methodName, args) => {
    validateMethodName(methodName);
    validateArgs(args);

    const hooks = args.cacheInstance.getHooks();
    const event = `post${upperFirst(methodName)}`;

    return passDataThroughHooks(hooks, event, args);
};

const requiredMethods = [ 'buildKey', 'getItem', 'getExtra', 'setItem', 'hasItem', 'removeItem' ];

export default function createCache(adapter) {
    validateAdapter(adapter, requiredMethods);

    const hooks = {};

    return {
        addHook({ event, handler }) {
            if (typeof event !== 'string') {
                throw new Error('Hook\'s event must be a string.');
            }

            if (!event.startsWith('pre') && !event.startsWith('post')) {
                throw new Error('Hook\'s event must start with `pre` or `post`.');
            }

            if (typeof handler !== 'function') {
                throw new Error('Hook\'s handler must be a function.');
            }

            hooks[event] ? hooks[event].push(handler) : (hooks[event] = [handler]);
        },

        addHooks(hooks) {
            if (!Array.isArray(hooks)) {
                throw new Error('Hooks need to be passed as an array.');
            }

            hooks.forEach(this.addHook);
        },

        getHooks() {
            return hooks;
        },

        buildKey(key) {
            const preData = getPreData('buildKey', { cacheInstance: this, key });
            const builtKey = adapter.buildKey(preData.key);
            const postData = getPostData('buildKey', { cacheInstance: preData.cacheInstance, key: builtKey });

            return postData.key;
        },

        getItem(key) {
            const preData = getPreData('getItem', { cacheInstance: this, key });
            const item = adapter.getItem(this.buildKey(preData.key));
            const postData = getPostData('getItem', { cacheInstance: preData.cacheInstance, key: preData.key, item });

            return postData.item;
        },

        getExtra(key) {
            const preData = getPreData('getExtra', { cacheInstance: this, key });
            const extra = adapter.getExtra(this.buildKey(preData.key));
            const postData = getPostData('getExtra', { cacheInstance: preData.cacheInstance, key: preData.key, extra });

            return postData.extra;
        },

        setItem(key, value, extra = {}) {
            const preData = getPreData('setItem', { cacheInstance: this, key, value, extra });
            const item = adapter.setItem(this.buildKey(preData.key), preData.value, preData.extra);
            const postData = getPostData('setItem', {
                cacheInstance: preData.cacheInstance,
                key: preData.key,
                value: preData.value,
                extra: preData.extra,
                item
            });

            return postData.item;
        },

        hasItem(key) {
            const preData = getPreData('hasItem', { cacheInstance: this, key });
            const result = adapter.hasItem(this.buildKey(preData.key));
            const postData = getPostData('hasItem', { cacheInstance: preData.cacheInstance, key: preData.key, result });

            return postData.result;
        },

        removeItem(key) {
            const preData = getPreData('removeItem', { cacheInstance: this, key });
            const result = adapter.removeItem(this.buildKey(preData.key));
            const postData = getPostData('removeItem', {
                cacheInstance: preData.cacheInstance,
                key: preData.key,
                result
            });

            return postData.result;
        }
    };
}
