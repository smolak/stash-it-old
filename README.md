# stash-it
Cache mechanism based on plugins.

## Installation

```sh
npm i stash-it --save
```

## Usage

```javascript
import { createCache } from 'stash-it';
import createMemoryAdapter from 'stash-it-adapter-memory'; // use any adapter that works with stash-it

const adapter = createMemoryAdapter({ namespace: 'some-namespace' });
const cache = createCache(adapter);

cache.setItem('key', 'value');

cache.hasItem('key'); // true
```

And that's it.

For full docs, checkout https://smolak.github.io/stash-it/.
