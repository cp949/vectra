/** 삼각형 생성의 좌표 계산, 경계값과 결과 기록을 검증한다. */

import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromRect } from '../../../src/triangle/from-rect';
import { fromRectInto } from '../../../src/triangle/from-rect-into';
import { expectTriangle } from './builders.helpers';

describe('fromRectInto / fromRect', () => {
  test.each([
    ['object rect', { x: 1, y: 2, width: 3, height: 4 }, { x1: 1, y1: 2, x2: 4, y2: 2, x3: 1, y3: 6 }],
    ['width=0', { x: 5, y: 7, width: 0, height: 4 }, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 11 }],
    ['height=0', { x: 5, y: 7, width: 3, height: 0 }, { x1: 5, y1: 7, x2: 8, y2: 7, x3: 5, y3: 7 }],
    ['width=0, height=0', { x: 5, y: 7, width: 0, height: 0 }, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 7 }],
    ['음수 width/height', { x: 0, y: 0, width: -3, height: -4 }, { x1: 0, y1: 0, x2: -3, y2: 0, x3: 0, y3: -4 }],
  ])('%s', (_, rect, expected) => {
    const out = createTriangle();
    expect(fromRectInto(out, rect)).toBe(out);
    expectTriangle(out, expected);
  });

  test('non-finite component는 JS 산술 결과를 따른다', () => {
    const out = createTriangle();
    fromRectInto(out, { x: Number.NaN, y: 0, width: 3, height: 4 });
    expect(Number.isNaN(out.x1) && Number.isNaN(out.x2) && Number.isNaN(out.x3)).toBe(true);

    fromRectInto(out, { x: 0, y: 0, width: Number.POSITIVE_INFINITY, height: Number.NEGATIVE_INFINITY });
    expect(out.x2).toBe(Number.POSITIVE_INFINITY);
    expect(out.y3).toBe(Number.NEGATIVE_INFINITY);
  });

  test('allocating companion은 rect 좌표 정의를 따른다', () => {
    const expected = { x1: 1, y1: 2, x2: 4, y2: 2, x3: 1, y3: 6 };
    expect(fromRect({ x: 1, y: 2, width: 3, height: 4 })).toEqual(expected);
  });
});
