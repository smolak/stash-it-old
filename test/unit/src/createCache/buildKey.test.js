import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('buildKey method', () => {
    const preStub = sinon.stub().returnsArg(0);
    const postStub = sinon.stub().returnsArg(0);

    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        dummyAdapter.buildKey.withArgs('key').returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.resetHistory();

        cache = createCache(dummyAdapter);

        preStub.resetHistory();
        postStub.resetHistory();
    });

    it('should return a key', async () => {
        const key = await cache.buildKey('key');

        expect(key).to.be.a('string');
    });

    it(`should build key using adapter's buildKey method`, async () => {
        await cache.buildKey('key');

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith('key')
            .to.have.been.calledOnce;
    });

    context('when there is a hook for preBuildKey event', () => {
        it(`should pass data containing key through that event's handler`, async () => {
            const hook = {
                event: 'preBuildKey',
                handler: preStub
            };

            cache.addHook(hook);
            await cache.buildKey('key');

            expect(hook.handler)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should pass key, returned by that event's handler, to adapter's buildKey method`, async () => {
            const hook = {
                event: 'preBuildKey',
                handler: () => { return { cacheInstance: cache, key: 'keyReturnedByHandler' }; }
            };

            cache.addHook(hook);
            await cache.buildKey('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByHandler')
                .to.have.been.calledOnce;
        });
    });

    context('when there is a hook for postBuildKey event', () => {
        it(`should pass data containing key, built by adapter, through that event's handler`, async () => {
            const hook = {
                event: 'postBuildKey',
                handler: postStub
            };

            cache.addHook(hook);
            await cache.buildKey('key');

            expect(hook.handler)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'keyBuiltByAdapter' })
                .to.have.been.calledOnce;
        });

        it(`should return key, returned by that event's handler`, async () => {
            const hook = {
                event: 'postBuildKey',
                handler: () => { return { cacheInstance: cache, key: 'keyReturnedByHandler' }; }
            };

            cache.addHook(hook);

            const key = await cache.buildKey('key');

            expect(key).to.equal('keyReturnedByHandler');
        });
    });

    context('when there are no hooks for pre/post events', () => {
        it('should build key without passing data through pre/post event handlers', async () => {
            const adapterBuiltKey = await dummyAdapter.buildKey('key');
            const key = await cache.buildKey('key');

            expect(preStub).to.not.have.been.called;
            expect(postStub).to.not.have.been.called;

            expect(key).to.eq(adapterBuiltKey);
        });

        it(`should build key using adapter's buildKey method`, async () => {
            await cache.buildKey('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('key')
                .to.have.been.calledOnce;
        });
    });
});
