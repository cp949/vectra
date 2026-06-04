import { expect, test } from 'vitest';
import * as sourceBarrel from '../../src/math/index';
import { mathLeafExports } from './_fixtures/math-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'math',
  sourceBarrel,
  leafExports: mathLeafExports,
});

test('wrap과 wrapFloatInclusive를 export하지 않는다', async () => {
  expect('wrap' in sourceBarrel).toBe(false);
  expect('wrapFloatInclusive' in sourceBarrel).toBe(false);
});
