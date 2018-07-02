import { expect } from 'chai';
import sinon from 'sinon';
import R from 'ramda';
import {
    createDummyAdapter,
    nonArrayValues,
    nonFunctionValues,
    nonObjectValues
} from 'stash-it-test-helpers';

import createItem from '../../../src/createItem';
import { createCache } from '../../../src/createCache';
import requiredMethods from '../../../src/requiredMethods';

describe('createCache', () => {
    const expectedMethods = [
        'addExtra',
        'addHook',
        'addHooks',
        'buildKey',
        'getExtra',
        'getHooks',
        'getItem',
        'hasItem',
        'removeItem',
        'setItem',
        'setExtra',
        'registerPlugins'
    ];

    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        cache = createCache(dummyAdapter);
    });

    it('should create cache object', () => {
        expect(cache).to.be.ok;
    });

    it('should create cache object with all methods', () => {
        expect(cache).to.have.all.keys(expectedMethods);
    });

    context('when adapter is not an object', () => {
        it('should throw', () => {
            nonObjectValues.forEach((adapterDouble) => {
                expect(createCache.bind(null, adapterDouble)).to.throw("'adapter' must be an object.");
            });
        });
    });

    context('when not all required methods are present', () => {
        it('should throw', () => {
            requiredMethods.forEach((methodName, index) => {
                const allMethodsButOne = R.remove(index, 1, requiredMethods);
                const adapterDouble = {};

                allMethodsButOne.forEach((methodName) => {
                    adapterDouble[methodName] = '';
                });

                expect(createCache.bind(null, adapterDouble)).to.throw('Not all required methods are present in adapter.');
            });
        });
    });

    context('when not all required methods are functions', () => {
        it('should throw', () => {
            requiredMethods.forEach((methodName, index) => {
                const allMethodsButOne = R.remove(index, 1, requiredMethods);
                const adapterDouble = {
                    [methodName]: ''
                };

                allMethodsButOne.forEach((methodName) => {
                    adapterDouble[methodName] = () => {};
                });

                expect(createCache.bind(null, adapterDouble)).to.throw('Not all required methods are functions.');
            });
        });
    });

    describe('registerPlugins', () => {
        const methods = {
            foo: sinon.spy(),
            bar: sinon.spy()
        };
        const createExtensionsStub = sinon.stub().returns(methods);
        const preSomeActionEventHandler = () => {};
        const plugin = {
            createExtensions: createExtensionsStub,
            hooks: [
                {
                    event: 'preSomeAction',
                    handler: preSomeActionEventHandler
                }
            ]
        };

        beforeEach(() => {
            createExtensionsStub.resetHistory();
        });

        context('when plugins are not passed as an array', () => {
            it('should throw', () => {
                nonArrayValues.forEach((value) => {
                    expect(cache.registerPlugins.bind(null, value))
                        .to.throw("'plugins' need to be passed as an array.");
                });
            });
        });

        context('when there are no hooks and getExtension', () => {
            it('should throw', () => {
                const notAPlugin = {};

                expect(cache.registerPlugins.bind(null, [ notAPlugin ]))
                    .to.throw('Plugin must contain hooks or createExtensions method or both.');
            });
        });

        it('should add hooks to cache instance', () => {
            cache.registerPlugins([ plugin ]);

            const expectedRegisteredHooks = {
                preSomeAction: [ preSomeActionEventHandler ]
            };

            expect(cache.getHooks()).to.deep.equal(expectedRegisteredHooks);
        });

        context(`when plugin's createExtensions property is not present`, () => {
            it('should return unchanged cache instance', () => {
                const pluginWithHooksOnly = { hooks: [] };
                const cacheWithPlugins = cache.registerPlugins([ pluginWithHooksOnly ]);

                expect(cacheWithPlugins).to.equal(cache);
            });
        });

        context(`when plugin's createExtensions property is not a function`, () => {
            it('should throw', () => {
                const nonNilValues = nonFunctionValues.filter((value) => {
                    const result = [ null, undefined, false, 0 ].includes(value);

                    return !result;
                });

                nonNilValues.forEach((value) => {
                    const customPlugin = {
                        createExtensions: value,
                        hooks: []
                    };

                    expect(cache.registerPlugins.bind(cache, [ customPlugin ]))
                        .to.throw("'createExtensions' must be a function.");
                });
            });
        });

        it('should return cache object extended by methods from plugins', () => {
            const methods2 = {
                bam: sinon.spy(),
                baz: sinon.spy()
            };
            const plugin2 = {
                createExtensions: () => methods2
            };

            const cacheWithPlugins = cache.registerPlugins([ plugin, plugin2 ]);

            expect(cacheWithPlugins).to.have.property('foo');
            expect(cacheWithPlugins).to.have.property('bar');
            expect(cacheWithPlugins).to.have.property('baz');
            expect(cacheWithPlugins).to.have.property('bam');

            cacheWithPlugins.foo();
            cacheWithPlugins.bar();
            cacheWithPlugins.baz();
            cacheWithPlugins.bam();

            expect(methods.foo).to.have.been.calledOnce;
            expect(methods.bar).to.have.been.calledOnce;
            expect(methods2.baz).to.have.been.calledOnce;
            expect(methods2.bam).to.have.been.calledOnce;
        });

        it('should return freezed cache object', () => {
            const cacheWithPlugins = cache.registerPlugins([ plugin ]);

            expectedMethods.forEach((methodName) => {
                try {
                    delete cacheWithPlugins[methodName];
                } catch(e) {}

                expect(cacheWithPlugins[methodName]).to.be.ok;
            });
        });

        context(`when plugin doesn't extend cache instance with new methods`, () => {
            it('should return freezed cache object', () => {
                const pluginWithHooksOnly = { hooks: [] };
                const cacheWithPlugins = cache.registerPlugins([ pluginWithHooksOnly ]);

                expectedMethods.forEach((methodName) => {
                    try {
                        delete cacheWithPlugins[methodName];
                    } catch(e) {}

                    expect(cacheWithPlugins[methodName]).to.be.ok;
                });
            });
        });

        context('when method from plugin already exists in cache', () => {
            it('should throw', () => {
                const cacheWithPlugin = cache.registerPlugins([ plugin ]);

                expect(cacheWithPlugin.registerPlugins.bind(cacheWithPlugin, [ plugin ]))
                    .to.throw("Extension 'foo' already exists.");
            });
        });

        context('when plugins that contain methods of the same name are registered', () => {
            it('should throw', () => {
                expect(cache.registerPlugins.bind(cache, [ plugin, plugin ]))
                    .to.throw("Extension 'foo' already exists.");
            });
        });
    });
});
