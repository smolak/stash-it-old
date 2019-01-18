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
    let cacheReturnedByPreGetExtraHandler;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.buildKey.returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.resetHistory();

        dummyAdapter.getExtra.returns(extraReturnedByAdapter);
        dummyAdapter.getExtra.resetHistory();

        cache = createCache(dummyAdapter);
        cacheReturnedByPreGetExtraHandler = Object.assign({}, { some: 'apiExtension' }, cache);

        preGetExtraHandlerStub.returns({ cacheInstance: cacheReturnedByPreGetExtraHandler, key: 'keyReturnedByPreHandler' });
        preGetExtraHandlerStub.resetHistory();

        postGetExtraHandlerStub
            .returns({ cacheInstance: cache, key: 'keyReturnedByPostHandler', extra: extraReturnedByPostGetExtra });
        postGetExtraHandlerStub.resetHistory();
    });

    it(`should build a key using an adapter`, async () => {
        await cache.getExtra('key');

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    it(`should return an extra using adapter`, async () => {
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

        it(`should call that event's handler with data required for that event`, async () => {
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
    });

    context('when there is a hook for postGetExtra event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postGetExtra',
                handler: postGetExtraHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.getExtra('key');

            expect(postGetExtraHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'keyBuiltByAdapter', extra: extraReturnedByAdapter })
                .to.have.been.calledOnce;
        });

        it(`should return the extra returned by postGetExtra event's handler`, async () => {
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

        it(`should call postGetExtra's event handler with data returned by preGetExtra`, async () => {
            await cache.getExtra('key');

            expect(postGetExtraHandlerStub)
                .to.have.been.calledWith({
                    cacheInstance: cacheReturnedByPreGetExtraHandler,
                    key: 'keyBuiltByAdapter',
                    extra: { some: 'extraData' }
                })
                .to.have.been.calledOnce;
        });
    });
});
