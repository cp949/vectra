import * as sourceBarrel from '../../src/curve/index';
import { curveLeafExports } from './_fixtures/curve-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'curve',
  sourceBarrel,
  leafExports: curveLeafExports,
});
