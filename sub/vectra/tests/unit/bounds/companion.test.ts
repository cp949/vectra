/** 교차, 합집합과 사각형 변환의 새 객체 반환을 시험한다. */

import { describe, expect, test } from 'vitest';
import { intersection } from '../../../src/bounds/intersection';
import { toRect } from '../../../src/bounds/to-rect';
import { union } from '../../../src/bounds/union';

describe('bounds allocating companions', () => {
  test('union은 plain bounds를 반환한다', () => {
    const result = union({ minX: 0, minY: 1, maxX: 4, maxY: 5 }, { minX: 2, minY: 0, maxX: 6, maxY: 5 });
    expect(result).toEqual({ minX: 0, minY: 0, maxX: 6, maxY: 5 });
  });

  test('intersection은 양수-area 겹침에서 plain bounds를 반환한다', () => {
    const result = intersection({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 3, minY: 2, maxX: 8, maxY: 7 });
    expect(result).toEqual({ minX: 3, minY: 2, maxX: 5, maxY: 5 });
  });

  test('intersection은 edge touch에서 undefined를 반환한다', () => {
    expect(
      intersection({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 5, minY: 0, maxX: 8, maxY: 5 })
    ).toBeUndefined();
  });

  test('toRect는 plain rect를 반환한다', () => {
    const result = toRect({ minX: -2, minY: 3, maxX: 5, maxY: 9 });
    expect(result).toEqual({ x: -2, y: 3, width: 7, height: 6 });
  });
});
