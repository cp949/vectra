/** 경계 상자의 초기화, 포함 관계, 교차와 확장을 시험한다. */

import { describe, expect, test } from 'vitest';
import { createBounds } from '../../../src/bounds/create-bounds';
import { emptyInto } from '../../../src/bounds/empty-into';
import './relation-expansion.expansion-cases';
import './relation-expansion.relations-cases';

describe('bounds - emptyInto', () => {
  test('sentinel bounds를 기록하고 out을 반환한다', () => {
    const out = createBounds();
    const result = emptyInto(out);
    expect(out).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    expect(result).toBe(out);
  });
});
