<table>
  <thead>
    <tr>
      <th><a href="https://smolak.github.io/stash-it/">Home</a></th>
      <th><a href="https://smolak.github.io/stash-it/createCache.html">createCache</a></th>
      <th><a href="https://smolak.github.io/stash-it/registerPlugins.html">registerPlugins</a></th>
      <th><a href="https://smolak.github.io/stash-it/createItem.html">createItem</a></th>
      <th><a href="https://smolak.github.io/stash-it/adapters.html">adapters</a></th>
      <th><strong>plugins</strong></th>
    </tr>
  </thead>
</table>

# Plugins

A plugin is an object that consists of, at least, one property: `hooks` and / or `getExtensions`.
Here is an example of full grown plugin (without the body):

```javascript
{
    hooks: [],
    getExtensions: (cacheInstance) => {}
}
```

Hooks contain objects, and each of them (hook), consists of `event` and `handler`.

1. [Available plugins](#available-plugins)
1. [Hook { event, handler }](#hook--event-handler-)
1. [getExtensions(cacheInstance)](#getextensionscacheinstance)
1. [Final word](#final-word)

## Available plugins

1. [Debug](https://github.com/smolak/stash-it-plugin-debug) - it helps finding out what is set in cache and how this data change (or not) upon any action taken.

... more to come.

*If you have created your own plugin, give me a hint, I will have a look and if it's fine, it will appear on the list as well.*

## Hook { event, handler }

### event

Event is a string that represents event name for which given handler is to be triggered.
For `stash-it`, events are `preMethodName` and `postMethodName`

*tl;dr* - event's name is a prefix + method name, for instance `preSetItem` or `postRemoveItem`
(mind the camel case name structure).

#### Why `pre` and `post`?

It's about data control throughout the lifecycle of each method.

For instance, when you get an item (using `getItem` method) few things are happening:

```javascript
cache.getItem('key');
```

1. If there are hooks for `preGetItem` events added, it triggers their handlers.
1. Adapter's `getItem` method is executed.
1. If there are hooks for `postGetItem` events added, `stash-it` triggers their handlers.

Let's examine those points one by one. I am going to explain in depth `getItem` method, but all of them
(those are: `buildKey`, `getItem`, `setItem`, `hasItem`, `removeItem`) work in similar fashion.

The only difference is what each handler consumes and returns. All of the methods are described in [createCache](https://smolak.github.io/stash-it/createCache.html).

##### 1. preGetItem({ key, cacheInstance })

`stash-it` is looking for hooks registered for `preGetItem` event. If it finds any (one or more), it takes handlers registered with that event and triggers them.
This is the `pre` phase for given method.
There is one argument, an object, being passed to each `handler`, that is being fired, and it depends on what method you are using.

For `getItem(key)` handler takes `{ key, cacheInstance }`.

There is a pattern here, that is followed by each method. `pre` handlers *always* take all arguments used by given method, plus `cacheInstance` in an object.

Therefore `pre` handler for `setItem(key, value, [extra])`, would take `{ key, value, extra, cacheInstance }` object as an argument.

> **Important:**
>
> 1. `cacheInstance` is a reference to cache object (`this`), not adapter. Therefore each hook has access to all of cache's public methods, also the ones that were added by plugins.
> 1. `pre` handlers **must always** return an object that consists of the very same properties passed to it.
>    So for `getItem(key)`, `preGetItem` would take `{ key, cacheInstance }` and return `{ key, cacheInstance }` object.
> 1. If there is more than one hook added for this event, this object will be passed through all of the handlers
>    and each of them will return that object, so that finally it would be passed further to be used by adapter.
>    Mind the fact, that data can be altered by any handler (but not necessary).

##### 2. Adapter's `getItem(key)` execution

Continuing with getting an item. The object, returned by `preGetItem` will have `key` property.
This is what is being used by adapter's method - not the original key that was passed to cache's method.
That is because some plugins can somehow alter that key and change the way getting item works. The original key, thus, can't be used.

If hook's handler is doing something with that key (e.g. adds prefix), then prefixed key will be used by adapter.

After executing adapter's method, its returned value (here, an item, if it exists) is later used by `postGetItem`.

##### 3. postGetItem({ item, key, cacheInstance })

Where:
 - **item** is an item returned by adapter's method
 - **key** is key returned by `preGetItem` handler(s)
 - **cacheInstance** is returned by `preGetItem` - yes, this as well

 There is a pattern here as well. `post` handlers *always* take all arguments used by given method, plus `cacheInstance` plus the result of adapter's method in an object.

Finally, after `postGetItem` passes data through its handlers (if there are any), similar to how it was done in `preGetItem`,
`postGetItem` returns an object, that has `item` property, and value behind that property is returned. And that is it.

The whole code looks like this:

```javascript
getItem(key) {
    const preData = getPreData('getItem', { cacheInstance: this, key });
    const item = adapter.getItem(this.buildKey(preData.key));
    const postData = getPostData('getItem', { cacheInstance: preData.cacheInstance, key: preData.key, item });

    return postData.item;
}
```

*(TIP: take a look how `getPreData` and `getPostData` are constructed to see the details)*

This is all about what hooks are and how they work.

### handler

Handler is a function. It takes some data and returns the same data structure (but can alter it's values).

Here's an example:

```javascript
hooks: [
    {
        event: 'preBuildKey',
        handler: ({ key, cacheInstance }) => {
            const prefix = 'abc';

            return { key: `${prefix}${key}`, cacheInstance };
        }
    }
]
```

Here, we can see a prefix being added to key during the `buildKey`, `pre` phase.
Thanks to this (not very flexible solution, though), you will always have a `abc` prefix added to your keys.

So every time when you call `getItem('foo')` it will look for item stored under `abcfoo` key.

> I will cover, soon, a detailed example of how to build a plugin with hooks and extensions.
> Till then, if you have any questions, don't hesitate to contact me regarding that matter, or any `stash-it` related.

## getExtensions(cacheInstance)

This method returns an object with methods that will be added to `cacheInstance`.

```javascript
const getHandlersPlugin = {
    getExtensions: (cacheInstance) {
        return {
            // probably not the most useful method, but will be a good example
            getHandlersByEventName: (eventName) => {
                return cacheInstance.getHooks()[eventName];
            }
        }
    }
}

const cacheWithPlugins = registerPlugins(cache, [ getHandlersPlugin ]);

cacheWithPlugins.getHandlersByEventName('preGetItem'); // it will return an array of handlers or undefined if none were added
```

You need to mind one thing. Plugins, in general, can be registered multiple times (different ones) for given cache instance.
For instance:

```javascript
const cacheWithPlugins = registerPlugins(cache, [ some, plugins ]);
const cacheWithEvenMorePlugins = registerPlugins(cache, [ other, ones ]);
```

But, if you try to register plugins, which extend cache with methods (their names) that already exist, it will throw.
For instance, if you try to register `getHandlersPlugin` twice:

```javascript
registerPlugins(cache, [ getHandlersPlugin, getHandlersPlugin ]);

// OR

cosnt cacheWithPlugins = registerPlugins(cache, [ getHandlersPlugin ]);
cosnt cacheWithMorePlugins = registerPlugins(cacheWithPlugins, [ getHandlersPlugin ]);

// Both of them will throw trying to add a method that already exists.
```

Why? This precaution is added to prevent overwriting existing methods (especially the base ones).

What about hooks for newly created methods?

> **Important**: if you want methods in plugins to be prepared for handling hooks, you need to make sure of that on your own.

For instance, let's take the `getHandlersByEventName` method.
If you would like it to be hookable, it would look like this:

```javascript
const getHandlersPlugin = {
    getExtensions: (cacheInstance) {
        return {
            getHandlersByEventName: (eventName) => {
                const preData = getPreData('getHandlersByEventName', { cacheInstance, eventName }),
                const handlers = preData.cacheInstance.getHooks()[preData.eventName];
                const postData = getPostData('getHandlersByEventName', { cacheInstance: preData.cacheInstance, eventName: preData.eventName, handlers });

                return postData.handlers;
            }
        }
    }
}
```

Right now, alongside your extensions, you can create any hooks, or enable anyone else to create some.
For this method you would have `preGetHandlersByEventName` and `postGetHandlersByEventName` hooks ready at your service.

## Final word

There is no strict rule for what is needed to be passed from preData to postData. There is just a convention that I encourage you to follow.

1. `pre` handlers should take an object as an argument, with properties being the arguments passed to extension, plus cacheInstance
1. `pre` handlers should always return an object with those properties (and cacheInstance)
1. extensions body (any functionality there is) should use / take data only returned by `pre` (including cacheInstance)
1. `post` should take an object as an argument, the very same in structure as `pre` but with values taken from `pre` and with result of extensions method.
1. `post` should return an object with those properties
1. finally that method should return extensions method value passed to `post` and returned by it

Mind that `cacheInstance` is always passed to `getExtensions` method.
