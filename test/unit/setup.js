import chai from 'chai';
import sinonChai from 'sinon-chai';

import throwOnWarnings from './helpers/throwOnWarnings';

throwOnWarnings(console);

chai.use(sinonChai);
