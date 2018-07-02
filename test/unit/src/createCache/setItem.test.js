import sinon from 'sinon';
import { expect } from 'chai';
import {
    createDummyAdapter,
    FOO_KEY,
    FOO_VALUE,
    FOO_WITH_EXTRA_KEY,
    FOO_EXTRA
} from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('setItem method', () => {
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
        cache.setItem(FOO_KEY, FOO_VALUE);

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith(FOO_KEY)
            .to.have.been.calledOnce;
    });

    it(`should set item using adapter's setItem method`, () => {
        const adapterBuiltKey = dummyAdapter.buildKey(FOO_WITH_EXTRA_KEY);
        const item = createItem(adapterBuiltKey, FOO_VALUE, FOO_EXTRA);
        const setItem = cache.setItem(FOO_WITH_EXTRA_KEY, FOO_VALUE, FOO_EXTRA);

        expect(setItem).to.deep.eq(item);
        expect(dummyAdapter.setItem)
            .to.have.been.calledWith(adapterBuiltKey, FOO_VALUE, FOO_EXTRA)
            .to.have.been.calledOnce;
    });

    context('when there are hooks for pre/post events', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preSetItem',
                    handler: preStub
                },
                {
                    event: 'postSetItem',
                    handler: postStub
                }
            ]);
        });

        it(`should pass data through that hook's handlers`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_WITH_EXTRA_KEY);
            const item = createItem(adapterBuiltKey, FOO_VALUE, FOO_EXTRA);
            const expectedPreArgs = {
                cacheInstance: cache,
                extra: FOO_EXTRA,
                key: FOO_WITH_EXTRA_KEY,
                value: FOO_VALUE
            };
            const expectedPostArgs = {
                cacheInstance: cache,
                extra: FOO_EXTRA,
                item,
                key: FOO_WITH_EXTRA_KEY,
                value: FOO_VALUE
            };

            cache.setItem(FOO_WITH_EXTRA_KEY, FOO_VALUE, FOO_EXTRA);

            expect(preStub)
                .to.have.been.calledWith(expectedPreArgs)
                .to.have.been.calledOnce;

            expect(postStub)
                .to.have.been.calledWith(expectedPostArgs)
                .to.have.been.calledOnce;
        });

        it('should call getPreData, setItem, getPostData in correct sequence', () => {
            cache.setItem(FOO_KEY, FOO_VALUE);

            expect(preStub).to.have.been.calledOnce;
            expect(dummyAdapter.setItem)
                .to.have.been.calledAfter(preStub)
                .to.have.been.calledOnce;
            expect(postStub)
                .to.have.been.calledAfter(dummyAdapter.setItem)
                .to.have.been.calledOnce;
        });
    });

    context('when there are no hooks for pre/post events', () => {
        it('should set item without passing data through pre/post event handlers', () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY, FOO_VALUE);
            const expectedItem = createItem(adapterBuiltKey, FOO_VALUE);
            const item = cache.setItem(FOO_KEY, FOO_VALUE);

            expect(preStub).to.not.have.been.called;
            expect(postStub).to.not.have.been.called;

            expect(item).to.deep.eq(expectedItem);
        });

        it(`should set item using adapter's setItem method`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_WITH_EXTRA_KEY);

            cache.setItem(FOO_WITH_EXTRA_KEY, FOO_VALUE, FOO_EXTRA);

            expect(dummyAdapter.setItem)
                .to.have.been.calledWith(adapterBuiltKey, FOO_VALUE, FOO_EXTRA)
                .to.have.been.calledOnce;
        });
    });
});
