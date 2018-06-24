const methodIsPresentIn = (methods) => (method) => methods.includes(method);
const isAFunction = (something) => typeof something === 'function';

export function validateAdapter(adapter, requiredMethods) {
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

export function validateArgs(args) {
    if (typeof args !== 'object' || args === null || Array.isArray(args)) {
        throw new Error('`args` must be an object.');
    }

    if (!args.cacheInstance) {
        throw new Error('`args` must contain `cacheInstance` property.');
    }
}

export function validateMethodName(methodName) {
    if (typeof methodName !== 'string') {
        throw new Error('`methodName` must be a string.');
    }
}

export function validateExtra(extra) {
    if (typeof extra !== 'object' || extra === null || Array.isArray(extra)) {
        throw new Error('`extra` must be an object.');
    }
}

export function validateKey(key) {
    if (typeof key !== 'string') {
        throw new Error('`key` must be a string.');
    }
}

export function validatePlugins(plugins) {
    if (!Array.isArray(plugins)) {
        throw new Error('`plugins` need to be passed as an array.');
    }

    plugins.forEach((plugin) => {
        if (!plugin.hasOwnProperty('hooks') && !plugin.hasOwnProperty('createExtensions')) {
            throw new Error('Plugin must contain hooks or createExtensions method or both.');
        }
    });
}

export function createExtensionsValidator(cacheInstance) {
    return function (extensions) {
        const extensionsNames = Object.keys(extensions);
        const reservedNames = Object.keys(cacheInstance);

        extensionsNames.forEach(extensionName => {
            const functionExists = reservedNames.some(reservedName => extensionName === reservedName);

            if (functionExists) {
                throw new Error(`Extension '${extensionName}' already exists.`);
            }
        });
    };
}

export function validateCreateExtensionsMethod(createExtensions) {
    if (typeof createExtensions !== 'function') {
        throw new Error('`createExtensions` must be a function.');
    }
}

export function validateHooks(hooks) {
    if (!Array.isArray(hooks)) {
        throw new Error('Hooks need to be passed as an array.');
    }
}

export function validateHook({ event, handler }) {
    if (typeof event !== 'string') {
        throw new Error('Hook\'s event must be a string.');
    }

    if (!event.startsWith('pre') && !event.startsWith('post')) {
        throw new Error('Hook\'s event must start with `pre` or `post`.');
    }

    if (typeof handler !== 'function') {
        throw new Error('Hook\'s handler must be a function.');
    }
}
