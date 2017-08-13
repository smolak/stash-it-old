<table>
  <thead>
    <tr>
      <th><strong>Home</strong></th>
      <th><a href="https://smolak.github.io/stash-it/createCache.html">createCache</a></th>
      <th><a href="https://smolak.github.io/stash-it/registerPlugins.html">registerPlugins</a></th>
      <th><a href="https://smolak.github.io/stash-it/createItem.html">createItem</a></th>
      <th><a href="https://smolak.github.io/stash-it/adapters.html">adapters</a></th>
      <th><a href="https://smolak.github.io/stash-it/plugins.html">plugins</a></th>
    </tr>
  </thead>
</table>

# stash-it
Cache mechanism based on plugins.

## Installation

```sh
npm i stash-it --save
```

## createCache(adapter)

```javascript
import { createCache } from 'stash-it';
import createMemoryAdapter from 'stash-it-adapter-memory'; // use any adapter that works with stash-it

const adapter = createMemoryAdapter({ namespace: 'some-namespace' });
const cache = createCache(adapter);

cache.setItem('key', 'value');

cache.hasItem('key'); // true
```

## registerPlugins(cacheInstance, plugins)

```javascript
import { createCache, registerPlugins } from 'stash-it';
import createMemoryAdapter from 'stash-it-adapter-memory'; // use any adapter that works with stash-it
import createDebugPlugin from 'stash-it-plugin-debug'; // use any plugin that works with stash-it

const adapter = createMemoryAdapter({ namespace: 'some-namespace' });
const debugPlugin = createDebugPlugin(console.log);

const cache = createCache(adapter);
const cacheWithPlugins = registerPlugins(cache, [ debugPlugin ]);

cacheWithPlugins.runDiagnostics(); // method added by debug plugin
```

## createItem(key, value, namespace, \[extra\])

```javascript
import { createItem } from 'stash-it';

const item = createItem('key', 'value', 'namespace', { some: 'extraData' });
```
