import { expect } from 'chai';
import { nonObjectValues } from 'stash-it-test-helpers';

import createItem from '../../../src/createItem';

describe('createItem', () => {
    const key = 'key';
    const value = 'value';
    const namespace = 'namespace';
    const extra = { some: 'extra' };

    it('should create item', () => {
        const item = createItem(key, value, namespace, extra);
        const expectedItem = {
            key,
            value,
            namespace,
            extra
        };

        expect(item).to.deep.eq(expectedItem);
    });

    context('when extra is not passed', () => {
        it('should create an item', () => {
            const item = createItem(key, value, namespace);
            const expectedItem = {
                key,
                value,
                namespace,
                extra: {}
            };

            expect(item).to.deep.eq(expectedItem);
        });
    });

    context('when extra is passed as undefined', () => {
        it('should create an item', () => {
            const item = createItem(key, value, namespace, undefined);
            const expectedItem = {
                key,
                value,
                namespace,
                extra: {}
            };

            expect(item).to.deep.eq(expectedItem);
        });
    });

    context('when extra is not of object type', () => {
        it('should throw', () => {
            nonObjectValues.forEach((nonObjectValue) => {
                if (nonObjectValue !== undefined) {
                    expect(createItem.bind(null, key, value, namespace, nonObjectValue)).to.throw(
                        '`extra` must be an object.'
                    );
                }
            });
        });
    });
});
