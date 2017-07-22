function addHooks(cacheInstance, hooks) {
    cacheInstance.addHooks(hooks);
}

function addHooksFromPlugins(cacheInstance, plugins) {
    plugins.forEach(plugin => {
        addHooks(cacheInstance, plugin.hooks);
    });
}

function addExtensions(cacheInstance, getExtensions) {
    if (typeof getExtensions !== 'function') {
        throw new Error('`getExtensions` must be a function.');
    }

    const createdExtensions = getExtensions(cacheInstance);
    const extensionsNames = Object.keys(createdExtensions);
    const reservedNames = Object.keys(cacheInstance);

    extensionsNames.forEach(extensionName => {
        const functionExists = reservedNames.some(reservedName => extensionName === reservedName);

        if (functionExists) {
            throw new Error(`Extension '${extensionName}' already exists.`);
        }
    });

    return Object.assign({}, cacheInstance, createdExtensions);
}

function addExtensionsFromPlugins(cacheInstance, plugins) {
    return plugins.reduce((instance, plugin) => {
        if (plugin.getExtensions) {
            return addExtensions(instance, plugin.getExtensions);
        }

        return instance;
    }, cacheInstance);
}

function validateCacheInstance(cacheInstance) {
    if (typeof cacheInstance !== 'object' || cacheInstance === null || Array.isArray(cacheInstance)) {
        throw new Error('`cacheInstance` must be an object.');
    }
}

function validatePlugins(plugins) {
    if (!Array.isArray(plugins)) {
        throw new Error('`plugins` need to be passed as an array.');
    }

    plugins.forEach((plugin) => {
        if (!plugin.hasOwnProperty('hooks') && !plugin.hasOwnProperty('getExtensions')) {
            throw new Error('Plugin must contain hooks or getExtensions method or both.');
        }
    });
}

export default function registerPlugins(cacheInstance, plugins) {
    validateCacheInstance(cacheInstance);
    validatePlugins(plugins);

    addHooksFromPlugins(cacheInstance, plugins);

    return addExtensionsFromPlugins(cacheInstance, plugins);
}
