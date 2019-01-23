import sinon from 'sinon';
import { expect } from 'chai';
import { FOO_KEY, NONEXISTENT_KEY, createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('hasItem method', () => {
    const preHasItemHandlerStub = sinon.stub();
    const postHasItemHandlerStub = sinon.stub();
    const anyBooleanValue = true;
    const resultReturnedByPostHandler = anyBooleanValue;

    let cache;
    let cacheReturnedByPreHasItemHandler;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.buildKey.returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.resetHistory();

        dummyAdapter.hasItem.returns(anyBooleanValue);
        dummyAdapter.hasItem.resetHistory();

        cache = createCache(dummyAdapter);
        cacheReturnedByPreHasItemHandler = Object.assign({}, { some: 'apiExtension' }, cache);

        preHasItemHandlerStub.returns({
            cacheInstance: cacheReturnedByPreHasItemHandler,
            key: 'keyReturnedByPreHandler'
        });
        preHasItemHandlerStub.resetHistory();

        postHasItemHandlerStub.returns({
            cacheInstance: cache,
            key: 'keyReturnedByPostHandler',
            result: resultReturnedByPostHandler
        });
        postHasItemHandlerStub.resetHistory();
    });

    it('should build key using adapter', async () => {
        await cache.hasItem('key');

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    it(`should check item's existence using adapter`, async () => {
        const adapterBuiltKey = await dummyAdapter.buildKey(FOO_KEY);
        await cache.hasItem(FOO_KEY);

        expect(dummyAdapter.hasItem)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
    });

    context('when item exists', () => {
        it('should return true', async () => {
            const keyForExistingItem = FOO_KEY;
            const result = await cache.hasItem(keyForExistingItem);

            expect(result).to.be.true;
        });
    });

    context(`when item doesn't exist`, () => {
        it('should return false', async () => {
            const result = await cache.hasItem(NONEXISTENT_KEY);

            expect(result).to.be.false;
        });
    });

    context('when there is a hook for preHasItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'preHasItem',
                handler: preHasItemHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.hasItem('key');

            expect(preHasItemHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should build a key using adapter and key returned by event's handler`, async () => {
            await cache.hasItem('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledOnce;
        });
    });

    context('when there is a hook for postHasItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postHasItem',
                handler: postHasItemHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.hasItem('key');

            expect(postHasItemHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'keyBuiltByAdapter', result: anyBooleanValue })
                .to.have.been.calledOnce;
        });

        it('should return the result returned by postHasItem handler', async () => {
            const result = await cache.hasItem('key');

            expect(result).to.equal(resultReturnedByPostHandler);
        });
    });

    context('when there are hooks for both preHasItem and postHasItem events', () => {
        beforeEach(() => {
            const hook1 = {
                event: 'preHasItem',
                handler: preHasItemHandlerStub
            };
            const hook2 = {
                event: 'postHasItem',
                handler: postHasItemHandlerStub
            };

            cache.addHooks([ hook1, hook2 ]);
        });

        it(`should call postHasItem's event handler with data returned by preHasItem`, async () => {
            await cache.hasItem('key');

            expect(postHasItemHandlerStub)
                .to.have.been.calledWith({
                cacheInstance: cacheReturnedByPreHasItemHandler,
                key: 'keyBuiltByAdapter',
                result: resultReturnedByPostHandler
            })
                .to.have.been.calledOnce;
        });
    });
});
