import * as sourceBarrel from '../../src/statistics/index';
import { statisticsLeafExports } from './_fixtures/statistics-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'statistics',
  sourceBarrel,
  leafExports: statisticsLeafExports,
});
