import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

import throwOnWarnings from './helpers/throwOnWarnings';

throwOnWarnings(console);

chai.use(sinonChai);
chai.use(chaiAsPromised);
