/** 삼각형 생성의 좌표 계산, 경계값과 결과 기록을 검증한다. */

import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromCircle } from '../../../src/triangle/from-circle';
import { fromCircleInto } from '../../../src/triangle/from-circle-into';
import { expectTriangle, SQRT3 } from './builders.helpers';

describe('fromCircleInto / fromCircle', () => {
  test.each([
    [
      'default rotation',
      { cx: 0, cy: 0, r: 1 },
      undefined,
      { x1: 0, y1: -1, x2: SQRT3 / 2, y2: 0.5, x3: -SQRT3 / 2, y3: 0.5 },
    ],
    [
      'center shift',
      { cx: 10, cy: 20, r: 1 },
      undefined,
      { x1: 10, y1: 19, x2: 10 + SQRT3 / 2, y2: 20.5, x3: 10 - SQRT3 / 2, y3: 20.5 },
    ],
    [
      'custom rotation 0',
      { cx: 0, cy: 0, r: 2 },
      0,
      {
        x1: 2,
        y1: 0,
        x2: 2 * Math.cos((2 * Math.PI) / 3),
        y2: 2 * Math.sin((2 * Math.PI) / 3),
        x3: 2 * Math.cos((4 * Math.PI) / 3),
        y3: 2 * Math.sin((4 * Math.PI) / 3),
      },
    ],
    ['radius = 0', { cx: 5, cy: 7, r: 0 }, undefined, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 7 }],
    [
      '음수 radius',
      { cx: 0, cy: 0, r: -1 },
      undefined,
      { x1: 0, y1: 1, x2: -SQRT3 / 2, y2: -0.5, x3: SQRT3 / 2, y3: -0.5 },
    ],
  ])('%s', (_, circle, rotation, expected) => {
    const out = createTriangle();
    expect(fromCircleInto(out, circle, rotation)).toBe(out);
    expectTriangle(out, expected);
  });

  test('외접원 거리와 유한하지 않은 입력을 검증한다', () => {
    const out = createTriangle();
    fromCircleInto(out, { cx: 3, cy: 7, r: 5 });
    expect(Math.hypot(out.x1 - 3, out.y1 - 7)).toBeCloseTo(5, 12);
    expect(Math.hypot(out.x2 - 3, out.y2 - 7)).toBeCloseTo(5, 12);
    expect(Math.hypot(out.x3 - 3, out.y3 - 7)).toBeCloseTo(5, 12);

    fromCircleInto(out, { cx: 0, cy: 0, r: Number.NaN });
    expect(Number.isNaN(out.y1)).toBe(true);
    fromCircleInto(out, { cx: 0, cy: 0, r: Number.POSITIVE_INFINITY });
    expect(out.y1).toBe(Number.NEGATIVE_INFINITY);
    fromCircleInto(out, { cx: 0, cy: 0, r: Number.NEGATIVE_INFINITY });
    expect(out.y1).toBe(Number.POSITIVE_INFINITY);
    fromCircleInto(out, { cx: 0, cy: 0, r: 2 }, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.x1)).toBe(true);
  });

  test('allocating companion은 Into 결과와 일치한다', () => {
    expectTriangle(fromCircle({ cx: 0, cy: 0, r: 1 }), {
      x1: 0,
      y1: -1,
      x2: SQRT3 / 2,
      y2: 0.5,
      x3: -SQRT3 / 2,
      y3: 0.5,
    });
    const expected = createTriangle();
    fromCircleInto(expected, { cx: 3, cy: 7, r: 5 });
    expect(fromCircle({ cx: 3, cy: 7, r: 5 })).toEqual(expected);
  });
});
