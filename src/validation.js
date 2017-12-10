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
