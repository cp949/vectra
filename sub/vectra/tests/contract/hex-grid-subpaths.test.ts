import * as sourceBarrel from '../../src/hex-grid/index';
import { hexGridLeafExports } from './_fixtures/hex-grid-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'hex-grid',
  sourceBarrel,
  leafExports: hexGridLeafExports,
  includeDist: true,
});
