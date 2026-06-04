import * as sourceBarrel from '../../src/interpolation/index';
import { interpolationLeafExports } from './_fixtures/interpolation-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'interpolation',
  sourceBarrel,
  leafExports: interpolationLeafExports,
});
