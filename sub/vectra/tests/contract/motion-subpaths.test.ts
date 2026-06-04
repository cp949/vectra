import * as sourceBarrel from '../../src/motion/index';
import { motionLeafExports } from './_fixtures/motion-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'motion',
  sourceBarrel,
  leafExports: motionLeafExports,
  includeDist: true,
});
