import * as sourceBarrel from '../../src/svg-path/index';
import { svgPathLeafExports } from './_fixtures/svg-path-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'svg-path',
  sourceBarrel,
  leafExports: svgPathLeafExports,
});
