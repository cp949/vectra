import * as sourceBarrel from '../../src/pose2/index';
import { pose2LeafExports } from './_fixtures/pose2-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'pose2',
  sourceBarrel,
  leafExports: pose2LeafExports,
  includeDist: true,
});
