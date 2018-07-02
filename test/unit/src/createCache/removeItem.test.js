import sinon from 'sinon';
import { expect } from 'chai';
import { createDummyAdapter, FOO_KEY } from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('removeItem method', () => {
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
        cache.removeItem(FOO_KEY);

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith(FOO_KEY)
            .to.have.been.calledOnce;
    });

    it(`should remove item using adapter's removeItem method`, () => {
        const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);
        const result = cache.removeItem(FOO_KEY);

        expect(result).to.be.true;
        expect(dummyAdapter.removeItem)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
    });

    context('when there are hooks for pre/post events', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preRemoveItem',
                    handler: preStub
                },
                {
                    event: 'postRemoveItem',
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

            cache.removeItem(FOO_KEY);

            expect(preStub)
                .to.have.been.calledWith(expectedPreArgs)
                .to.have.been.calledOnce;

            expect(postStub)
                .to.have.been.calledWith(expectedPostArgs)
                .to.have.been.calledOnce;
        });

        it('should call getPreData, removeItem, getPostData in correct sequence', () => {
            cache.removeItem(FOO_KEY);

            expect(preStub).to.have.been.calledOnce;
            expect(dummyAdapter.removeItem)
                .to.have.been.calledAfter(preStub)
                .to.have.been.calledOnce;
            expect(postStub)
                .to.have.been.calledAfter(dummyAdapter.removeItem)
                .to.have.been.calledOnce;
        });
    });

    context('when there are no hooks for pre/post events', () => {
        it('should remove item without passing data through pre/post event handlers', () => {
            const result = cache.removeItem(FOO_KEY);

            expect(preStub).to.not.have.been.called;
            expect(postStub).to.not.have.been.called;

            expect(result).to.be.true;
        });

        it(`should remove item using adapter's removeItem method`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);

            cache.removeItem(FOO_KEY);

            expect(dummyAdapter.removeItem)
                .to.have.been.calledWith(adapterBuiltKey)
                .to.have.been.calledOnce;
        });
    });
});
