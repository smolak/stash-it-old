<table>
  <thead>
    <tr>
      <th><a href="https://smolak.github.io/stash-it/">Home</a></th>
      <th><a href="https://smolak.github.io/stash-it/createCache.html">createCache</a></th>
      <th><a href="https://smolak.github.io/stash-it/registerPlugins.html">registerPlugins</a></th>
      <th><a href="https://smolak.github.io/stash-it/createItem.html">createItem</a></th>
      <th><strong>adapters</strong></th>
      <th><a href="https://smolak.github.io/stash-it/plugins.html">plugins</a></th>
    </tr>
  </thead>
</table>

# adapters

Adapters are 'connectors' between cache instance and storage. `createCache`, that creates cache instance, provides proxy to `adapter`s API to its storage.

You can use any adapter that is compatible with `stash-it`. You can also create one.

1. [Available adapters](#available-adapters)
1. [How to write my own adapter?](#how-to-write-my-own-adapter)

## Available adapters

1. [Memory adapter](https://github.com/smolak/stash-it-adapter-memory)

... more to come.

*If you have created your own adapter, give me a hint, I will have a look and if it's fine, it will appear on the list as well.*

## How to write my own adapter?

Creating adapters is fairly easy. The only thing you need to provide is API compatible with cache instance created using `createCache`.

*tl;dr* - your adapter needs to have those methods:

```javascript
{
    buildKey,
    getItem,
    getExtra,
    setItem,
    hasItem,
    removeItem
}
```

Adapter itself should be constructed in any form: factory, plain object. Whatever you want.

For example:

```javascript
// example 1
export default const {
    // methods go here
}

// example 2
const SomeAdapter = (options) => {
    // do something with options, e.g. connect to some DB

    return {
        // methods go here
    }
};

export default SomeAdapter;
```

> **Important**: if you are going to use `createItem`, you need to pass `namespace` while creating adapter.
> So, `example 2` (see above) is the way to go.
> Why?
> `createItem` uses `namespace` to store it in `extra`.
> Technically it could be omitted, but you would have a lot of undefineds in your storage.
>
> Also, I encourage you to have a look at [memory adapter](https://github.com/smolak/stash-it-adapter-memory) how it is build,
> as it is very simple and straightforward.

### Required methods:

#### buildKey(key)
This method needs to take `key` as an argument and return built key.

#### getItem(key)
This method needs to take `key` and return an item.

If item doesn't exist, it should return `undefined`.

#### getExtra(key)
This method needs to take `key` and return `extra` from item found for given key. If item can't be found, it should return `undefined`.

#### setItem(key, value, [extra])
This method needs to take `key`, `value` and optionally `extra`.
`extra` if not passed should default to empty object if you are going to use `createItem` helper method to create an item.
If you are going to use your own, custom method, it's up to you what `extra` will default to.
Remember, that `extra` **must** be accessible from the item.

This method should return newly created item.

#### hasItem(key)
This method needs to take `key` and return `true` if item is present, `false` otherwise.

#### removeItem(key)
This method needs to take `key` and return `true` if item was deleted, `false` otherwise.
