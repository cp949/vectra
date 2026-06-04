import * as sourceBarrel from '../../src/fitting/index';
import { fittingLeafExports } from './_fixtures/fitting-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'fitting',
  sourceBarrel,
  leafExports: fittingLeafExports,
  includeDist: true,
});
