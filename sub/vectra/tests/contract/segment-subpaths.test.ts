import * as sourceBarrel from '../../src/segment/index';
import { segmentLeafExports } from './_fixtures/segment-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'segment',
  sourceBarrel,
  leafExports: segmentLeafExports,
  includeDist: true,
});
