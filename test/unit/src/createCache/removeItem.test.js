import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter, FOO_KEY } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('removeItem method', () => {
    const preRemoveItemStub = sinon.stub();
    const postRemoveStub = sinon.stub();
    const anyBooleanValue = true;
    const resultReturnedByAdaptersRemoveItem = anyBooleanValue;
    const resultReturnedByPostHandler = anyBooleanValue;

    let cache;
    let cacheReturnedByPreRemoveItemHandler;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.buildKey.reset();
        dummyAdapter.buildKey.withArgs('key').returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.withArgs('keyReturnedByPreHandler').returns('keyBuiltByAdapter');

        dummyAdapter.removeItem.reset();
        dummyAdapter.removeItem.returns(resultReturnedByAdaptersRemoveItem);

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
            result: resultReturnedByPostHandler
        });
        postRemoveStub.resetHistory();
    });

    it(`should build key using adapter`, async () => {
        await cache.removeItem('key');

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    it(`should remove item using adapter`, async () => {
        const adapterBuiltKey = await dummyAdapter.buildKey('key');
        const result = await cache.removeItem('key');

        expect(result).to.be.true;
        expect(dummyAdapter.removeItem)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
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

        it(`should build a key using adapter and key returned by event's handler`, async () => {
            await cache.removeItem('key');

            expect(dummyAdapter.buildKey)
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
            await cache.removeItem('key');

            expect(postRemoveStub)
                .to.have.been.calledWith({
                    cacheInstance: cache,
                    key: 'keyBuiltByAdapter',
                    result: resultReturnedByAdaptersRemoveItem
                })
                .to.have.been.calledOnce;
        });

        it('should return result returned by postRemoveItem handler', async () => {
            const result = await cache.removeItem('key');

            expect(result).to.deep.equal(resultReturnedByPostHandler);
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
            await cache.removeItem('key');

            expect(postRemoveStub)
                .to.have.been.calledWith({
                    cacheInstance: cacheReturnedByPreRemoveItemHandler,
                    key: 'keyBuiltByAdapter',
                    result: resultReturnedByPostHandler
                })
                .to.have.been.calledOnce;
        });
    });
});
