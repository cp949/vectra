import * as sourceBarrel from '../../src/intersects/index';
import { intersectsLeafExports } from './_fixtures/intersects-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'intersects',
  sourceBarrel,
  leafExports: intersectsLeafExports,
  includeDist: true,
  timeout: 30_000,
  barrelCheckMode: 'all',
  compareTestName: 'barrel이 source leaf에 없는 함수를 추가로 export하지 않는다',
});
