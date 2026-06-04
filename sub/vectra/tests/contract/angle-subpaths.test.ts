import * as sourceBarrel from '../../src/angle/index';
import { angleLeafExports } from './_fixtures/angle-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'angle',
  sourceBarrel,
  leafExports: angleLeafExports,
});
