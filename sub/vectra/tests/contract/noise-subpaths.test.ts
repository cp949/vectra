import * as sourceBarrel from '../../src/noise/index';
import { noiseLeafExports } from './_fixtures/noise-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'noise',
  sourceBarrel,
  leafExports: noiseLeafExports,
  includeDist: true,
});
