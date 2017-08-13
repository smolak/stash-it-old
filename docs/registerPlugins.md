<table>
  <thead>
    <tr>
      <th><a href="https://smolak.github.io/stash-it/">Home</a></th>
      <th><a href="https://smolak.github.io/stash-it/createCache.html">createCache</a></th>
      <th><strong>registerPlugins</strong></th>
      <th><a href="https://smolak.github.io/stash-it/createItem.html">createItem</a></th>
      <th><a href="https://smolak.github.io/stash-it/adapters.html">adapters</a></th>
      <th><a href="https://smolak.github.io/stash-it/plugins.html">plugins</a></th>
    </tr>
  </thead>
</table>

# registerPlugins(cacheInstance, plugins)

This method registers plugins and returns new, not mutated, cacheInstance object.
It will still use the same adapter and storage.

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

A short preface: the whole idea for `stash-it` was born when I was looking for cache mechanism with tags support. I found some solutions.
But some of them had this functionality, some of them had other. None of them had what I was looking for (entirely), most of them had more than I needed.

So I thought - why not create a module with as little codebase at its core as possible, but with ability to extend it via e.g. plugins.

That's why `stash-it` has so very few methods out of the box. Doesn't have built in adapter or even ttl support. But you can get all of that through plugins (and of course adapters).

Plugins are what makes `stash-it` so powerful, extendable and flexible.

Information on how plugins are built, how to create one and how they work, can be found in [plugins]().
