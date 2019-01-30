import {
    createExtensionsValidator,
    validateAdapter,
    validateArgs,
    validateCreateExtensionsMethod,
    validateExtra,
    validateHook,
    validateHooks,
    validatePlugins
} from './validation';
import requiredMethods from './requiredMethods';

function passDataThroughEventHandlers(eventHandlers, args) {
    return eventHandlers.reduce(async (previousValue, handler) => {
        return handler(await previousValue);
    }, args);
}

function passDataThroughHooks(hooks, event, args) {
    const eventHandlers = hooks[event];
    const resolvedArgs = Promise.resolve(args);

    return Array.isArray(eventHandlers) ? passDataThroughEventHandlers(eventHandlers, resolvedArgs) : resolvedArgs;
}

export function emit(eventName, args) {
    validateArgs(args);

    const hooks = args.cacheInstance.getHooks();

    return passDataThroughHooks(hooks, eventName, args);
}

function cloneHooks(hooks) {
    const cloned = {};

    Object.entries(hooks).forEach(([ event, handlers ]) => {
        cloned[event] = handlers.map((handler) => handler);
    });

    return cloned;
}

export function createCache(adapter) {
    validateAdapter(adapter, requiredMethods);

    const cacheInstance = {
        hooks: {},

        addHook(hook) {
            validateHook(hook);

            const { event, handler } = hook;

            this.hooks[event] ? this.hooks[event].push(handler) : (this.hooks[event] = [handler]);
        },

        addHooks(hooks) {
            validateHooks(hooks);

            hooks.forEach(this.addHook.bind(this));
        },

        getHooks() {
            return this.hooks;
        },

        async buildKey(key) {
            const preData = await emit('preBuildKey', { cacheInstance: this, key });
            const builtKey = await adapter.buildKey(preData.key);
            const postData = await emit('postBuildKey', { cacheInstance: preData.cacheInstance, key: builtKey });

            return postData.key;
        },

        async getItem(key) {
            const preData = await emit('preGetItem', { cacheInstance: this, key });
            const item = await adapter.getItem(preData.key);
            const postData = await emit('postGetItem', { cacheInstance: preData.cacheInstance, key: preData.key, item });

            return postData.item;
        },

        async getExtra(key) {
            const preData = await emit('preGetExtra', { cacheInstance: this, key });
            const extra = await adapter.getExtra(preData.key);
            const postData = await emit('postGetExtra', { cacheInstance: preData.cacheInstance, key: preData.key, extra });

            return postData.extra;
        },

        async setItem(key, value, extra = {}) {
            const preData = await emit('preSetItem', { cacheInstance: this, key, value, extra });
            const item = await adapter.setItem(preData.key, preData.value, preData.extra);
            const postData = await emit('postSetItem', {
                cacheInstance: preData.cacheInstance,
                key: preData.key,
                value: preData.value,
                extra: preData.extra,
                item
            });

            return postData.item;
        },

        async addExtra(key, extra) {
            const preData = await emit('preAddExtra', { cacheInstance: this, key, extra });

            validateExtra(preData.extra);

            const hasItem = await this.hasItem(preData.key);
            const addedExtra =
                hasItem
                    ? await adapter.addExtra(preData.key, preData.extra)
                    : undefined;

            const postData = await emit('postAddExtra', {
                cacheInstance: preData.cacheInstance, key: preData.key, extra: addedExtra });

            return postData.extra;
        },

        async setExtra(key, extra) {
            const preData = await emit('preSetExtra', { cacheInstance: this, key, extra });

            validateExtra(preData.extra);

            const hasItem = await this.hasItem(preData.key);
            const setExtra =
                hasItem
                    ? await adapter.setExtra(preData.key, preData.extra)
                    : undefined;
            const postData = await emit('postSetExtra', {
                cacheInstance: preData.cacheInstance, key: preData.key, extra: setExtra });

            return postData.extra;
        },

        async hasItem(key) {
            const preData = await emit('preHasItem', { cacheInstance: this, key });
            const result = await adapter.hasItem(preData.key);
            const postData = await emit('postHasItem', { cacheInstance: preData.cacheInstance, key: preData.key, result });

            return postData.result;
        },

        async removeItem(key) {
            const preData = await emit('preRemoveItem', { cacheInstance: this, key });
            const result = await adapter.removeItem(preData.key);
            const postData = await emit('postRemoveItem', {
                cacheInstance: preData.cacheInstance,
                key: preData.key,
                result
            });

            return postData.result;
        },

        registerPlugins(plugins) {
            validatePlugins(plugins);

            const extendedCacheInstance = plugins.reduce((instance, plugin) => {
                if (plugin.createExtensions) {
                    validateCreateExtensionsMethod(plugin.createExtensions);

                    const extensionsValidator = createExtensionsValidator(instance);
                    const extensionsFromPlugin = plugin.createExtensions({
                        cacheInstance: instance, emit
                    });

                    extensionsValidator(extensionsFromPlugin);

                    return Object.assign({}, instance, extensionsFromPlugin);
                }

                return instance;
            }, this);
            const hooks = cloneHooks(extendedCacheInstance.getHooks());
            const cacheInstanceWithHooksCopied = Object.assign({}, extendedCacheInstance, { hooks });

            plugins.forEach(({ hooks }) => {
                hooks ? cacheInstanceWithHooksCopied.addHooks(hooks) : null;
            });

            return Object.freeze(cacheInstanceWithHooksCopied);
        }
    };

    return Object.freeze(cacheInstance);
}
