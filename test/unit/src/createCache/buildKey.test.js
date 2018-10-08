import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('buildKey method', () => {
    const preStub = sinon.stub();
    const postStub = sinon.stub();

    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        dummyAdapter.buildKey.returns('keyBuiltByAdapter');
        dummyAdapter.buildKey.resetHistory();

        cache = createCache(dummyAdapter);

        preStub.returnsArg(0);
        preStub.resetHistory();

        postStub.returnsArg(0);
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

    context('when there are hooks for both preBuildKey and postBuildKey events', () => {
        beforeEach(() => {
            preStub.reset();
            preStub.returns({ cacheInstance: cache, key: 'keyReturnedByPreHandler' });

            postStub.reset();
            postStub.returns({ cacheInstance: cache, key: 'keyReturnedByPostHandler' });

            const hook1 = {
                event: 'preBuildKey',
                handler: preStub
            };
            const hook2 = {
                event: 'postBuildKey',
                handler: postStub
            };

            cache.addHooks([ hook1, hook2 ]);
        });

        it(`should pass data containing key through preBuildKey handler`, async () => {
            await cache.buildKey('key');

            expect(preStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'key' })
                .to.have.been.calledOnce;
        });

        it(`should pass key, returned by that event's handler, to adapter's buildKey method`, async () => {
            await cache.buildKey('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('keyReturnedByPreHandler')
                .to.have.been.calledOnce;
        });

        it(`should pass data containing key, built by adapters method, through postBuildKey handler`, async () => {
            await cache.buildKey('key');

            expect(postStub)
                .to.have.been.calledWith({ cacheInstance: cache, key: 'keyBuiltByAdapter' })
                .to.have.been.calledOnce;
        });

        it('should return key, returned by postBuildKey handler', async () => {
            const key = await cache.buildKey('key');

            expect(key).to.equal('keyReturnedByPostHandler');
        });
    });

    context('when there is no hook for preBuildKey and postBuildKey event', () => {
        it(`should build key using adapter`, async () => {
            await cache.buildKey('key');

            expect(dummyAdapter.buildKey)
                .to.have.been.calledWith('key')
                .to.have.been.calledOnce;
        });

        it('should return key built by adapter', async () => {
            const key = await cache.buildKey('key');

            expect(key).to.equal('keyBuiltByAdapter');
        });
    });
});
