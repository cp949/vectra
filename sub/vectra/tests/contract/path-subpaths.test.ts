import * as sourceBarrel from '../../src/path/index';
import { pathLeafExports } from './_fixtures/path-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'path',
  sourceBarrel,
  leafExports: pathLeafExports,
});
