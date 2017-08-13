<table>
  <thead>
    <tr>
      <th><a href="https://smolak.github.io/stash-it/">Home</a></th>
      <th><strong>createCache</strong></th>
      <th><a href="https://smolak.github.io/stash-it/registerPlugins.html">registerPlugins</a></th>
      <th><a href="https://smolak.github.io/stash-it/createItem.html">createItem</a></th>
      <th><a href="https://smolak.github.io/stash-it/adapters.html">adapters</a></th>
      <th><a href="https://smolak.github.io/stash-it/plugins.html">plugins</a></th>
    </tr>
  </thead>
</table>

# createCache(adapter)

```javascript
import { createCache } from 'stash-it';

const cache = createCache(adapter);
```

`createCache` takes one argument, adapter, and returns an object with methods:

```javascript
{
    addHook,
    addHooks,
    getHooks,
    buildKey,
    getItem,
    getExtra,
    setItem,
    hasItem,
    removeItem
}
```

Create cache will throw when:
 - adapter is not an object
 - adapter does not contain all required methods
 - not all required methods are functions

Those methods are:

```javascript
buildKey, getItem, getExtra, setItem, hasItem, removeItem
```

Created cache instance has two groups of methods. One group handles `hooks`, other is about managing items in cache.
That 2nd group uses adapter's methods and triggers handlers for `pre` and `post` events.

Events and `hooks` (and how to create / use them) are explained in details in
[registerPlugins](https://smolak.github.io/stash-it/registerPlugins.html) and
[plugins](https://smolak.github.io/stash-it/plugins.html).

1. [addHook](#addhookhook)
1. [addHooks](#addhookshooks)
1. [getHooks](#gethooks)
1. [buildKey](#buildkeykey)
1. [getItem](#getitemkey)
1. [setItem](#setitemkey-value-extra)
1. [hasItem](#hasitemkey)
1. [removeItem](#removeitemkey)

## addHook(hook)

This method adds a hook.

There is literally no limit to how many hooks you can add.
You can add the very same hook multiple times (hence not setting).

Every hook is added **to the end of the list**, therefore **order of adding hooks matters**.

Underneath, hooks are stored in an object, which properties are event names and values are arrays with handlers.
This way, for given event, data is being passed through handlers in that array only, and not through all.

```javascript
{
    `preGetItem`: [ ... ],
    `postRemoveItem`: [ ... ],
    ...
}
```

## addHooks(hooks)

Adds multiple hooks. Takes an array of, well, you've guessed it, hooks.
If `hooks` are not passed as an array, it will throw.

## getHooks()

Returns an object with hooks.

## buildKey(key)

Method responsible for building item's key. Returns built key.

Lifecycle (internal):
 - `preBuildKey({ key, cacheInstance })`, returns `preData`
 - adapter's `buildKey(preData.key)`, return `builtKey`
 - `postBuildKey({ key: builtKey, cacheInstance: preData.cacheInstance })` returns `postData`
 - returns `postData.key`

## getItem(key)

Returns item for given key.
If that item doesn't exist, returns the result of adapter's `getItem`. For instance, [memory adapter](https://github.com/smolak/stash-it-adapter-memory) returns `undefined`.
Generally, all adapters should behave in the same fashion.

Lifecycle (internal):
 - `preGetItem({ key, cacheInstance })`, returns `preData`
 - adapter's `getItem(preData.key)`, returns `item` or `undefined` when item doesn't exist
 - `postBuildKey({ key: preData.key, item, cacheInstance: preData.cacheInstance })` returns `postData`
 - returns `postData.item`

## setItem(key, value, \[extra\])

Sets an item. `extra` argument is optional.
Item is build using [createItem](https://smolak.github.io/stash-it/createItem.html) method.

If item exists, it's going to be overwritten.

Returns created item.

Lifecycle (internal):
 - `preSetItem({ key, value, extra, cacheInstance })`, returns `preData`
 - adapter's `setItem(preData.key, preData.value, preData.extra)`, returns created `item`
 - `postSetItem({ preData.key, preData.value, preData.extra, item, cacheInstance: preData.cacheInstance })` returns `postData`
 - returns `postData.item`

## hasItem(key)

Returns `true` if item exists, `false` otherwise.

Lifecycle (internal):
 - `preHasItem({ key, cacheInstance })`, returns `preData`
 - adapter's `hasItem(preData.key)`, returns `result`, a boolean value
 - `postHasItem({ preData.key, result, cacheInstance: preData.cacheInstance })` returns `postData`
 - returns `postData.result`

## removeItem(key)

Removes an item and returns `true` if item existed and was removed, `false` if item didn't exist.

Lifecycle (internal):
 - `preRemoveItem({ key, cacheInstance })`, returns `preData`
 - adapter's `removeItem(preData.key)`, returns `result`, a boolean value
 - `postRemoveItem({ preData.key, result, cacheInstance: preData.cacheInstance })` returns `postData`
 - returns `postData.result`
