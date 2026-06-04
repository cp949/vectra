import * as sourceBarrel from '../../src/infinite-line/index';
import { infiniteLineLeafExports } from './_fixtures/infinite-line-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'infinite-line',
  sourceBarrel,
  leafExports: infiniteLineLeafExports,
});
