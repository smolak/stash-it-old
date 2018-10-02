import { expect } from 'chai';
import sinon from 'sinon';
import { nonObjectValues, createDummyAdapter } from 'stash-it-test-helpers';

import { createCache, emit } from '../../../../src/createCache';
import createItem from '../../../../src/createItem';

describe('events emitter', () => {
    const eventName = 'preSomeEvent';
    const someOtherEventName = 'preSomeOtherEvent';

    let cacheInstance;
    let dummyAdapter;
    let anyValidArgs;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        cacheInstance = createCache(dummyAdapter);
        anyValidArgs = { cacheInstance };
    });

    context('when args are not passed as an object', () => {
        it('should throw', () => {
            nonObjectValues.forEach((value) => {
                expect(emit.bind(null, eventName, value)).to.throw("'args' must be an object.");
            });
        });
    });

    context(`when args don't contain cacheInstance`, () => {
        it('should throw', () => {
            expect(emit.bind(null, eventName, {})).to.throw("'args' must contain 'cacheInstance' property.");
        });
    });

    it('should return an object with the same keys that args were passed with (values can differ)', async () => {
        const returnedData = await emit(eventName, anyValidArgs);
        const keys = Object.keys(returnedData);
        const expectedKeys = [ 'cacheInstance' ];

        expect(keys).to.deep.eq(expectedKeys);
    });

    describe('returned data', () => {
        it('should contain cacheInstance', async () => {
            const returnedData = await emit(eventName, anyValidArgs);

            expect(returnedData.cacheInstance).to.not.be.undefined;
        });

        it('should contain cacheInstance that is a reference to the cacheInstance used in args', async () => {
            const returnedData = await emit(eventName, anyValidArgs);

            expect(returnedData.cacheInstance === anyValidArgs.cacheInstance).to.be.true;
        });

        context('when there is no hook for given event', () => {
            it('should return the very same args as ones passed to the emitter', async () => {
                cacheInstance.addHook({ event: someOtherEventName, handler: () => {} });

                const returnedData = await emit(eventName, anyValidArgs);

                expect(returnedData === anyValidArgs).to.be.true;
            });

            it('should not pass args through handlers that were registered for different event', async () => {
                const hook = { event: someOtherEventName, handler: sinon.spy() };

                cacheInstance.addHook(hook);

                await emit(eventName, anyValidArgs);

                expect(hook.handler).to.not.have.been.called;
            });
        });

        context('when there is a hook for given event', () => {
            it('should pass args through handler for that event', async () => {
                const hook = { event: eventName, handler: sinon.spy() };

                cacheInstance.addHook(hook);
                await emit(eventName, anyValidArgs);

                expect(hook.handler).to.have.been.calledWithExactly(anyValidArgs);
            });

            it('should return data returned by handler for that event (whatever it does)', async () => {
                cacheInstance.addHook({ event: eventName, handler: (args) => args });

                const returnedData = await emit(eventName, anyValidArgs);

                expect(returnedData).to.deep.equal(anyValidArgs);
            });
        });
    });

    describe('executing handlers', () => {
        context('for synchronous handlers', () => {
            it('should happen in sequence', async () => {
                const hook1 = {
                    event: eventName,
                    handler: sinon.spy()
                };
                const hook2 = {
                    event: eventName,
                    handler: sinon.spy()
                };

                cacheInstance.addHooks([ hook1, hook2 ]);
                await emit(eventName, anyValidArgs);

                expect(hook1.handler).to.have.been.calledBefore(hook2.handler);
            });
        });

        context('for asynchronous handlers', () => {
            it('should happen in sequence', async () => {
                const stallFor = async (time) => await new Promise(resolve => setTimeout(resolve, time));
                const spyForSlowHandler = sinon.spy();
                const hook1 = {
                    event: eventName,
                    handler: async () => {
                        await stallFor(30);
                        spyForSlowHandler();
                    }
                };
                const hook2 = {
                    event: eventName,
                    handler: sinon.spy()
                };

                cacheInstance.addHooks([ hook1, hook2 ]);
                await emit(eventName, anyValidArgs);

                expect(spyForSlowHandler).to.have.been.calledBefore(hook2.handler);
            });
        });
    });
});
