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

export function validatePlugins(plugins) {
    if (!Array.isArray(plugins)) {
        throw new Error('`plugins` need to be passed as an array.');
    }

    plugins.forEach((plugin) => {
        if (!plugin.hasOwnProperty('hooks') && !plugin.hasOwnProperty('getExtensions')) {
            throw new Error('Plugin must contain hooks or getExtensions method or both.');
        }
    });
}

export function validateExtensions(extensions, cacheInstance) {
    const extensionsNames = Object.keys(extensions);
    const reservedNames = Object.keys(cacheInstance);

    extensionsNames.forEach(extensionName => {
        const functionExists = reservedNames.some(reservedName => extensionName === reservedName);

        if (functionExists) {
            throw new Error(`Extension '${extensionName}' already exists.`);
        }
    });
}
