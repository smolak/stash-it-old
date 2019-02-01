import sinon from 'sinon';
import { expect } from 'chai';
import {
    createDummyAdapter,
    FOO_KEY,
    NONEXISTENT_KEY
} from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('setExtra method', () => {
    const preSetExtraStub = sinon.stub();
    const postSetExtraStub = sinon.stub();
    const keyForExistingItem = FOO_KEY;
    const keyForNonExistentItem = NONEXISTENT_KEY;

    let cache;
    let cacheReturnedByPreSetExtraHandler;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.hasItem.reset();
        dummyAdapter.hasItem.returns(true);
        dummyAdapter.hasItem.withArgs(keyForNonExistentItem).returns(false);

        dummyAdapter.setExtra.reset();
        dummyAdapter.setExtra.returns({ extra: 'setByAdapter', theSame: 'asTheOneSet' });

        cache = createCache(dummyAdapter);
        cacheReturnedByPreSetExtraHandler = Object.assign({}, { some: 'apiExtension' }, cache);

        preSetExtraStub.returns({
            cacheInstance: cacheReturnedByPreSetExtraHandler,
            key: 'keyReturnedByPreHandler',
            extra: { extraReturnedBy: 'preHandler' }
        });
        preSetExtraStub.resetHistory();

        postSetExtraStub.returns({
            cacheInstance: cache,
            key: 'keyReturnedByPostHandler',
            extra: { extraReturnedBy: 'postHandler' }
        });
        postSetExtraStub.resetHistory();
    });

    it('should check if item exists using adapter', async () => {
        await cache.setExtra('key', { some: 'extra' });

        expect(dummyAdapter.hasItem)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    context('when item exists', () => {
        it('should add extra using adapter', async () => {
            await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(dummyAdapter.setExtra)
                .to.have.been.calledWith(keyForExistingItem, { some: 'extra' })
                .to.have.been.calledOnce;
        });

        it('should return added extra', async () => {
            const setExtra = await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(setExtra).to.deep.equal({ extra: 'setByAdapter', theSame: 'asTheOneSet' });
        });
    });

    context(`when item doesn't exist`, () => {
        it('should return undefined', async () => {
            const setExtra = await cache.setExtra(keyForNonExistentItem, { some: 'extra' });

            expect(setExtra).to.be.undefined;
        });
    });

    context('when extra is not valid', () => {
        const invalidExtra = 'non object value';

        it(`should throw, as extra's structure is constant for all adapters`, () => {
            return cache.setExtra('key', invalidExtra).catch((error) => {
                expect(error.message).to.equal(`'extra' must be an object.`);
            });
        });

        it('should throw before adding an extra by adapter', () => {
            return cache.setExtra('key', invalidExtra).catch(() => {
                expect(dummyAdapter.setExtra).to.not.have.been.called;
            });
        });
    });

    context('when there is a hook for preSetExtra event', () => {
        beforeEach(() => {
            const hook = {
                event: 'preSetExtra',
                handler: preSetExtraStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.setExtra('key', { some: 'extra' });

            expect(preSetExtraStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key', extra: { some: 'extra'} })
                .to.have.been.calledOnce;
        });

        it(`should set extra using adapter with data returned by event's handler`, async () => {
            await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(dummyAdapter.setExtra)
                .to.have.been.calledWith('keyReturnedByPreHandler', { extraReturnedBy: "preHandler" })
                .to.have.been.calledOnce;
        });

        context('when a hook returns an extra that is invalid', () => {
            it(`should throw`, () => {
                const invalidExtra = 'non object value';

                preSetExtraStub.returns({
                    cacheInstance: cacheReturnedByPreSetExtraHandler,
                    key: 'keyReturnedByPreHandler',
                    extra: invalidExtra
                });

                cache.addHook({
                    event: 'preSetExtra',
                    handler: preSetExtraStub
                });

                return cache.setExtra('key', { some: 'extra' }).catch((error) => {
                    expect(error.message).to.equal(`'extra' must be an object.`);
                });
            });
        });
    });

    context('when there is a hook for postSetExtra event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postSetExtra',
                handler: postSetExtraStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(postSetExtraStub)
                .to.have.been.calledWith({
                    cacheInstance: cache,
                    key: keyForExistingItem,
                    extra: { extra: 'setByAdapter', theSame: 'asTheOneSet' }
                })
                .to.have.been.calledOnce;
        });

        it('should return extra returned by postSetExtra handler', async () => {
            const setExtra = await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(setExtra).to.deep.equal({ extraReturnedBy: 'postHandler' });
        });
    });

    context('when there are hooks for both preSetExtra and postSetExtra events', () => {
        beforeEach(() => {
            const hook1 = {
                event: 'preSetExtra',
                handler: preSetExtraStub
            };
            const hook2 = {
                event: 'postSetExtra',
                handler: postSetExtraStub
            };

            cache.addHooks([ hook1, hook2 ]);
        });

        it(`should call postSetExtra's event handler with data returned by preSetExtra`, async () => {
            await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(postSetExtraStub)
                .to.have.been.calledWith({
                    cacheInstance: cacheReturnedByPreSetExtraHandler,
                    key: 'keyReturnedByPreHandler',
                    extra: { extra: 'setByAdapter', theSame: 'asTheOneSet' }
                })
                .to.have.been.calledOnce;
        });
    });
});
