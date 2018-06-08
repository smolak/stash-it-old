import { expect } from 'chai';
import { nonObjectValues } from 'stash-it-test-helpers';

import createItem from '../../../src/createItem';

describe('createItem', () => {
    const key = 'key';
    const value = 'value';
    const extra = { some: 'extra' };

    it('should create item', () => {
        const item = createItem(key, value, extra);
        const expectedItem = {
            key,
            value,
            extra
        };

        expect(item).to.deep.eq(expectedItem);
    });

    context('when extra is not passed', () => {
        it('should create an item', () => {
            const item = createItem(key, value);
            const expectedItem = {
                key,
                value,
                extra: {}
            };

            expect(item).to.deep.eq(expectedItem);
        });
    });

    context('when extra is passed as undefined', () => {
        it('should create an item', () => {
            const item = createItem(key, value, undefined);
            const expectedItem = {
                key,
                value,
                extra: {}
            };

            expect(item).to.deep.eq(expectedItem);
        });
    });

    context('when extra is not of object type', () => {
        it('should throw', () => {
            nonObjectValues.forEach((nonObjectValue) => {
                if (nonObjectValue !== undefined) {
                    expect(createItem.bind(null, key, value, nonObjectValue)).to.throw(
                        '`extra` must be an object.'
                    );
                }
            });
        });
    });
});
