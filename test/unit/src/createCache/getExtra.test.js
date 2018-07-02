import { expect } from 'chai';
import sinon from 'sinon';
import { createDummyAdapter, FOO_KEY, FOO_VALUE } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('getExtra method', () => {
    const preStub = sinon.stub().returnsArg(0);
    const postStub = sinon.stub().returnsArg(0);

    let cache;
    let dummyAdapter;

    beforeEach(() => {
        dummyAdapter = createDummyAdapter(createItem);
        cache = createCache(dummyAdapter);

        preStub.resetHistory();
        postStub.resetHistory();
    });

    it(`should build key using adapter's buildKey method`, () => {
        cache.getExtra(FOO_KEY);

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith(FOO_KEY)
            .to.have.been.calledOnce;
    });

    it(`should get extra using adapter's getExtra method`, () => {
        const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);
        const item = createItem(adapterBuiltKey, FOO_VALUE);
        const extra = cache.getExtra(FOO_KEY);

        expect(extra).to.deep.eq(item.extra);
        expect(dummyAdapter.getExtra)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
    });

    context('when there are hooks for pre/post events', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preGetExtra',
                    handler: preStub
                },
                {
                    event: 'postGetExtra',
                    handler: postStub
                }
            ]);
        });

        it(`should pass data through that hook's handlers`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);
            const item = createItem(adapterBuiltKey, FOO_VALUE);
            const extra = item.extra;
            const expectedPreArgs = {
                cacheInstance: cache,
                key: FOO_KEY
            };
            const expectedPostArgs = {
                cacheInstance: cache,
                extra,
                key: FOO_KEY
            };

            cache.getExtra(FOO_KEY);

            expect(preStub)
                .to.have.been.calledWith(expectedPreArgs)
                .to.have.been.calledOnce;

            expect(postStub)
                .to.have.been.calledWith(expectedPostArgs)
                .to.have.been.calledOnce;
        });

        it('should call getPreData, getExtra, getPostData in correct sequence', () => {
            cache.getExtra(FOO_KEY);

            expect(preStub).to.have.been.calledOnce;
            expect(dummyAdapter.getExtra)
                .to.have.been.calledAfter(preStub)
                .to.have.been.calledOnce;
            expect(postStub)
                .to.have.been.calledAfter(dummyAdapter.getExtra)
                .to.have.been.calledOnce;
        });
    });

    context('when there are no hooks for pre/post events', () => {
        it('should get item without passing data through pre/post event handlers', () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);
            const expectedItem = createItem(adapterBuiltKey, FOO_VALUE);
            const item = cache.getItem(FOO_KEY);

            expect(preStub).to.not.have.been.called;
            expect(postStub).to.not.have.been.called;

            expect(item).to.deep.eq(expectedItem);
        });

        it(`should get item using adapter's getItem method`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);

            cache.getItem(FOO_KEY);

            expect(dummyAdapter.getItem)
                .to.have.been.calledWith(adapterBuiltKey)
                .to.have.been.calledOnce;
        });
    });
});
