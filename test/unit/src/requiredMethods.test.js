import { expect } from 'chai';

import requiredMethods from '../../../src/requiredMethods';

describe('requiredMethods', () => {
    it('should contain all required methods', () => {
        expect(requiredMethods).to.deep.equal([
            'getItem', 'getExtra', 'setItem', 'addExtra', 'setExtra', 'hasItem', 'removeItem'
        ]);
    });
});
