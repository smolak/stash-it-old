import { expect } from 'chai';
import sinon from 'sinon';
import { nonObjectValues, nonStringValues, createDummyAdapter } from 'stash-it-test-helpers';

import {createCache, getPreData} from '../../../../src/createCache';
import createItem from '../../../../src/createItem';

describe('getPreData', () => {
    let cache;
    let dummyAdapter;
    let anyValidArgs;

    const createHook = (event, handler) => {
        return { event, handler };
    };

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        cache = createCache(dummyAdapter);
        anyValidArgs = { cacheInstance: cache };
    });

    context('when method name is not passed as a string', () => {
        it('should throw', () => {
            nonStringValues.forEach((methodName) => {
                expect(getPreData.bind(null, methodName)).to.throw("'methodName' must be a string.");
            });
        });
    });

    context('when args are not passed as an object', () => {
        it('should throw', () => {
            nonObjectValues.forEach((value) => {
                expect(getPreData.bind(null, 'someMethodName', value)).to.throw("'args' must be an object.");
            });
        });
    });

    context(`when args don't contain cacheInstance`, () => {
        it('should throw', () => {
            expect(getPreData.bind(null, 'someMethodName', {}))
                .to.throw("'args' must contain 'cacheInstance' property.");
        });
    });

    it('should return object with the same keys as passed with cacheInstance as an additional one', (done) => {
        const args = { cacheInstance: cache, foo: 'bar' };

        getPreData('someMethodName', args).then((preData) => {
            const keys = Object.keys(preData);
            const expectedKeys = [ 'cacheInstance', 'foo' ];

            expect(keys).to.deep.eq(expectedKeys);

            done();
        });
    });

    it('should return reference to cache instance under cacheInstance property', (done) => {
        const handler = () => {};

        cache.addHook({ event: 'preSomething', handler });

        const args = { cacheInstance: cache, foo: 'bar' };

        getPreData('someMethodName', args).then((preData) => {
            const cacheInstance = preData.cacheInstance;
            const expectedHooks = {
                preSomething: [
                    handler
                ]
            };

            expect(cacheInstance === cache).to.be.true;
            expect(cacheInstance).to.deep.equal(cache);
            expect(cacheInstance.getHooks()).to.deep.equal(expectedHooks);

            done();
        });
    });

    context('when there is no hook for given event', () => {
        it('should return args in an exact form as they were passed in the first place', (done) => {
            const args = { foo: 'bar', cacheInstance: cache };
            const spy = sinon.spy();
            const hook = {
                event: 'preSomeOtherEventName',
                handler: spy
            };

            cache.addHook(hook);

            getPreData('eventName', args).then((preData) => {
                expect(preData === args).to.be.true;
                expect(preData).to.deep.equal(args);
                expect(spy).to.not.have.been.called;

                done();
            });
        });
    });

    context('when there is a hook for given event', () => {
        it(`should return args handled by that hook's handler (whatever it does)`, async () => {
            const identityStub = sinon.stub().returnsArg(0);
            const hook = createHook('preEventName', identityStub);

            cache.addHook(hook);

            const preData = await getPreData('eventName', anyValidArgs);

            expect(preData).to.deep.equal(anyValidArgs);
            expect(identityStub).to.have.been.calledWith(anyValidArgs).to.have.been.calledOnce;
        });
    });

    context('when there are hooks for given event', () => {
        it('should execute handlers in sequence, waiting for one to finish, before executing next one', async () => {
            const stallFor = async (time) => await new Promise(resolve => setTimeout(resolve, time));
            const spyForSlowHandler = sinon.spy();
            const handlerThatTakesLongToExecute = async () => await stallFor(50).then(spyForSlowHandler);
            const handlerThatExecutesImmediately = sinon.spy();
            const hookWithSlowHandler = createHook('preEventName', handlerThatTakesLongToExecute);
            const hookWithFastHandler = createHook('preEventName', handlerThatExecutesImmediately);

            cache.addHooks([ hookWithSlowHandler, hookWithFastHandler ]);
            await getPreData('eventName', anyValidArgs);

            expect(spyForSlowHandler).to.have.been.calledBefore(handlerThatExecutesImmediately);
        });
    });
});
