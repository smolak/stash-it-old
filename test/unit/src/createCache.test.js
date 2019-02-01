import { expect } from 'chai';
import R from 'ramda';
import { createDummyAdapter, nonObjectValues } from 'stash-it-test-helpers';

import createItem from '../../../src/createItem';
import { createCache } from '../../../src/createCache';
import requiredMethods from '../../../src/requiredMethods';

describe('createCache', () => {
    const hooksProperty = 'hooks';
    const expectedMethodsWithHooksProperty = [
        'addExtra',
        'addHook',
        'addHooks',
        'getExtra',
        'getHooks',
        'getItem',
        'hasItem',
        'removeItem',
        'setItem',
        'setExtra',
        'registerPlugins',
        hooksProperty
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
        expect(cache).to.have.all.keys(expectedMethodsWithHooksProperty);
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
});
