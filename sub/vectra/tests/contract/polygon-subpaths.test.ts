import * as sourceBarrel from '../../src/polygon/index';
import { polygonLeafExports } from './_fixtures/polygon-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'polygon',
  sourceBarrel,
  leafExports: polygonLeafExports,
});
