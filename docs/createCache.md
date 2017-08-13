<table>
  <thead>
    <tr>
      <th><a href="https://smolak.github.io/stash-it/">Home</a></th>
      <th><strong>createCache</strong></th>
    </tr>
  </thead>
</table>

# createCache(adapter)

```javascript
import { createCache } from 'stash-it';

const cache = createCache(adapter);
```

`createCache` takes one argument, adapter and returns and object with methods:

```javascript
{
    addHook,
    addHooks,
    getHooks,
    buildKey,
    getItem,
    setItem,
    hasItem,
    removeItem
}
```

There are are two groups of methods. One group handles `hooks`, other is about managing items in cache.
That 2nd group uses adapter's methods and triggers handlers for `pre` and `post` events.

Events and `hooks` (and how to create / use them) are explained in details in [plugins](https://smolak.github.io/stash-it/plugins.html).

1. [addHook](#addhookhook)
1. [addHooks](#addhookshooks)
1. [getHooks](#gethooks)
1. [buildKey](#buildkeykey)
1. [getItem](#getitemkey)
1. [setItem](#setitemkeyvalueextra)
1. [hasItem](#hasitemkey)
1. [removeItem](#removeitemkey)

## addHook(hook)

This method adds a hook.

Read that part carefully as hooks and extensions (parts of plugins) are **the most important** thing that make `stash-it` flexible and expandable.

There is literally no limit to how many hooks you can add.
You can add the very same hook multiple times (hence not setting).

Every hook is added **to the end of the list**, therefore **order of adding hooks matters**.

### Hook { event, handler }

Hook is an object. It consist out of two properties: **event** and **handler**.

#### event

Event is a string that represents event name for which given handler is to be triggered.
For `stash-it`, events are `preMethodName` and `postMethodName`

*tl;dr* - event's name is a prefix + method name, for instance `preSetItem` or `postRemoveItem`
(mind the camel case name structure).

##### Why `pre` and `post`?

It's about data control throughout the lifecycle of each method.

For instance, when you set an item (using `getItem` method) few things are happening:

```javascript
cache.getItem('key');
```

1. If there are hooks for `preGetItem` added, it triggers their handlers.
1. Adapter's `getItem` method is executed.
1. If there are hooks for `postGetItem` added, `stash-it` triggers their handlers.

Let's examine thos points one by one. I am going to explain in depth `getItem` method, but all of them
(those are: `buildKey`, `getItem`, `setItem`, `hasItem`, `removeItem`) work in similar fashion.

###### 1. preGetItem({ key, cacheInstance })

`stash-it` is looking for hooks registered for `preGetItem` event. If it finds any (one or more), it takes `handler`s registered with that event and triggers them.
This is the `pre` phase for given method.
There is one argument, an object, being passed to each `handler`, that is being fired, and it depends on what method you are using.

For `getItem(key)` handler takes `{ key, cacheInstance }`.

There is a pattern here, that is followed by each method. `pre` handlers *always* take all arguments used by given method, plus `cacheInstance`.

Therefore `pre` handler for `setItem(key, value, [extra])`, would take `{ key, value, extra, cacheInstance }` object as an argument.

**Important:**

1. `cacheInstance` is a reference to cache object (`this`), not adapter. Therefore each hook has access to all of cache's public methods, also the ones that were added by plugins.
1. `pre` handlers **must always** return an object that consists of the very same properties passed to it.
   So for `getItem(key)`, `preGetItem` would take `{ key, cacheInstance }` and return `{ key, cacheInstance }` object.
1. If there is more than one hook added for this event, this key will be passed through all of the handlers
   and each of them will return that object, so that finally it would be passed further to be used by adapter.

###### 2. Adapter's `getItem(key)` execution

The object, returned by `preGetItem` will have `key` property.
This is what is being used by adapter's method - not the original key that was passed to cache's method.

If, by any chance, hook's handler is doing something with that key (e.g. adds prefix), then prefixed key will be used by adapter.

After executing adapter's method, its returned value (here, an item, if it exists) is later used by `postGetItem`.

###### 3. postGetItem({ item, key, cacheInstance })

Where:
 - **item** is an item returned by adapter's method
 - **key** is key returned by `preGetItem` handler(s)
 - **cacheInstance** is returned by `preGetItem` - yes, this as well

Finally, after `postGetItem` passes data through its handlers (if there are any), similar to how it was done in `preGetItem`,
`postGetItem` returns `item`. And that is it.

The whole code looks like this:

```javascript
getItem(key) {
    const preData = getPreData('getItem', { cacheInstance: this, key });
    const item = adapter.getItem(this.buildKey(preData.key));
    const postData = getPostData('getItem', { cacheInstance: preData.cacheInstance, key: preData.key, item });

    return postData.item;
}
```

This is all about what hooks are and how they work. There is additional description covering
[plugins](https://smolak.github.io/stash-it/plugins.html). I encourage you to have a look there.

## addHooks(hooks)

Adds multiple hooks. Takes an array of, well, you've guessed it, hooks.
If `hooks` are not passed as an array, it will throw.

## getHooks()

Returns an object with hooks. Not an array? No. Hooks are stored in an object. Why?
Take look at [plugins](https://smolak.github.io/stash-it/plugins.html).

## buildKey(key)

Method responsible for building item's key. Returns built key.

Lifecycle (internal):
 - `preBuildKey({ key, cacheInstance }), returns `preData`
 - adapter's `buildKey(preData.key)`, return `builtKey`
 - `postBuildKey({ key: builtKey, cacheInstance: preData.cacheInstance })` returns `postData`
 - returns `postData.key`


