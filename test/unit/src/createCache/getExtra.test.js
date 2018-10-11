import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('getExtra method', () => {
    const preGetExtraHandlerStub = sinon.stub();
    const postGetExtraHandlerStub = sinon.stub();
    const extraReturnedByAdapter = { some: 'extraData' };
    const extraReturnedByPostGetExtra = { some: 'extraData' };

    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.buildKey.returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.resetHistory();

        dummyAdapter.getExtra.returns(extraReturnedByAdapter);
        dummyAdapter.getExtra.resetHistory();

        cache = createCache(dummyAdapter);

        preGetExtraHandlerStub.returns({ cacheInstance: cache, key: 'keyReturnedByPreHandler' });
        preGetExtraHandlerStub.resetHistory();

        postGetExtraHandlerStub
            .returns({ cacheInstance: cache, key: 'keyReturnedByPostHandler', extra: extraReturnedByPostGetExtra });
        postGetExtraHandlerStub.resetHistory();
    });

    it(`should build a key using adapter`, async () => {
        await cache.getExtra('key');

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    it(`should get an extra using adapter and key built by adapter`, async () => {
        await cache.getExtra('key');

        expect(dummyAdapter.getExtra)
            .to.have.been.calledWith('keyBuiltByAdapter')
            .to.have.been.calledOnce;
    });

    it('should return an extra got by adapter', async () => {
        const extra = await cache.getExtra('key');

        expect(extra).to.equal(extraReturnedByAdapter);
    });

    context('when there is a hook for preGetExtra event', () => {
        beforeEach(() => {
            const hook = {
                event: 'preGetExtra',
                handler: preGetExtraHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data containing the key`, async () => {
            await cache.getExtra('key');

            expect(preGetExtraHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should build a key using adapter and key returned by event's handler`, async () => {
            await cache.getExtra('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledOnce;
        });

        it(`should get an item using adapter and key built by adapter`, async () => {
            await cache.getExtra('key');

            expect(dummyAdapter.getExtra)
                .to.have.been.calledWith('keyBuiltByAdapter')
                .to.have.been.calledOnce;
        });

        it('should return an item got by adapter', async () => {
            const item = await cache.getExtra('key');

            expect(item).to.equal(extraReturnedByAdapter);
        });
    });

    context('when there is a hook for postGetExtra event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postGetExtra',
                handler: postGetExtraHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should build a key using adapter`, async () => {
            await cache.getExtra('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('key')
                .to.have.been.calledOnce;
        });

        it(`should get an extra using adapter and key built by adapter`, async () => {
            await cache.getExtra('key');

            expect(dummyAdapter.getExtra)
                .to.have.been.calledWith('keyBuiltByAdapter')
                .to.have.been.calledOnce;
        });

        it(`should call that event's handler with data containing adapter-built key and got extra`, async () => {
            await cache.getExtra('key');

            expect(postGetExtraHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'keyBuiltByAdapter', extra: extraReturnedByAdapter })
                .to.have.been.calledOnce;
        });

        it('should return the extra returned by postGetExtra handler', async () => {
            const extra = await cache.getExtra('key');

            expect(extra).to.equal(extraReturnedByPostGetExtra);
        });
    });

    context('when there are hooks for both preGetExtra and postGetExtra events', () => {
        beforeEach(() => {
            const hook1 = {
                event: 'preGetExtra',
                handler: preGetExtraHandlerStub
            };
            const hook2 = {
                event: 'postGetExtra',
                handler: postGetExtraHandlerStub
            };

            cache.addHooks([ hook1, hook2 ]);
        });

        it(`should pass data containing key through preGetExtra handler`, async () => {
            await cache.getExtra('key');

            expect(preGetExtraHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should pass key, returned by preGetExtra handler, to adapter's buildKey method`, async () => {
            await cache.getExtra('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledOnce;
        });

        it(`should pass key, returned by adapter's buildKey, to adapter's getExtra method`, async () => {
            await cache.getExtra('key');

            expect(dummyAdapter.getExtra)
                .to.have.been.calledWith('keyBuiltByAdapter')
                .to.have.been.calledOnce;
        });

        it(`should pass data containing key and extra from adapter, through postGetExtra handler`, async () => {
            await cache.getExtra('key');

            expect(postGetExtraHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, extra: extraReturnedByAdapter, key: 'keyBuiltByAdapter' })
                .to.have.been.calledOnce;
        });

        it('should return extra, returned by postGetExtra handler', async () => {
            const extra = await cache.getExtra('key');

            expect(extra).to.equal(extraReturnedByPostGetExtra);
        });
    });
});
