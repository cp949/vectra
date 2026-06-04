import * as sourceBarrel from '../../src/ray/index';
import { rayLeafExports } from './_fixtures/ray-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'ray',
  sourceBarrel,
  leafExports: rayLeafExports,
});
