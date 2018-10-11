import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('getItem method', () => {
    const preGetItemHandlerStub = sinon.stub();
    const postGetItemHandlerStub = sinon.stub();
    const itemReturnedByAdapter = createItem('anyKey', 'anyValue');
    const itemReturnedByPostGetItem = createItem('anyKey', 'anyValue');

    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.buildKey.returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.resetHistory();

        dummyAdapter.getItem.returns(itemReturnedByAdapter);
        dummyAdapter.getItem.resetHistory();

        cache = createCache(dummyAdapter);

        preGetItemHandlerStub.returns({ cacheInstance: cache, key: 'keyReturnedByPreHandler' });
        preGetItemHandlerStub.resetHistory();

        postGetItemHandlerStub
            .returns({ cacheInstance: cache, key: 'keyReturnedByPostHandler', item: itemReturnedByPostGetItem });
        postGetItemHandlerStub.resetHistory();
    });

    it(`should build a key using adapter`, async () => {
        await cache.getItem('key');

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    it(`should get an item using adapter and key built by adapter`, async () => {
        await cache.getItem('key');

        expect(dummyAdapter.getItem)
            .to.have.been.calledWith('keyBuiltByAdapter')
            .to.have.been.calledOnce;
    });

    it('should return an item got by adapter', async () => {
        const item = await cache.getItem('key');

        expect(item).to.equal(itemReturnedByAdapter);
    });

    context('when there is a hook for preGetItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'preGetItem',
                handler: preGetItemHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data containing the key`, async () => {
            await cache.getItem('key');

            expect(preGetItemHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should build a key using adapter and key returned by event's handler`, async () => {
            await cache.getItem('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledOnce;
        });

        it(`should get an item using adapter and key built by adapter`, async () => {
            await cache.getItem('key');

            expect(dummyAdapter.getItem)
                .to.have.been.calledWith('keyBuiltByAdapter')
                .to.have.been.calledOnce;
        });

        it('should return an item got by adapter', async () => {
            const item = await cache.getItem('key');

            expect(item).to.equal(itemReturnedByAdapter);
        });
    });

    context('when there is a hook for postGetItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postGetItem',
                handler: postGetItemHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should build a key using adapter`, async () => {
            await cache.getItem('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('key')
                .to.have.been.calledOnce;
        });

        it(`should get an item using adapter and key built by adapter`, async () => {
            await cache.getItem('key');

            expect(dummyAdapter.getItem)
                .to.have.been.calledWith('keyBuiltByAdapter')
                .to.have.been.calledOnce;
        });

        it(`should call that event's handler with data containing adapter-built key and got item`, async () => {
            await cache.getItem('key');

            expect(postGetItemHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'keyBuiltByAdapter', item: itemReturnedByAdapter })
                .to.have.been.calledOnce;
        });

        it('should return the item returned by postGetItem handler', async () => {
            const item = await cache.getItem('key');

            expect(item).to.equal(itemReturnedByPostGetItem);
        });
    });

    context('when there are hooks for both preGetItem and postGetItem events', () => {
        beforeEach(() => {
            const hook1 = {
                event: 'preGetItem',
                handler: preGetItemHandlerStub
            };
            const hook2 = {
                event: 'postGetItem',
                handler: postGetItemHandlerStub
            };

            cache.addHooks([ hook1, hook2 ]);
        });

        it(`should pass data containing key through preGetItem handler`, async () => {
            await cache.getItem('key');

            expect(preGetItemHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should pass key, returned by preGetItem handler, to adapter's buildKey method`, async () => {
            await cache.getItem('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledOnce;
        });

        it(`should pass key, returned by adapter's buildKey, to adapter's getItem method`, async () => {
            await cache.getItem('key');

            expect(dummyAdapter.getItem)
                .to.have.been.calledWith('keyBuiltByAdapter')
                .to.have.been.calledOnce;
        });

        it(`should pass data containing key and item from adapter, through postGetItem handler`, async () => {
            await cache.getItem('key');

            expect(postGetItemHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, item: itemReturnedByAdapter, key: 'keyBuiltByAdapter' })
                .to.have.been.calledOnce;
        });

        it('should return item, returned by postGetItem handler', async () => {
            const item = await cache.getItem('key');

            expect(item).to.equal(itemReturnedByPostGetItem);
        });
    });
});
