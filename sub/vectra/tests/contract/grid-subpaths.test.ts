import * as sourceBarrel from '../../src/grid/index';
import { gridLeafExports } from './_fixtures/grid-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'grid',
  sourceBarrel,
  leafExports: gridLeafExports,
  includeDist: true,
});
