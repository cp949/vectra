import * as sourceBarrel from '../../src/rect/index';
import { rectLeafExports } from './_fixtures/rect-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'rect',
  sourceBarrel,
  leafExports: rectLeafExports,
});
