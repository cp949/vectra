import * as sourceBarrel from '../../src/sdf/index';
import { sdfLeafExports } from './_fixtures/sdf-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'sdf',
  sourceBarrel,
  leafExports: sdfLeafExports,
  includeDist: true,
});
