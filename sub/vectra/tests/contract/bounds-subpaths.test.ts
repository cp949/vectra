import * as sourceBarrel from '../../src/bounds/index';
import { boundsLeafExports } from './_fixtures/bounds-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'bounds',
  sourceBarrel,
  leafExports: boundsLeafExports,
});
