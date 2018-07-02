import sinon from 'sinon';
import { expect } from 'chai';
import {
    createDummyAdapter,
    FOO_EXTRA,
    FOO_KEY,
    NONEXISTENT_KEY,
    nonObjectValues
} from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('addExtra method', () => {
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

    it('should check if item exists', () => {
        const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);

        cache.addExtra(FOO_KEY, FOO_EXTRA);

        expect(dummyAdapter.hasItem)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
    });

    it(`should build key using adapter's buildKey method`, () => {
        cache.addExtra(FOO_KEY, FOO_EXTRA);

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith(FOO_KEY)
            .to.have.been.calledTwice;
    });

    it(`should add extra using adapter's addExtra method`, () => {
        const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);
        const addedExtra = cache.addExtra(FOO_KEY, FOO_EXTRA);

        expect(addedExtra).to.deep.eq(FOO_EXTRA);
        expect(dummyAdapter.addExtra)
            .to.have.been.calledWith(adapterBuiltKey, FOO_EXTRA)
            .to.have.been.calledOnce;
    });

    describe('extra validation', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preAddExtra',
                    handler: preStub
                },
                {
                    event: 'postAddExtra',
                    handler: postStub
                }
            ]);
        });

        it('should happen after getPreData', () => {
            try {
                cache.addExtra(FOO_KEY, null);
            }
            catch (e) {
                expect(preStub).to.have.been.calledOnce;
            }
        });

        it(`should happen before using adapter's addExtra method`, () => {
            try {
                cache.addExtra(FOO_KEY, null);
            }
            catch (e) {
                expect(dummyAdapter.addExtra).to.not.have.been.called;
            }
        });

        it('should happen before getPostData', () => {
            try {
                cache.addExtra(FOO_KEY, null);
            }
            catch (e) {
                expect(postStub).to.not.have.been.called;
            }
        });

        context('when extra is not an object', () => {
            it('should throw', () => {
                nonObjectValues.forEach((extra) => {
                    expect(cache.addExtra.bind(cache, FOO_KEY, extra)).to.throw("'extra' must be an object.");
                });
            });
        });
    });

    context('when item does not exist', () => {
        it('should return undefined', () => {
            const addedExtra = cache.addExtra(NONEXISTENT_KEY, FOO_EXTRA);

            expect(addedExtra).to.be.undefined;
        });
    });

    context('when there are hooks for pre/post events', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preAddExtra',
                    handler: preStub
                },
                {
                    event: 'postAddExtra',
                    handler: postStub
                }
            ]);
        });

        it(`should pass data through that hook's handlers`, () => {
            const expectedPreArgs = {
                cacheInstance: cache,
                extra: FOO_EXTRA,
                key: FOO_KEY
            };
            const expectedPostArgs = {
                cacheInstance: cache,
                extra: FOO_EXTRA,
                key: FOO_KEY
            };

            cache.addExtra(FOO_KEY, FOO_EXTRA);

            expect(preStub)
                .to.have.been.calledWith(expectedPreArgs)
                .to.have.been.calledOnce;

            expect(postStub)
                .to.have.been.calledWith(expectedPostArgs)
                .to.have.been.calledOnce;
        });

        it('should call getPreData, addExtra, getPostData in correct sequence', () => {
            cache.addExtra(FOO_KEY, FOO_EXTRA);

            expect(preStub).to.have.been.calledOnce;
            expect(dummyAdapter.addExtra)
                .to.have.been.calledAfter(preStub)
                .to.have.been.calledOnce;
            expect(postStub)
                .to.have.been.calledAfter(dummyAdapter.addExtra)
                .to.have.been.calledOnce;
        });
    });

    context('when there are no hooks for pre/post events', () => {
        it('should set extra without passing data through pre/post event handlers', () => {
            const addedExtra = cache.addExtra(FOO_KEY, FOO_EXTRA);

            expect(preStub).to.not.have.been.called;
            expect(postStub).to.not.have.been.called;

            expect(addedExtra).to.deep.eq(FOO_EXTRA);
        });

        it(`should set extra using adapter's addExtra method`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);

            cache.addExtra(FOO_KEY, FOO_EXTRA);

            expect(dummyAdapter.addExtra)
                .to.have.been.calledWith(adapterBuiltKey, FOO_EXTRA)
                .to.have.been.calledOnce;
        });
    });
});
