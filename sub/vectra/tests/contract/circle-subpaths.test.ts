import * as sourceBarrel from '../../src/circle/index';
import { circleLeafExports } from './_fixtures/circle-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'circle',
  sourceBarrel,
  leafExports: circleLeafExports,
});
