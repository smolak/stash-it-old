import { expect } from 'chai';
import sinon from 'sinon';
import { nonObjectValues, nonStringValues, createDummyAdapter } from 'stash-it-test-helpers';

import {createCache, getPreData} from '../../../../src/createCache';
import createItem from '../../../../src/createItem';

describe('getPreData', () => {
    let cacheInstance;
    let dummyAdapter;
    let anyValidArgs;

    const createHook = (event, handler) => {
        return { event, handler };
    };

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        cacheInstance = createCache(dummyAdapter);
        anyValidArgs = { cacheInstance };
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

    it('should return object with the same keys that args were passed with (as values can differ)', async () => {
        const preData = await getPreData('someMethodName', anyValidArgs);
        const keys = Object.keys(preData);
        const expectedKeys = [ 'cacheInstance' ];

        expect(keys).to.deep.eq(expectedKeys);
    });

    describe('returned cacheInstance', () => {
        it('should return reference to cacheInstance instance under cacheInstance property', async () => {
            const preData = await getPreData('someMethodName', anyValidArgs);

            expect(preData.cacheInstance).to.not.be.undefined;
        });

        it('should return reference to cacheInstance', async () => {
            const preData = await getPreData('someMethodName', anyValidArgs);

            expect(preData.cacheInstance === cacheInstance).to.be.true;
        });
    });

    context('when there is no hook for given event', () => {
        it('should return args in an exact form as they were passed in the first place', async () => {
            const eventHandler = () => {};
            const hook = createHook('preSomeOtherEventName', eventHandler);

            cacheInstance.addHook(hook);

            const preData = await getPreData('eventName', anyValidArgs);

            expect(preData === anyValidArgs).to.be.true;
        });

        it('should not pass args through hooks that were registered for that event', async () => {
            const spy = sinon.spy();
            const hook = createHook('preSomeOtherEventName', spy);

            cacheInstance.addHook(hook);

            await getPreData('eventName', anyValidArgs);

            expect(spy).to.not.have.been.called;
        });
    });

    context('when there is a hook for given event', () => {
        it(`should return args handled by that hook's handler (whatever it does)`, async () => {
            const identityStub = sinon.stub().returnsArg(0);
            const hook = createHook('preEventName', identityStub);

            cacheInstance.addHook(hook);

            const preData = await getPreData('eventName', anyValidArgs);

            expect(preData).to.deep.equal(anyValidArgs);
            expect(identityStub).to.have.been.calledWith(anyValidArgs).to.have.been.calledOnce;
        });
    });

    describe('executing handlers', () => {
        context('for synchronous handlers', () => {
            it('should happen in sequence', async () => {
                const hook1 = {
                    event: 'preEventName',
                    handler: sinon.spy()
                };
                const hook2 = {
                    event: 'preEventName',
                    handler: sinon.spy()
                };

                cacheInstance.addHooks([ hook1, hook2 ]);
                await getPreData('eventName', anyValidArgs);

                expect(hook1.handler).to.have.been.calledBefore(hook2.handler);
            });
        });

        context('for asynchronous handlers', () => {
            it('should happen in sequence', async () => {
                const stallFor = async (time) => await new Promise(resolve => setTimeout(resolve, time));
                const spyForSlowHandler = sinon.spy();
                const hook1 = {
                    event: 'preEventName',
                    handler: async () => {
                        await stallFor(50);
                        spyForSlowHandler();
                    }
                };
                const hook2 = {
                    event: 'preEventName',
                    handler: sinon.spy()
                };

                cacheInstance.addHooks([ hook1, hook2 ]);
                await getPreData('eventName', anyValidArgs);

                expect(spyForSlowHandler).to.have.been.calledBefore(hook2.handler);
            });
        });
    });
});
