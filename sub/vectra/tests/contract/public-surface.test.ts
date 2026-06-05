/**
 * Package public surface runtime 계약 테스트.
 *
 * package.json exports key 목록/순서, 도메인 barrel 전수 import는 각각
 * package-imports.test.ts(specifier resolve / dist import contract)와
 * `*-subpaths.test.ts`(source barrel kind smoke)가 커버하므로 여기서 반복하지 않는다.
 */

import { describe, expect, test } from 'vitest';

describe('public surface 계약', () => {
  test('root entry가 패키지 이름 상수를 export한다', async () => {
    const root = await import('../../src/index');

    expect(root.VECTRA_PACKAGE_NAME).toBe('@cp949/vectra');
  });
});
