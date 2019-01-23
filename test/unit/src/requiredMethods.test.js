import { expect } from 'chai';

import requiredMethods from '../../../src/requiredMethods';

describe('requiredMethods', () => {
    it('should contain all required methods', () => {
        expect(requiredMethods).to.deep.equal([
            'buildKey', 'getItem', 'getExtra', 'setItem', 'addExtra', 'setExtra', 'hasItem', 'removeItem'
        ]);
    });
});
