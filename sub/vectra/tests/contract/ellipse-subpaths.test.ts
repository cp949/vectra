import * as sourceBarrel from '../../src/ellipse/index';
import { ellipseLeafExports } from './_fixtures/ellipse-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'ellipse',
  sourceBarrel,
  leafExports: ellipseLeafExports,
});
