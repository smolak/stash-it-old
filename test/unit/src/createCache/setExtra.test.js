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

        dummyAdapter.buildKey.reset();
        dummyAdapter.buildKey.withArgs(keyForExistingItem).returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.withArgs('keyReturnedByPreHandler').returns('keyBuiltByAdapter');

        dummyAdapter.hasItem.reset();
        dummyAdapter.hasItem.withArgs('keyBuiltByAdapter').returns(true);
        dummyAdapter.hasItem.withArgs(keyForNonExistentItem).returns(false);

        dummyAdapter.setExtra.reset();
        dummyAdapter.setExtra.withArgs('keyBuiltByAdapter').returns({ extra: 'setByAdapter' });

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

    it('should check if item exists using key built by adapter', async () => {
        const adapterBuiltKey = await dummyAdapter.buildKey('key');

        await cache.setExtra('key', { some: 'extra' });

        expect(dummyAdapter.hasItem)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
    });

    context('when item exists', () => {
        it(`should build key using adapter's buildKey method`, async () => {
            await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith(keyForExistingItem)
                .to.have.been.calledTwice;
        });

        it('should add extra using adapter', async () => {
            await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(dummyAdapter.setExtra)
                .to.have.been.calledWith('keyBuiltByAdapter', { some: 'extra' })
                .to.have.been.calledOnce;
        });

        it('should return added extra', async () => {
            const setExtra = await cache.setExtra(keyForExistingItem, { some: 'extra' });

            expect(setExtra).to.deep.equal({ extra: 'setByAdapter' });
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

        it(`should throw, as extra's structure is constant for all adapters`, async () => {
            try {
                await cache.setExtra('key', invalidExtra);

                expect('this assertion should not happen as catch should be triggered').to.be.true;
            } catch (e) {
                expect(e.message).to.equal(`'extra' must be an object.`);
            }
        });

        it('should throw before adding an extra by adapter', async () => {
            try {
                await cache.setExtra(keyForExistingItem, invalidExtra);

                expect('this assertion should not happen as catch should be triggered').to.be.true;
            }
            catch (e) {
                expect(dummyAdapter.setExtra).to.not.have.been.called;
            }
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

        it(`should build a key using adapter and key returned by event's handler`, async () => {
            await cache.setExtra('key', { some: 'extra' });

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledTwice;
        });

        context('when a hook returns an extra that is invalid', () => {
            it(`should throw`, async () => {
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

                try {
                    await cache.setExtra('key', { some: 'extra' });

                    expect('this assertion should not happen as catch should be triggered').to.be.true;
                }
                catch (e) {
                    expect(e.message).to.equal(`'extra' must be an object.`);
                }
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
                .to.have.been.calledWith({ cacheInstance: cache, key: 'keyBuiltByAdapter', extra: { extra: 'setByAdapter' } })
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
                key: 'keyBuiltByAdapter',
                extra: { extra: 'setByAdapter' }
            })
                .to.have.been.calledOnce;
        });
    });
});
