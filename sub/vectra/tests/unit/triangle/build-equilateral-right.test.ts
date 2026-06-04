import { describe, expect, test } from 'vitest';
import { buildEquilateral } from '../../../src/triangle/build-equilateral';
import { buildEquilateralInto } from '../../../src/triangle/build-equilateral-into';
import { buildRight } from '../../../src/triangle/build-right';
import { buildRightInto } from '../../../src/triangle/build-right-into';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { expectTriangle, expectXY, SQRT3, type TrianglePoints } from './builders.helpers';

describe('buildEquilateralInto', () => {
  test.each([
    ['기본 angle 0', { x: 0, y: 0 }, 2, undefined, { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 1, y: SQRT3 } }],
    [
      'origin shift',
      { x: 10, y: 20 },
      2,
      undefined,
      { a: { x: 10, y: 20 }, b: { x: 12, y: 20 }, c: { x: 11, y: 20 + SQRT3 } },
    ],
    [
      'angle = PI/2',
      { x: 0, y: 0 },
      2,
      Math.PI / 2,
      {
        a: { x: 0, y: 0 },
        b: { x: 0, y: 2 },
        c: { x: 2 * Math.cos((5 * Math.PI) / 6), y: 2 * Math.sin((5 * Math.PI) / 6) },
      },
    ],
    ['sideLength = 0', { x: 5, y: 7 }, 0, undefined, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } }],
    [
      'tuple XYInput origin',
      [3, 4] as const,
      2,
      undefined,
      { a: { x: 3, y: 4 }, b: { x: 5, y: 4 }, c: { x: 4, y: 4 + SQRT3 } },
    ],
    [
      '음수 sideLength',
      { x: 0, y: 0 },
      -1,
      undefined,
      { a: { x: 0, y: 0 }, b: { x: -1, y: 0 }, c: { x: -0.5, y: -SQRT3 / 2 } },
    ],
  ])('%s', (_, origin, sideLength, angle, expected) => {
    const out = createTriangle();
    expect(buildEquilateralInto(out, origin, sideLength, angle)).toBe(out);
    expectTriangle(out, expected);
  });

  test.each([
    [
      'NaN sideLength',
      Number.NaN,
      (out: TrianglePoints) => expect(Number.isNaN(out.b.x) && Number.isNaN(out.c.x)).toBe(true),
    ],
    [
      'Infinity sideLength',
      Number.POSITIVE_INFINITY,
      (out: TrianglePoints) => {
        expect(out.b.x).toBe(Number.POSITIVE_INFINITY);
        expect(out.c.y).toBe(Number.POSITIVE_INFINITY);
        expect(Number.isNaN(out.b.y)).toBe(true);
      },
    ],
    [
      '-Infinity sideLength',
      Number.NEGATIVE_INFINITY,
      (out: TrianglePoints) => {
        expect(out.b.x).toBe(Number.NEGATIVE_INFINITY);
        expect(out.c.y).toBe(Number.NEGATIVE_INFINITY);
        expect(Number.isNaN(out.b.y)).toBe(true);
      },
    ],
  ])('non-finite pass-through: %s', (_, sideLength, assert) => {
    const out = createTriangle();
    buildEquilateralInto(out, { x: 0, y: 0 }, sideLength);
    assert(out);
  });

  test('non-finite angle은 trig 결과를 그대로 기록한다', () => {
    const out = createTriangle();
    buildEquilateralInto(out, { x: 0, y: 0 }, 1, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.b.x)).toBe(true);
    expect(Number.isNaN(out.c.y)).toBe(true);
  });

  test('aliasing: origin이 out.b storage와 같아도 local-read 기준으로 기록한다', () => {
    const out = createTriangle();
    out.b.x = 3;
    out.b.y = 5;
    buildEquilateralInto(out, out.b, 2);
    expectTriangle(out, { a: { x: 3, y: 5 }, b: { x: 5, y: 5 }, c: { x: 4, y: 5 + SQRT3 } });
  });
});

describe('buildEquilateral', () => {
  test('새 TriangleWritable을 반환하고 각도 옵션을 적용한다', () => {
    expectTriangle(buildEquilateral({ x: 0, y: 0 }, 2), {
      a: { x: 0, y: 0 },
      b: { x: 2, y: 0 },
      c: { x: 1, y: SQRT3 },
    });
    expectXY(buildEquilateral({ x: 0, y: 0 }, 2, Math.PI / 2).b, 0, 2);
  });
});

describe('buildRightInto', () => {
  test.each([
    ['기본 angle 0', { x: 0, y: 0 }, 3, 4, undefined, { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } }],
    [
      'origin shift',
      { x: 10, y: 20 },
      3,
      4,
      undefined,
      { a: { x: 10, y: 20 }, b: { x: 13, y: 20 }, c: { x: 10, y: 24 } },
    ],
    ['angle = PI/2', { x: 0, y: 0 }, 3, 4, Math.PI / 2, { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: -4, y: 0 } }],
    ['width=0', { x: 0, y: 0 }, 0, 4, undefined, { a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, c: { x: 0, y: 4 } }],
    ['height=0', { x: 0, y: 0 }, 3, 0, undefined, { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 0 } }],
    ['width=0, height=0', { x: 5, y: 7 }, 0, 0, undefined, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } }],
    [
      'tuple XYInput origin',
      [1, 2] as const,
      3,
      4,
      undefined,
      { a: { x: 1, y: 2 }, b: { x: 4, y: 2 }, c: { x: 1, y: 6 } },
    ],
    [
      '음수 width/height',
      { x: 0, y: 0 },
      -1,
      -1,
      undefined,
      { a: { x: 0, y: 0 }, b: { x: -1, y: 0 }, c: { x: 0, y: -1 } },
    ],
  ])('%s', (_, origin, width, height, angle, expected) => {
    const out = createTriangle();
    expect(buildRightInto(out, origin, width, height, angle)).toBe(out);
    expectTriangle(out, expected);
  });

  test('non-finite 입력은 JS 산술 결과를 따른다', () => {
    const out = createTriangle();
    buildRightInto(out, { x: 0, y: 0 }, Number.NaN, 4);
    expect(Number.isNaN(out.b.x)).toBe(true);

    buildRightInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
    expect(out.b.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.c.y).toBe(Number.NEGATIVE_INFINITY);
    expect(Number.isNaN(out.b.y)).toBe(true);
    expect(Number.isNaN(out.c.x)).toBe(true);

    buildRightInto(out, { x: 0, y: 0 }, 1, 1, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.b.x)).toBe(true);
    expect(Number.isNaN(out.c.y)).toBe(true);
  });

  test('aliasing: origin이 out.b storage와 같아도 local-read 기준으로 기록한다', () => {
    const out = createTriangle();
    out.b.x = 7;
    out.b.y = 3;
    buildRightInto(out, out.b, 4, 5);
    expectTriangle(out, { a: { x: 7, y: 3 }, b: { x: 11, y: 3 }, c: { x: 7, y: 8 } });
  });
});

describe('buildRight', () => {
  test('새 TriangleWritable을 반환한다', () => {
    expect(buildRight({ x: 0, y: 0 }, 3, 4)).toEqual({ a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } });
  });
});
