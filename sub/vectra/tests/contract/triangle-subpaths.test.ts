import * as sourceBarrel from '../../src/triangle/index';
import { triangleLeafExports } from './_fixtures/triangle-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'triangle',
  sourceBarrel,
  leafExports: triangleLeafExports,
});
