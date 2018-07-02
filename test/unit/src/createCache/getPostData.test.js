import sinon from 'sinon';
import { expect } from 'chai';
import { nonObjectValues, nonStringValues, createDummyAdapter } from 'stash-it-test-helpers';

import { createCache, getPostData } from '../../../../src/createCache';
import createItem from '../../../../src/createItem';

describe('getPostData', () => {
    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        cache = createCache(dummyAdapter);
    });

    context('when method name is not passed as a string', () => {
        it('should throw', () => {
            nonStringValues.forEach((methodName) => {
                expect(getPostData.bind(null, methodName))
                    .to.throw("'methodName' must be a string.");
            });
        });
    });

    context('when args are not passed as an object', () => {
        it('should throw', () => {
            nonObjectValues.forEach((value) => {
                expect(getPostData.bind(null, 'someMethodName', value)).to.throw("'args' must be an object.");
            });
        });
    });

    context(`when args don't contain cacheInstance`, () => {
        it('should throw', () => {
            expect(getPostData.bind(null, 'someMethodName', {}))
                .to.throw("'args' must contain 'cacheInstance' property.");
        });
    });

    it('should return object with the same keys as passed with cacheInstance as an additional one', () => {
        const args = { cacheInstance: cache, foo: 'bar' };
        const preData = getPostData('someMethodName', args);
        const keys = Object.keys(preData);
        const expectedKeys = [ 'cacheInstance', 'foo' ];

        expect(keys).to.deep.eq(expectedKeys);
    });

    it('should return reference to cache instance under cacheInstance property', () => {
        const handler = () => {};

        cache.addHook({ event: 'preSomething', handler });

        const args = { cacheInstance: cache, foo: 'bar' };
        const preData = getPostData('someMethodName', args);
        const cacheInstance = preData.cacheInstance;
        const expectedHooks = {
            preSomething: [
                handler
            ]
        };

        expect(cacheInstance === cache).to.be.true;
        expect(cacheInstance).to.deep.equal(cache);
        expect(cacheInstance.getHooks()).to.deep.equal(expectedHooks);
    });

    context('when there is no hook for given event', () => {
        it('should return args in an exact form as they were passed in the first place', () => {
            const args = { foo: 'bar', cacheInstance: cache };
            const spy = sinon.spy();
            const hook = {
                event: 'postSomeOtherEventName',
                handler: spy
            };

            cache.addHook(hook);

            const returnedArgs = getPostData('eventName', args);

            expect(returnedArgs === args).to.be.true;
            expect(returnedArgs).to.deep.equal(args);
            expect(spy).to.not.have.been.called;
        });
    });

    context('when there is a hook for given event', () => {
        it(`should return args handled by that hook's handler (whatever it does)`, () => {
            const args = { foo: 'bar', cacheInstance: cache };
            const stub = sinon.stub().returnsArg(0);
            const hook = {
                event: 'postEventName',
                handler: stub
            };

            cache.addHook(hook);

            const returnedArgs = getPostData('eventName', args);

            expect(returnedArgs).to.deep.equal(args);
            expect(stub)
                .to.have.been.calledWith(args)
                .to.have.been.calledOnce;
        });
    });
});
