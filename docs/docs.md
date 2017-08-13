<table>
  <thead>
    <tr>
      <th><a href="https://smolak.github.io/stash-it-plugin-debug">Home</a></th>
      <th><strong>Docs</strong></th>
    </tr>
  </thead>
</table>


# Docs

## debug(callback, withCacheInstance = false)

This method return a plugin. What is a plugin? Checkout [plugins section in stash-it](https://smolak.github.io/stash-it/plugins.html).

```javascript
{
    getExtensions: (cacheInstance) => {
        return {
            runDiagnostics: (key, value, extra = {}) {
                ...
            }
        }
    },
    hooks
}
```

### callback

This can be any method that is callable. For best results any logging one is suggested.

For example: `console.log`.

### withCacheInstance

Every time callback is called, arguments contain `cacheInstance` which is a reference to cache object used to which this plugin was plugged in.
In order not to pass it to callback, this flag is set to `false` by default.

Why `false`? Most of the time you won't need to check what is inside cache instance and, for instance `console.log`ing it would only shadow data being passed throughout various methods.

Pass `true` only if you need to check what has happened at any point in lifecycle methods (`pre`. `post` events).

For more info about those events, see [createCache](https://smolak.github.io/stash-it/createCache.html).

## Hooks

For this plugin, hooks are added for all base pluggable methods in cache.

What are **pluggable methods** - I use this name to describe all methods that plugins can be added for.
And **base**? It means that only methods from cache instance that has no extensions added will be hooked.

Those methods are: `buildKey`, `getItem`, `getExtra`, `setItem`, `hasItem`, `removeItem`.

Whenever any of those methods are used, callback is being fired with passed arguments to this methods `pre` and `post` events.

For instance, when `getItem('key')` is called, `preGetItem` and `postGetItem` events
(and `preBuildKey` and `postBuildKey` - as `buildKey` is used internally in `getItem`)
will trigger calling callback like so:

```javascript
callback({
    event: 'preGetItem',
    args: {
        // key used, e.g. 'key'
        key,
        // this will only be here if withCacheInstance is passed as `true`
        cacheInstance
    }
});

// and so on for the rest of the events
```

For `cacheInstance` and used arguments with each event, checkout [createCache section in stash-it](https://smolak.github.io/stash-it/createCache.html).
You will also find information there what arguments are used with each event.

## runDiagnostics(key, value, \[extra\])

This method will run full diagnostics.

Those diagnostics will try to create, search for, obtain and remove the item. If it fails on the way, you will be informed.
This is done to check if cache is capable of doing all of those actions against storage used by adapter.

Every check, once done, is being informed about using callback function, the very same one passed upon creation of this plugin.

For example:
```javascript
callback('(1/6) Item set successfully.');
```


#### Is it safe? Won't I overwrite or remove existing item?
If there is an item for key that you use, it will throw. It is a safety mechanism so that you won't overwrite / remove existing item in storage.

`extra` is optional. If passed, item will be created using it. It fallbacks to empty object.

It's recommended to run this before given storage will be used.
