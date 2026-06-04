import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromCenter } from '../../../src/triangle/from-center';
import { fromCenterInto } from '../../../src/triangle/from-center-into';
import { expectTriangle, SQRT3, type TrianglePoints } from './builders.helpers';

describe('fromCenterInto / fromCenter', () => {
  test.each([
    [
      'default rotation',
      { x: 0, y: 0 },
      SQRT3,
      undefined,
      { a: { x: 0, y: -1 }, b: { x: SQRT3 / 2, y: 0.5 }, c: { x: -SQRT3 / 2, y: 0.5 } },
    ],
    [
      'custom rotation 0',
      { x: 0, y: 0 },
      SQRT3,
      0,
      {
        a: { x: 1, y: 0 },
        b: { x: Math.cos((2 * Math.PI) / 3), y: Math.sin((2 * Math.PI) / 3) },
        c: { x: Math.cos((4 * Math.PI) / 3), y: Math.sin((4 * Math.PI) / 3) },
      },
    ],
    [
      'tuple center input',
      [10, 20] as const,
      SQRT3,
      undefined,
      { a: { x: 10, y: 19 }, b: { x: 10 + SQRT3 / 2, y: 20.5 }, c: { x: 10 - SQRT3 / 2, y: 20.5 } },
    ],
    ['sideLength = 0', { x: 5, y: 7 }, 0, undefined, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } }],
    [
      '음수 sideLength',
      { x: 0, y: 0 },
      -SQRT3,
      undefined,
      { a: { x: 0, y: 1 }, b: { x: -SQRT3 / 2, y: -0.5 }, c: { x: SQRT3 / 2, y: -0.5 } },
    ],
  ])('%s', (_, center, sideLength, rotation, expected) => {
    const out = createTriangle();
    expect(fromCenterInto(out, center, sideLength, rotation)).toBe(out);
    expectTriangle(out, expected);
  });

  test('centroid와 sideLength 계약을 만족한다', () => {
    const out = createTriangle();
    fromCenterInto(out, { x: 3, y: 7 }, 5);
    expect((out.a.x + out.b.x + out.c.x) / 3).toBeCloseTo(3, 12);
    expect((out.a.y + out.b.y + out.c.y) / 3).toBeCloseTo(7, 12);

    fromCenterInto(out, { x: 0, y: 0 }, 6);
    expect(Math.hypot(out.b.x - out.a.x, out.b.y - out.a.y)).toBeCloseTo(6, 12);
    expect(Math.hypot(out.c.x - out.b.x, out.c.y - out.b.y)).toBeCloseTo(6, 12);
  });

  test.each([
    ['NaN sideLength', Number.NaN, (out: TrianglePoints) => expect(Number.isNaN(out.a.x)).toBe(true)],
    [
      'Infinity sideLength',
      Number.POSITIVE_INFINITY,
      (out: TrianglePoints) => expect(out.a.y).toBe(Number.NEGATIVE_INFINITY),
    ],
    [
      '-Infinity sideLength',
      Number.NEGATIVE_INFINITY,
      (out: TrianglePoints) => expect(out.a.y).toBe(Number.POSITIVE_INFINITY),
    ],
  ])('%s는 JS 산술 결과를 따른다', (_, sideLength, assert) => {
    const out = createTriangle();
    fromCenterInto(out, { x: 0, y: 0 }, sideLength);
    assert(out);
  });

  test('non-finite rotation과 aliasing을 처리한다', () => {
    const out = createTriangle();
    fromCenterInto(out, { x: 0, y: 0 }, 2, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.a.x)).toBe(true);
    expect(Number.isNaN(out.b.y)).toBe(true);

    out.a.x = 10;
    out.a.y = 20;
    fromCenterInto(out, out.a, SQRT3);
    expectTriangle(out, { a: { x: 10, y: 19 }, b: { x: 10 + SQRT3 / 2, y: 20.5 }, c: { x: 10 - SQRT3 / 2, y: 20.5 } });
  });

  test('allocating companion은 Into 결과와 일치한다', () => {
    const expected = createTriangle();
    fromCenterInto(expected, { x: 3, y: 7 }, 5);
    expect(fromCenter({ x: 3, y: 7 }, 5)).toEqual(expected);
  });
});
