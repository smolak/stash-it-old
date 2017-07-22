import { expect } from 'chai';
import sinon from 'sinon';

import registerPlugins from '../../../src/registerPlugins';
import createCache from '../../../src/createCache';
import { createDummyAdapter } from '../helpers/dummyAdapter';
import { nonArrayValues, nonFunctionValues, nonObjectValues } from '../helpers/validatonTests';

describe('registerPlugins', () => {
    const methods = {
        foo: sinon.spy(),
        bar: sinon.spy()
    };
    const getExtensionsStub = sinon.stub().returns(methods);
    const plugin = {
        getExtensions: getExtensionsStub,
        hooks: []
    };
    const namespace = 'namespace';
    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter({ namespace });
        cache = createCache(dummyAdapter);

        getExtensionsStub.resetHistory();
    });

    context('when cache instance is not passed as an object', () => {
        it('should throw', () => {
            nonObjectValues.forEach((value) => {
                expect(registerPlugins.bind(null, value, []))
                    .to.throw('`cacheInstance` must be an object.');
            });
        });
    });

    context('when plugins are not passed as an array', () => {
        it('should throw', () => {
            nonArrayValues.forEach((value) => {
                expect(registerPlugins.bind(null, cache, value))
                    .to.throw('`plugins` need to be passed as an array.');
            });
        });
    });

    context('when getExtensions is not a function', () => {
        it('should throw', () => {
            const nonNilValues = nonFunctionValues.filter((value) => {
                const result = [ null, undefined, false, 0 ].includes(value);

                return !result;
            });

            nonNilValues.forEach((value) => {
                const customPlugin = {
                    getExtensions: value,
                    hooks: []
                };

                expect(registerPlugins.bind(null, cache, [ customPlugin ]))
                    .to.throw('`getExtensions` must be a function.');
            });
        });
    });

    context('when there are no hooks and getExtension', () => {
        it('should throw', () => {
            const notAPlugin = {};

            expect(registerPlugins.bind(null, cache, [ notAPlugin ]))
                .to.throw('Plugin must contain hooks or getExtensions method or both.');
        });
    });

    it('should add hooks to cache instance', () => {
        sinon.spy(cache, 'addHooks');

        registerPlugins(cache, [ plugin ]);

        expect(cache.addHooks)
            .to.have.been.calledWith(plugin.hooks)
            .to.have.been.calledOnce;

        cache.addHooks.restore();
    });

    it('should add extensions', () => {
        registerPlugins(cache, [ plugin ]);

        expect(plugin.getExtensions).to.have.been.calledOnce;
    });

    it('should return cache object extended by methods from plugin', () => {
        const cacheWithPlugins = registerPlugins(cache, [ plugin ]);

        expect(cacheWithPlugins).to.have.property('foo');
        expect(cacheWithPlugins).to.have.property('bar');

        cacheWithPlugins.foo();
        cacheWithPlugins.bar();

        expect(methods.foo).to.have.been.calledOnce;
        expect(methods.bar).to.have.been.calledOnce;
    });

    context('when method from plugin already exists in cache', () => {
        it('should throw', () => {
            const cacheWithPlugins = registerPlugins(cache, [ plugin ]);

            expect(registerPlugins.bind(null, cacheWithPlugins, [ plugin ]))
                .to.throw('Extension \'foo\' already exists.');
        });
    });

    context('when there are no extensions in plugin', () => {
        it('should return passed, unchanged cache instance', () => {
            const cacheWithPlugins = registerPlugins(cache, [ { hooks: [] }]);

            expect(cacheWithPlugins).to.equal(cache);
        });
    });
});
