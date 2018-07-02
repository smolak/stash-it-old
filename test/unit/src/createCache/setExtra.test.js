import sinon from 'sinon';
import { expect } from 'chai';
import {
    createDummyAdapter,
    FOO_KEY,
    FOO_EXTRA,
    NONEXISTENT_KEY,
    nonObjectValues
} from 'stash-it-test-helpers';

import createItem from '../../../../src/createItem';
import { createCache } from '../../../../src/createCache';

describe('setExtra method', () => {
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

        cache.setExtra(FOO_KEY, FOO_EXTRA);

        expect(dummyAdapter.hasItem)
            .to.have.been.calledWith(adapterBuiltKey)
            .to.have.been.calledOnce;
    });

    it(`should build key using adapter's buildKey method`, () => {
        cache.setExtra(FOO_KEY, FOO_EXTRA);

        expect(dummyAdapter.buildKey)
            .to.have.been.calledWith(FOO_KEY)
            .to.have.been.calledTwice;
    });

    it(`should set extra using adapter's setExtra method`, () => {
        const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);
        const setExtra = cache.setExtra(FOO_KEY, FOO_EXTRA);

        expect(setExtra).to.deep.eq(FOO_EXTRA);
        expect(dummyAdapter.setExtra)
            .to.have.been.calledWith(adapterBuiltKey, FOO_EXTRA)
            .to.have.been.calledOnce;
    });

    describe('extra validation', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preSetExtra',
                    handler: preStub
                },
                {
                    event: 'postSetExtra',
                    handler: postStub
                }
            ]);
        });

        it('should happen after getPreData', () => {
            try {
                cache.setExtra(FOO_KEY, null);
            }
            catch (e) {
                expect(preStub).to.have.been.calledOnce;
            }
        });

        it(`should happen before using adapter's setExtra method`, () => {
            try {
                cache.setExtra(FOO_KEY, null);
            }
            catch (e) {
                expect(dummyAdapter.setExtra).to.not.have.been.called;
            }
        });

        it('should happen before getPostData', () => {
            try {
                cache.setExtra(FOO_KEY, null);
            }
            catch (e) {
                expect(postStub).to.not.have.been.called;
            }
        });

        context('when extra is not an object', () => {
            it('should throw', () => {
                nonObjectValues.forEach((extra) => {
                    expect(cache.setExtra.bind(cache, FOO_KEY, extra)).to.throw("'extra' must be an object.");
                });
            });
        });
    });

    context('when item does not exist', () => {
        it('should return undefined', () => {
            const setExtra = cache.setExtra(NONEXISTENT_KEY, FOO_EXTRA);

            expect(setExtra).to.be.undefined;
        });
    });

    context('when there are hooks for pre/post events', () => {
        beforeEach(() => {
            cache.addHooks([
                {
                    event: 'preSetExtra',
                    handler: preStub
                },
                {
                    event: 'postSetExtra',
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

            cache.setExtra(FOO_KEY, FOO_EXTRA);

            expect(preStub)
                .to.have.been.calledWith(expectedPreArgs)
                .to.have.been.calledOnce;

            expect(postStub)
                .to.have.been.calledWith(expectedPostArgs)
                .to.have.been.calledOnce;
        });

        it('should call getPreData, setExtra, getPostData in correct sequence', () => {
            cache.setExtra(FOO_KEY, FOO_EXTRA);

            expect(preStub).to.have.been.calledOnce;
            expect(dummyAdapter.setExtra)
                .to.have.been.calledAfter(preStub)
                .to.have.been.calledOnce;
            expect(postStub)
                .to.have.been.calledAfter(dummyAdapter.setExtra)
                .to.have.been.calledOnce;
        });
    });

    context('when there are no hooks for pre/post events', () => {
        it('should set extra without passing data through pre/post event handlers', () => {
            const setExtra = cache.setExtra(FOO_KEY, FOO_EXTRA);

            expect(preStub).to.not.have.been.called;
            expect(postStub).to.not.have.been.called;

            expect(setExtra).to.deep.eq(FOO_EXTRA);
        });

        it(`should set extra using adapter's setExtra method`, () => {
            const adapterBuiltKey = dummyAdapter.buildKey(FOO_KEY);

            cache.setExtra(FOO_KEY, FOO_EXTRA);

            expect(dummyAdapter.setExtra)
                .to.have.been.calledWith(adapterBuiltKey, FOO_EXTRA)
                .to.have.been.calledOnce;
        });
    });
});
