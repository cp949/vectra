/** 사각형 결과를 새로 만드는 변환 함수를 시험한다. */

import { describe, expect, test } from 'vitest';
import { fromBounds } from '../../../src/rect/from-bounds';
import { intersection } from '../../../src/rect/intersection';
import { union } from '../../../src/rect/union';

describe('rect allocating companions', () => {
  test('fromBounds는 plain rect를 반환한다', () => {
    expect(fromBounds({ minX: 2, minY: 3, maxX: 7, maxY: 11 })).toEqual({
      x: 2,
      y: 3,
      width: 5,
      height: 8,
    });
  });

  test('union은 plain rect를 반환한다', () => {
    const result = union({ x: 0, y: 1, width: 4, height: 4 }, { x: 2, y: 0, width: 4, height: 5 });
    expect(result).toEqual({ x: 0, y: 0, width: 6, height: 5 });
  });

  test('intersection은 양수-area 겹침에서 plain rect를 반환한다', () => {
    const result = intersection({ x: 0, y: 0, width: 5, height: 5 }, { x: 3, y: 2, width: 5, height: 5 });
    expect(result).toEqual({ x: 3, y: 2, width: 2, height: 3 });
  });

  test('intersection은 edge touch에서 undefined를 반환한다', () => {
    expect(intersection({ x: 0, y: 0, width: 5, height: 5 }, { x: 5, y: 0, width: 3, height: 5 })).toBeUndefined();
  });
});
