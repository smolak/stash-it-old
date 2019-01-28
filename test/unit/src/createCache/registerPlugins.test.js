import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache, emit } from '../../../../src/createCache';

describe('registerPlugins', () => {
    const methods = {
        foo: sinon.spy(),
        bar: sinon.spy()
    };
    const createExtensionsStub = sinon.stub().returns(methods);
    const preSomeActionEventHandler = () => {};
    const pluginWithExtensionsAndHooks = {
        createExtensions: createExtensionsStub,
        hooks: [
            {
                event: 'preSomeAction',
                handler: preSomeActionEventHandler
            }
        ]
    };

    const methods2 = {
        bam: sinon.spy(),
        baz: sinon.spy()
    };
    const pluginWithExtensionsOnly = {
        createExtensions: () => methods2
    };

    const postSomeActionEventHandler = () => {};
    const pluginWithHooksOnly = {
        hooks: [
            {
                event: 'postSomeAction',
                handler: postSomeActionEventHandler
            }
        ]
    };

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

        createExtensionsStub.resetHistory();
    });

    context('when plugins are not passed as an array', () => {
        it('should throw', () => {
            const notAnArray = 'but a string';

            expect(cache.registerPlugins.bind(null, notAnArray))
                .to.throw("'plugins' need to be passed as an array.");
        });
    });

    context('when there are no hooks and getExtension method', () => {
        it('should throw', () => {
            const notAPlugin = {};

            expect(cache.registerPlugins.bind(null, [ notAPlugin ]))
                .to.throw('Plugin must contain hooks or createExtensions method or both.');
        });
    });

    context('when plugin contains hooks', () => {
        it('should add hooks to cache instance', () => {
            const cacheWithPlugin = cache.registerPlugins([ pluginWithHooksOnly ]);

            const expectedRegisteredHooks = {
                postSomeAction: [ postSomeActionEventHandler ]
            };

            expect(cacheWithPlugin.getHooks()).to.deep.equal(expectedRegisteredHooks);
        });
    });

    context('when plugin contains createExtensions', () => {
        context(`when createExtensions is not a function`, () => {
            it('should throw', () => {
                const notAFunction = 'but a string';
                const customPlugin = {
                    createExtensions: notAFunction,
                    hooks: []
                };

                expect(cache.registerPlugins.bind(cache, [ customPlugin ]))
                    .to.throw("'createExtensions' must be a function.");
            });
        });

        it('should call createExtensions with required arguments', () => {
            cache.registerPlugins([ pluginWithExtensionsAndHooks ]);

            expect(pluginWithExtensionsAndHooks.createExtensions)
                .to.have.been.calledWithExactly({ cacheInstance: cache, emit })
                .to.have.been.calledOnce;
        });

        it('should return cache object extended by methods from plugins', () => {
            const cacheWithPlugins = cache.registerPlugins([ pluginWithExtensionsAndHooks, pluginWithExtensionsOnly ]);

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
    });

    it('should return freezed cache object', () => {
        const anyPlugin = pluginWithExtensionsAndHooks;
        const cacheWithPlugins = cache.registerPlugins([ anyPlugin ]);
        const attemptToDeleteAMethod = (cacheInstance, methodName) => {
            try {
                delete cacheWithPlugins[methodName];
            } catch (e) {}
        };

        expectedMethods.forEach((methodName) => {
            attemptToDeleteAMethod(cacheWithPlugins, methodName);

            expect(cacheWithPlugins[methodName]).to.be.ok;
        });
    });

    context('when method from plugin already exists in cache', () => {
        it('should throw', () => {
            const cacheWithPlugin = cache.registerPlugins([ pluginWithExtensionsAndHooks ]);

            expect(cacheWithPlugin.registerPlugins.bind(cacheWithPlugin, [ pluginWithExtensionsAndHooks ]))
                .to.throw("Extension 'foo' already exists.");
        });
    });

    context('when plugins that contain methods of the same name are registered', () => {
        it('should throw', () => {
            expect(cache.registerPlugins.bind(cache, [ pluginWithExtensionsAndHooks, pluginWithExtensionsAndHooks ]))
                .to.throw("Extension 'foo' already exists.");
        });
    });

    describe('hooks inheritance', () => {
        context('when different hooks are registered using registerPlugins method', () => {
            it('should add hooks only to returned cache object, not the original one', () => {
                const hooksFromInitialCache = cache.getHooks();

                const cacheWithFirstPlugin = cache.registerPlugins([ pluginWithHooksOnly ]);
                const hooksFromCacheWithFirstPlugin = cacheWithFirstPlugin.getHooks();

                const cacheWithFirstAndSecondPlugin = cacheWithFirstPlugin.registerPlugins([ pluginWithExtensionsAndHooks ]);
                const hooksFromCacheWithBothPlugins = cacheWithFirstAndSecondPlugin.getHooks();

                expect(hooksFromInitialCache).to.not.deep.equal(hooksFromCacheWithFirstPlugin);
                expect(hooksFromCacheWithFirstPlugin).to.not.deep.equal(hooksFromCacheWithBothPlugins);
                expect(hooksFromInitialCache).to.not.deep.equal(hooksFromCacheWithBothPlugins);
            });
        });

        context('when the same hooks are registered using registerPlugins method', () => {
            it('should add hooks only to returned cache object, not the original one', () => {
                const hooksFromInitialCache = cache.getHooks();

                const cacheWithFirstPlugin = cache.registerPlugins([ pluginWithHooksOnly ]);
                const hooksFromCacheWithFirstPlugin = cacheWithFirstPlugin.getHooks();

                const cacheWithFirstAndSecondPlugin = cacheWithFirstPlugin.registerPlugins([ pluginWithHooksOnly ]);
                const hooksFromCacheWithBothPlugins = cacheWithFirstAndSecondPlugin.getHooks();

                expect(hooksFromInitialCache).to.not.deep.equal(hooksFromCacheWithFirstPlugin);
                expect(hooksFromCacheWithFirstPlugin).to.not.deep.equal(hooksFromCacheWithBothPlugins);
                expect(hooksFromInitialCache).to.not.deep.equal(hooksFromCacheWithBothPlugins);
            });
        });
    });
});
