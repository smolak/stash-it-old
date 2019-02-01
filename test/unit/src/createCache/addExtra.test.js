import sinon from 'sinon';
import { expect } from 'chai';
import {
    createDummyAdapter,
    FOO_KEY,
    NONEXISTENT_KEY
} from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('addExtra method', () => {
    const preAddExtraStub = sinon.stub();
    const postAddExtraStub = sinon.stub();
    const keyForExistingItem = FOO_KEY;
    const keyForNonExistentItem = NONEXISTENT_KEY;

    let cache;
    let cacheReturnedByPreAddExtraHandler;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.hasItem.reset();
        dummyAdapter.hasItem.returns(true);
        dummyAdapter.hasItem.withArgs(keyForNonExistentItem).returns(false);

        dummyAdapter.addExtra.reset();
        dummyAdapter.addExtra.returns({ extra: 'addedByAdapter', theSame: 'asTheOneAdded' });

        cache = createCache(dummyAdapter);
        cacheReturnedByPreAddExtraHandler = Object.assign({}, { some: 'apiExtension' }, cache);

        preAddExtraStub.returns({
            cacheInstance: cacheReturnedByPreAddExtraHandler,
            key: 'keyReturnedByPreHandler',
            extra: { extraReturnedBy: 'preHandler' }
        });
        preAddExtraStub.resetHistory();

        postAddExtraStub.returns({
            cacheInstance: cache,
            key: 'keyReturnedByPostHandler',
            extra: { extraReturnedBy: 'postHandler' }
        });
        postAddExtraStub.resetHistory();
    });

    it('should check if item exists using adapter', async () => {
        await cache.addExtra('key', { some: 'extra' });

        expect(dummyAdapter.hasItem)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    context('when item exists', () => {
        it('should add extra using adapter', async () => {
            await cache.addExtra(keyForExistingItem, { some: 'extra' });

            expect(dummyAdapter.addExtra)
                .to.have.been.calledWith(keyForExistingItem, { some: 'extra' })
                .to.have.been.calledOnce;
        });

        it('should return added extra', async () => {
            const addedExtra = await cache.addExtra(keyForExistingItem, { some: 'extra' });

            expect(addedExtra).to.deep.equal({ extra: 'addedByAdapter', theSame: 'asTheOneAdded' });
        });
    });

    context(`when item doesn't exist`, () => {
        it('should return undefined', async () => {
            const addedExtra = await cache.addExtra(keyForNonExistentItem, { some: 'extra' });

            expect(addedExtra).to.be.undefined;
        });
    });

    context('when extra is not valid', () => {
        const invalidExtra = 'non object value';

        it(`should throw, as extra's structure is constant for all adapters`, () => {
            return cache.addExtra('key', invalidExtra).catch((error) => {
                expect(error.message).to.equal(`'extra' must be an object.`);
            });
        });

        it('should throw before adding an extra by adapter', () => {
            return cache.addExtra(keyForExistingItem, invalidExtra).catch(() => {
                expect(dummyAdapter.addExtra).to.not.have.been.called;
            });
        });
    });

    context('when there is a hook for preAddExtra event', () => {
        beforeEach(() => {
            const hook = {
                event: 'preAddExtra',
                handler: preAddExtraStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.addExtra('key', { some: 'extra' });

            expect(preAddExtraStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key', extra: { some: 'extra'} })
                .to.have.been.calledOnce;
        });

        it(`should add extra by adapter using data returned by event's handler`, async () => {
            await cache.addExtra(keyForExistingItem, { some: 'extra' });

            expect(dummyAdapter.addExtra)
                .to.have.been.calledWith('keyReturnedByPreHandler', { extraReturnedBy: 'preHandler' })
                .to.have.been.calledOnce;
        });

        context('when a hook returns an extra that is invalid', () => {
            it(`should throw`, () => {
                const invalidExtra = 'non object value';

                preAddExtraStub.returns({
                    cacheInstance: cacheReturnedByPreAddExtraHandler,
                    key: 'keyReturnedByPreHandler',
                    extra: invalidExtra
                });

                cache.addHook({
                    event: 'preAddExtra',
                    handler: preAddExtraStub
                });

                return cache.addExtra('key', { some: 'extra' }).catch((error) => {
                    expect(error.message).to.equal(`'extra' must be an object.`);
                });
            });
        });
    });

    context('when there is a hook for postAddExtra event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postAddExtra',
                handler: postAddExtraStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.addExtra(keyForExistingItem, { some: 'extra' });

            expect(postAddExtraStub)
                .to.have.been.calledWith({
                    cacheInstance: cache,
                    key: keyForExistingItem,
                    extra: { extra: 'addedByAdapter', theSame: 'asTheOneAdded' }
                })
                .to.have.been.calledOnce;
        });

        it('should return extra returned by postAddExtra handler', async () => {
            const addedExtra = await cache.addExtra(keyForExistingItem, { some: 'extra' });

            expect(addedExtra).to.deep.equal({ extraReturnedBy: 'postHandler' });
        });
    });

    context('when there are hooks for both preAddExtra and postAddExtra events', () => {
        beforeEach(() => {
            const hook1 = {
                event: 'preAddExtra',
                handler: preAddExtraStub
            };
            const hook2 = {
                event: 'postAddExtra',
                handler: postAddExtraStub
            };

            cache.addHooks([ hook1, hook2 ]);
        });

        it(`should call postAddExtra's event handler with data returned by preAddExtra`, async () => {
            await cache.addExtra(keyForExistingItem, { some: 'extra' });

            expect(postAddExtraStub)
                .to.have.been.calledWith({
                    cacheInstance: cacheReturnedByPreAddExtraHandler,
                    key: 'keyReturnedByPreHandler',
                    extra: { extra: 'addedByAdapter', theSame: 'asTheOneAdded' }
                })
                .to.have.been.calledOnce;
        });
    });
});
