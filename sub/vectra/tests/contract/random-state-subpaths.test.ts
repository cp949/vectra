/**
 * random-state subpath export contract 검증.
 * source-level barrel/leaf import와 package.json wildcard pattern을 다룬다.
 */
import * as sourceBarrel from '../../src/random-state/index';
import { randomStateLeafExports } from './_fixtures/random-state-leaf-exports';
import { assertDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertDomainSubpathExports({
  domain: 'random-state',
  sourceBarrel,
  leafExports: randomStateLeafExports,
  compareTestName: 'barrel이 fixture에 없는 export를 추가로 노출하지 않는다',
});
