import * as sourceBarrel from '../../src/oriented-rect/index';
import { orientedRectLeafExports } from './_fixtures/oriented-rect-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'oriented-rect',
  sourceBarrel,
  leafExports: orientedRectLeafExports,
  includeDist: true,
});
