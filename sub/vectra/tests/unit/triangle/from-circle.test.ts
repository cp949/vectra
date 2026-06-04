import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromCircle } from '../../../src/triangle/from-circle';
import { fromCircleInto } from '../../../src/triangle/from-circle-into';
import { expectTriangle, SQRT3 } from './builders.helpers';

describe('fromCircleInto / fromCircle', () => {
  test.each([
    [
      'default rotation',
      { center: { x: 0, y: 0 }, radius: 1 },
      undefined,
      { a: { x: 0, y: -1 }, b: { x: SQRT3 / 2, y: 0.5 }, c: { x: -SQRT3 / 2, y: 0.5 } },
    ],
    [
      'center shift',
      { center: { x: 10, y: 20 }, radius: 1 },
      undefined,
      { a: { x: 10, y: 19 }, b: { x: 10 + SQRT3 / 2, y: 20.5 }, c: { x: 10 - SQRT3 / 2, y: 20.5 } },
    ],
    [
      'tuple circle input',
      [{ x: 10, y: 20 }, 1] as const,
      undefined,
      { a: { x: 10, y: 19 }, b: { x: 10 + SQRT3 / 2, y: 20.5 }, c: { x: 10 - SQRT3 / 2, y: 20.5 } },
    ],
    [
      'custom rotation 0',
      { center: { x: 0, y: 0 }, radius: 2 },
      0,
      {
        a: { x: 2, y: 0 },
        b: { x: 2 * Math.cos((2 * Math.PI) / 3), y: 2 * Math.sin((2 * Math.PI) / 3) },
        c: { x: 2 * Math.cos((4 * Math.PI) / 3), y: 2 * Math.sin((4 * Math.PI) / 3) },
      },
    ],
    [
      'radius = 0',
      { center: { x: 5, y: 7 }, radius: 0 },
      undefined,
      { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } },
    ],
    [
      '음수 radius',
      { center: { x: 0, y: 0 }, radius: -1 },
      undefined,
      { a: { x: 0, y: 1 }, b: { x: -SQRT3 / 2, y: -0.5 }, c: { x: SQRT3 / 2, y: -0.5 } },
    ],
  ])('%s', (_, circle, rotation, expected) => {
    const out = createTriangle();
    expect(fromCircleInto(out, circle, rotation)).toBe(out);
    expectTriangle(out, expected);
  });

  test('외접원 거리, non-finite, aliasing 계약을 지킨다', () => {
    const out = createTriangle();
    fromCircleInto(out, { center: { x: 3, y: 7 }, radius: 5 });
    expect(Math.hypot(out.a.x - 3, out.a.y - 7)).toBeCloseTo(5, 12);
    expect(Math.hypot(out.b.x - 3, out.b.y - 7)).toBeCloseTo(5, 12);
    expect(Math.hypot(out.c.x - 3, out.c.y - 7)).toBeCloseTo(5, 12);

    fromCircleInto(out, { center: { x: 0, y: 0 }, radius: Number.NaN });
    expect(Number.isNaN(out.a.y)).toBe(true);
    fromCircleInto(out, { center: { x: 0, y: 0 }, radius: Number.POSITIVE_INFINITY });
    expect(out.a.y).toBe(Number.NEGATIVE_INFINITY);
    fromCircleInto(out, { center: { x: 0, y: 0 }, radius: Number.NEGATIVE_INFINITY });
    expect(out.a.y).toBe(Number.POSITIVE_INFINITY);
    fromCircleInto(out, { center: { x: 0, y: 0 }, radius: 2 }, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.a.x)).toBe(true);

    out.a.x = 10;
    out.a.y = 20;
    fromCircleInto(out, { center: out.a, radius: 1 });
    expectTriangle(out, { a: { x: 10, y: 19 }, b: { x: 10 + SQRT3 / 2, y: 20.5 }, c: { x: 10 - SQRT3 / 2, y: 20.5 } });
  });

  test('allocating companion은 Into 결과와 일치한다', () => {
    expectTriangle(fromCircle({ center: { x: 0, y: 0 }, radius: 1 }), {
      a: { x: 0, y: -1 },
      b: { x: SQRT3 / 2, y: 0.5 },
      c: { x: -SQRT3 / 2, y: 0.5 },
    });
    const expected = createTriangle();
    fromCircleInto(expected, [{ x: 3, y: 7 }, 5] as const);
    expect(fromCircle([{ x: 3, y: 7 }, 5] as const)).toEqual(expected);
  });
});
