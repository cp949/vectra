import * as sourceBarrel from '../../src/calculus/index';
import { calculusLeafExports } from './_fixtures/calculus-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'calculus',
  sourceBarrel,
  leafExports: calculusLeafExports,
});
