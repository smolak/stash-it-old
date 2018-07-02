import sinon from 'sinon';
import { expect } from 'chai';
import { FOO_KEY, createDummyAdapter } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('hasItem method', () => {
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
        cache.hasItem(FOO_KEY);

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith(FOO_KEY)
            .to.have.been.calledOnce;
    });

    it(`should check item's existence using adapter's hasItem method`, () => {
        const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);
        const result = cache.hasItem(FOO_KEY);

        expect(result).to.be.true;
        expect(dummyAdapter.hasItem)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
    });

    context('when there are hooks for pre/post events', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preHasItem',
                    handler: preStub
                },
                {
                    event: 'postHasItem',
                    handler: postStub
                }
            ]);
        });

        it(`should pass data through that hook's handlers`, () => {
            const expectedPreArgs = {
                cacheInstance: cache,
                key: FOO_KEY
            };
            const expectedPostArgs = {
                cacheInstance: cache,
                key: FOO_KEY,
                result: true
            };

            cache.hasItem(FOO_KEY);

            expect(preStub)
                .to.have.been.calledWith(expectedPreArgs)
                .to.have.been.calledOnce;

            expect(postStub)
                .to.have.been.calledWith(expectedPostArgs)
                .to.have.been.calledOnce;
        });

        it('should call getPreData, hasItem, getPostData in correct sequence', () => {
            cache.hasItem(FOO_KEY);

            expect(preStub).to.have.been.calledOnce;
            expect(dummyAdapter.hasItem)
                .to.have.been.calledAfter(preStub)
                .to.have.been.calledOnce;
            expect(postStub)
                .to.have.been.calledAfter(dummyAdapter.hasItem)
                .to.have.been.calledOnce;
        });
    });

    context('when there are no hooks for pre/post events', () => {
        it(`should check item's existence without passing data through pre/post event handlers`, () => {
            const result = cache.hasItem(FOO_KEY);

            expect(preStub).to.not.have.been.called;
            expect(postStub).to.not.have.been.called;

            expect(result).to.be.true;
        });

        it(`should check item's existence using adapter's hasItem method`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);

            cache.hasItem(FOO_KEY);

            expect(dummyAdapter.hasItem)
                .to.have.been.calledWith(adapterBuiltKey)
                .to.have.been.calledOnce;
        });
    });
});
