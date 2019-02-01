import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter, FOO_KEY, NONEXISTENT_KEY } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('removeItem method', () => {
    const preRemoveItemStub = sinon.stub();
    const postRemoveStub = sinon.stub();
    const keyForExistingItem = FOO_KEY;
    const keyForNonExistentItem = NONEXISTENT_KEY;
    const resultReturnedByPostRemoveItemHandler = true;

    let cache;
    let cacheReturnedByPreRemoveItemHandler;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.removeItem.reset();
        dummyAdapter.removeItem.returns(true);
        dummyAdapter.removeItem.withArgs(keyForNonExistentItem).returns(false);

        cache = createCache(dummyAdapter);
        cacheReturnedByPreRemoveItemHandler = Object.assign({}, { some: 'apiExtension' }, cache);

        preRemoveItemStub.returns({
            cacheInstance: cacheReturnedByPreRemoveItemHandler,
            key: 'keyReturnedByPreHandler'
        });
        preRemoveItemStub.resetHistory();

        postRemoveStub.returns({
            cacheInstance: cache,
            key: 'keyReturnedByPostHandler',
            result: resultReturnedByPostRemoveItemHandler
        });
        postRemoveStub.resetHistory();
    });

    it(`should remove an item using adapter`, async () => {
        await cache.removeItem('key');

        expect(dummyAdapter.removeItem)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    context('when item was removed', () => {
        it('should return true', async () => {
            const result = await cache.removeItem(keyForExistingItem);

            expect(result).to.be.true;
        });
    });

    context('when item was not removed (could not / did not exist)', () => {
        it('should return false', async () => {
            const result = await cache.removeItem(keyForNonExistentItem);

            expect(result).to.be.false;
        });
    });

    context('when there is a hook for preRemoveItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'preRemoveItem',
                handler: preRemoveItemStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.removeItem('key');

            expect(preRemoveItemStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should remove an item using adapter and data returned by event's handler`, async () => {
            await cache.removeItem('key');

            expect(dummyAdapter.removeItem)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledOnce;
        });
    });

    context('when there is a hook for postRemoveItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postRemoveItem',
                handler: postRemoveStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.removeItem(keyForExistingItem);

            expect(postRemoveStub)
                .to.have.been.calledWith({
                    cacheInstance: cache,
                    key: keyForExistingItem,
                    result: true
                })
                .to.have.been.calledOnce;
        });

        it('should return result returned by postRemoveItem handler', async () => {
            const result = await cache.removeItem(keyForExistingItem);

            expect(result).to.equal(resultReturnedByPostRemoveItemHandler);
        });
    });

    context('when there are hooks for both preRemoveItem and postRemoveItem events', () => {
        beforeEach(() => {
            const hook1 = {
                event: 'preRemoveItem',
                handler: preRemoveItemStub
            };
            const hook2 = {
                event: 'postRemoveItem',
                handler: postRemoveStub
            };

            cache.addHooks([ hook1, hook2 ]);
        });

        it(`should call postRemoveItem's event handler with data returned by preRemoveItem`, async () => {
            await cache.removeItem(keyForExistingItem);

            expect(postRemoveStub)
                .to.have.been.calledWith({
                    cacheInstance: cacheReturnedByPreRemoveItemHandler,
                    key: 'keyReturnedByPreHandler',
                    result: true
                })
                .to.have.been.calledOnce;
        });
    });
});
