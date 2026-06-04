import * as sourceBarrel from '../../src/polyline/index';
import { polylineLeafExports } from './_fixtures/polyline-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'polyline',
  sourceBarrel,
  leafExports: polylineLeafExports,
});
