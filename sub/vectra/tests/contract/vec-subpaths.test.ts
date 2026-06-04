import * as sourceBarrel from '../../src/vec/index';
import { vecLeafExports } from './_fixtures/vec-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'vec',
  sourceBarrel,
  leafExports: vecLeafExports,
});
