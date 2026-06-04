import * as sourceBarrel from '../../src/capsule/index';
import { capsuleLeafExports } from './_fixtures/capsule-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'capsule',
  sourceBarrel,
  leafExports: capsuleLeafExports,
  includeDist: true,
});
