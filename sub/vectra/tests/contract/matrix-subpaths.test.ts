import * as sourceBarrel from '../../src/matrix/index';
import { matrixLeafExports } from './_fixtures/matrix-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'matrix',
  sourceBarrel,
  leafExports: matrixLeafExports,
});
