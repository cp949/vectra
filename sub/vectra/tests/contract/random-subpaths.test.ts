import * as sourceBarrel from '../../src/random/index';
import { randomLeafExports } from './_fixtures/random-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'random',
  sourceBarrel,
  leafExports: randomLeafExports,
});
