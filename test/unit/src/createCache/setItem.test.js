import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('setItem method', () => {
    const defaultExtra = {};
    const extra = { some: 'extraData' };
    const preSetItemHandlerStub = sinon.stub();
    const postSetItemHandlerStub = sinon.stub();
    const itemReturnedByAdapter = createItem('anyKey', 'anyValue');
    const itemReturnedByPostSetItem = createItem('anyKey', 'anyValue');

    let cache;
    let cacheReturnedByPreSetItemHandler;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);

        dummyAdapter.setItem.returns(itemReturnedByAdapter);
        dummyAdapter.setItem.resetHistory();

        cache = createCache(dummyAdapter);
        cacheReturnedByPreSetItemHandler = Object.assign({}, { some: 'apiExtension' }, cache);

        preSetItemHandlerStub.returns({
            cacheInstance: cacheReturnedByPreSetItemHandler,
            key: 'keyReturnedByPreHandler',
            value: 'valueReturnedByPreHandler',
            extra: { extraReturnedBy: 'preHandler'}
        });
        preSetItemHandlerStub.resetHistory();

        postSetItemHandlerStub.returns({
            cacheInstance: cache,
            key: 'keyReturnedByPostHandler',
            value: 'valueReturnedByPostHandler',
            extra: { extraReturnedBy: 'postHandler'},
            item: itemReturnedByPostSetItem
        });
        postSetItemHandlerStub.resetHistory();
    });

    it(`should set an item using adapter`, async () => {
        await cache.setItem('key', 'value');

        expect(dummyAdapter.setItem)
            .to.have.been.calledWith('key', 'value', defaultExtra)
            .to.have.been.calledOnce;
    });

    it('should return an item set by adapter', async () => {
        const item = await cache.setItem('key', 'value');

        expect(item).to.equal(itemReturnedByAdapter);
    });

    context('when extra is passed', () => {
        it(`should use that extra to set an item`, async () => {
            await cache.setItem('key', 'value', extra);

            expect(dummyAdapter.setItem)
                .to.have.been.calledWith('key', 'value', extra)
                .to.have.been.calledOnce;
        });
    });

    context('when there is a hook for preSetItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'preSetItem',
                handler: preSetItemHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.setItem('key', 'value');

            expect(preSetItemHandlerStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key', value: 'value', extra: {} })
                .to.have.been.calledOnce;
        });

        context('when extra is passed', () => {
            it(`should call that event's handler with data containing passed extra`, async () => {
                await cache.setItem('key', 'value', extra);

                expect(preSetItemHandlerStub)
                    .to.have.been.calledWith({ cacheInstance: cache, key: 'key', value: 'value', extra })
                    .to.have.been.calledOnce;
            });
        });

        it(`should set an item with data returned by preSetItem event's handler`, async () => {
            await cache.setItem('key', 'value');

            expect(dummyAdapter.setItem)
                .to.have.been.calledWithExactly('keyReturnedByPreHandler', 'valueReturnedByPreHandler', { extraReturnedBy: 'preHandler' })
                .to.have.been.calledOnce;
        });
    });

    context('when there is a hook for postSetItem event', () => {
        beforeEach(() => {
            const hook = {
                event: 'postSetItem',
                handler: postSetItemHandlerStub
            };

            cache.addHook(hook);
        });

        it(`should call that event's handler with data required for that event`, async () => {
            await cache.setItem('key', 'value');

            expect(postSetItemHandlerStub)
                .to.have.been.calledWith({
                    cacheInstance: cache,
                    key: 'key',
                    value: 'value',
                    item: itemReturnedByAdapter,
                    extra: {}
                })
                .to.have.been.calledOnce;
        });

        it('should return an item returned by postSetItem handler', async () => {
            const extra = await cache.setItem('key', 'value');

            expect(extra).to.equal(itemReturnedByPostSetItem);
        });

        context('when extra is passed', () => {
            it(`should call that event's handler with data containing passed extra`, async () => {
                await cache.setItem('key', 'value', extra);

                expect(postSetItemHandlerStub)
                    .to.have.been.calledWith({
                        cacheInstance: cache,
                        key: 'key',
                        value: 'value',
                        item: itemReturnedByAdapter,
                        extra
                    })
                    .to.have.been.calledOnce;
            });
        });
    });

    context('when there are hooks for both preSetItem and postSetItem', () => {
        beforeEach(() => {
            const hooks = [
                {
                    event: 'preSetItem',
                    handler: preSetItemHandlerStub
                },
                {
                    event: 'postSetItem',
                    handler: postSetItemHandlerStub
                }
            ];

            cache.addHooks(hooks);
        });

        it(`should call postSetItem's event handler with data returned by preSetItem`, async () => {
            await cache.setItem('key', 'value', extra);

            expect(postSetItemHandlerStub)
                .to.have.been.calledWith({
                    cacheInstance: cacheReturnedByPreSetItemHandler,
                    key: 'keyReturnedByPreHandler',
                    value: 'valueReturnedByPreHandler',
                    item: itemReturnedByAdapter,
                    extra: { extraReturnedBy: 'preHandler'}
                })
                .to.have.been.calledOnce;
        });
    });
});
