import * as sourceBarrel from '../../src/adapter/index';
import { adapterLeafExports } from './_fixtures/adapter-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'adapter',
  sourceBarrel,
  leafExports: adapterLeafExports,
});
