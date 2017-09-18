![logo-stash-it-color-dark 2x](https://user-images.githubusercontent.com/1819138/30385483-99fd209c-98a7-11e7-85e2-595791d8d894.png)

#### stash-it is a caching mechanism based on plugins.

It's core concept is to stay simple, small and easily extendable using plugins.

##### Plugins allow you to:

* write handlers for hook'able methods
* extend API of cache object

stash-it can be used in various environments \(client, server or native\), depending on what adapter you use.

It's very small ~2kB \(including memory adapter, minified + gzipped\) with no dependencies whatsoever.

[![build status](https://img.shields.io/travis/reactjs/redux/master.svg?style=flat-square)](https://travis-ci.org/reactjs/redux)
[![Coverage Status](https://coveralls.io/repos/github/smolak/stash-it/badge.svg?branch=master)](https://coveralls.io/github/smolak/stash-it?branch=master)

### Why stash-it?

At one time, I was looking for a cache mechanism for node, that would allow me to add tags to stored items. I found some solutions. But when I dug deeper I started to find various modules that were either too big, had too few / many methods, were hard to use or not maintained for a very long time.

Then I thought - if there isn't anything close to what I am looking for, why not create something of my own.

That's how stash-it came to be.

### Installation

```bash
npm install stash-it --save
```

stash-it is just a core module, which provides means to create cache or register plugins. It doesn't come with any adapter or plugin out of the box. Therefore you will either need to provide an adapter or install one:

```bash
npm install stash-it-adapter-memory --save
```

Now, you have everything for the most basic usage of stash-it.

### Let's give it a try

_\(mind that I am using ES6 syntax\)_

```js
import { createCache } from 'stash-it';
import createMemoryAdapter from 'stash-it-adapter-memory';

// First, we need to create an adapter
const adapter = createMemoryAdapter({ namespace: 'someNamespace' });

// Now, let's create cache instance
const cache = createCache(adapter);

// Cool! Now time for some actions
cache.setItem('key', 'some very often fetched value I need to store');
cache.hasItem('key'); // true

const item = cache.getItem('key');

console.log(item.value); // some very often fetched value I need to store

cache.removeItem('key'); // true
cache.hasItem('key'); // false
```

And that's pretty much it.

**Important:** if you want to use stash-it in browser, you need to use some kind of bundler, e.g. [webpack](https://webpack.github.io/).

### Documentation

[gitbook.com/book/jaceks/stash-it](gitbook.com/book/jaceks/stash-it)

### Thanks

* [Dawid Młynarz](http://mlynarz.com) for creating stash-it's logo;

### License

MIT
