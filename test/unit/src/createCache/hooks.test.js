import { expect } from 'chai';
import {
    createDummyAdapter,
    nonArrayValues,
    nonFunctionValues,
    nonStringValues
} from 'stash-it-test-helpers';

import { createCache } from '../../../../src/createCache';
import createItem from '../../../../src/createItem';

describe('hooks', () => {
    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        cache = createCache(dummyAdapter);
    });

    it('should have empty hooks by default', () => {
        expect(cache.getHooks()).to.deep.eq({});
    });

    it('should not share hooks between different instances of created cache', () => {
        const cache1 = createCache(dummyAdapter);
        const cache2 = createCache(dummyAdapter);

        cache1.addHook({ event: 'preSomething', handler: () => {} });
        cache2.addHook({ event: 'postSomething', handler: () => {} });

        const cache3 = createCache(dummyAdapter);

        const hooks1 = cache1.getHooks();
        const hooks2 = cache2.getHooks();
        const hooks3 = cache3.getHooks();

        expect(hooks1).to.not.deep.equal(hooks2);
        expect(hooks1).to.not.deep.equal(hooks3);
        expect(hooks2).to.not.deep.equal(hooks3);
    });

    describe('addHook method', () => {
        context('when event is not of string type', () => {
            it('should throw', () => {
                nonStringValues.forEach((value) => {
                    expect(cache.addHook.bind(null, { event: value }))
                        .to.throw(`Hook's event must be a string.`);
                });
            });
        });

        context("when event doesn't start with 'pre' or 'post'", () => {
            it('should throw', () => {
                expect(cache.addHook.bind(null, { event: 'someEvent' }))
                    .to.throw("Hook's event must start with 'pre' or 'post'.");
            });
        });

        context('when handler is not a function', () => {
            it('should throw', () => {
                nonFunctionValues.forEach((value) => {
                    expect(cache.addHook.bind(null, { event: 'preSomething', handler: value }))
                        .to.throw(`Hook's handler must be a function.`);
                });
            });
        });

        context('when there are no hooks at all registered for given event', () => {
            it('should return an object with only this one, newly added handler in an array', () => {
                const handler = () => {};
                const hook = {
                    event: 'preSomeEvent',
                    handler
                };

                cache.addHook(hook);

                const expectedHooks = {
                    preSomeEvent: [ handler ]
                };

                expect(cache.getHooks()).to.deep.equal(expectedHooks);
            });
        });

        context('when there are already some hooks registered for given event', () => {
            it('should return an object with this, newly added handler in an array as last item', () => {
                const handler1 = () => {};
                const hook1 = {
                    event: 'preSomeEvent',
                    handler: handler1
                };

                cache.addHook(hook1);

                const expectedHooks1 = {
                    preSomeEvent: [ handler1 ]
                };

                expect(cache.getHooks()).to.deep.equal(expectedHooks1);

                const handler2 = () => {};
                const hook2 = {
                    event: 'preSomeEvent',
                    handler: handler2
                };

                cache.addHook(hook2);

                const expectedHooks2 = {
                    preSomeEvent: [ handler1, handler2 ]
                };

                expect(cache.getHooks()).to.deep.equal(expectedHooks2);
            });
        });
    });

    describe('addHooks method', () => {
        it('should add multiple hooks', () => {
            const preHandler = () => {};
            const postHandler = () => {};
            const hooks = [
                {
                    event: 'preSomething',
                    handler: preHandler
                },
                {
                    event: 'postSomething',
                    handler: postHandler
                }
            ];
            const expectedHooks = {
                preSomething: [
                    preHandler
                ],
                postSomething: [
                    postHandler
                ]
            };

            cache.addHooks(hooks);

            expect(cache.getHooks()).to.deep.eq(expectedHooks);
        });

        context('when hooks are not passed as an array', () => {
            it('should throw', () => {
                nonArrayValues.forEach((value) => {
                    expect(cache.addHooks.bind(null, value))
                        .to.throw('Hooks need to be passed as an array.');
                });
            });
        });
    });

    describe('setting multiple hooks for the same event', () => {
        it('should be possible', () => {
            const handler1 = () => {};
            const handler2 = () => {};
            const hooks = [
                {
                    event: 'preSomething',
                    handler: handler1
                },
                {
                    event: 'preSomething',
                    handler: handler2
                }
            ];
            const expectedHooks = {
                preSomething: [
                    handler1,
                    handler2
                ]
            };

            cache.addHooks(hooks);

            expect(cache.getHooks()).to.deep.eq(expectedHooks);
        });
    });
});
