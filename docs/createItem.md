<table>
  <thead>
    <tr>
      <th><a href="https://smolak.github.io/stash-it/">Home</a></th>
      <th><a href="https://smolak.github.io/stash-it/createCache.html">createCache</a></th>
      <th><a href="https://smolak.github.io/stash-it/registerPlugins.html">registerPlugins</a></th>
      <th><strong>createItem</strong></th>
      <th><a href="https://smolak.github.io/stash-it/adapters.html">adapters</a></th>
      <th><a href="https://smolak.github.io/stash-it/plugins.html">plugins</a></th>
    </tr>
  </thead>
</table>

# createItem(key, value, namespace, \[extra\])

This method creates an item.
It's a helper method for adapters, e.g. [memory adapter](https://github.com/smolak/stash-it-adapter-memory).

It returns an item (object).

**extra** is optional and defaults to empty object.
If it's passed, it must be an object. It will be validated against `namespace` property - it can't contain it.
If there will be one, this method will throw.

Example usage:

```javascript
import { createItem } from 'stash-it';

const item = createItem('key', 'value', 'namespace', { some: 'extraData' });

// Item will look like this:
{
    key: 'key',
    value: 'value',
    extra: {
        namespace: 'namespace',
        some: 'extraData'
    }
}
```

**Why only extra is validated?**

That's because `key` and `namespace` is being validated by adapter.
`extra` is ... something extra that is being added to the item. Anything you can think of (and can be put inside an object).

`extra`, by default, will store `namespace`, therefore it's being validated against passing that property to it.

**Can I create an object of my own?**

Sure. That's just a helper method. But I encourage you to use it to stay consistent with `stash-it`s conventions.
