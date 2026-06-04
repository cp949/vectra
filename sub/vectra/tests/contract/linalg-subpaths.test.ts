import * as sourceBarrel from '../../src/linalg/index';
import { linalgLeafExports } from './_fixtures/linalg-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'linalg',
  sourceBarrel,
  leafExports: linalgLeafExports,
  timeout: 30_000,
  barrelCheckMode: 'all',
});
