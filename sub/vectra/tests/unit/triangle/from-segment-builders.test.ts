import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromSegmentApex } from '../../../src/triangle/from-segment-apex';
import { fromSegmentApexInto } from '../../../src/triangle/from-segment-apex-into';
import { fromSegmentHeight } from '../../../src/triangle/from-segment-height';
import { fromSegmentHeightInto } from '../../../src/triangle/from-segment-height-into';
import { expectTriangle, expectXY, SENTINEL, setTriangle, type TrianglePoints } from './builders.helpers';

describe('fromSegmentApexInto / fromSegmentApex', () => {
  test.each([
    [
      'object segment와 object apex',
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      { x: 2, y: 3 },
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } },
    ],
    [
      'zero-length base',
      { a: { x: 1, y: 1 }, b: { x: 1, y: 1 } },
      { x: 5, y: 5 },
      { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 5, y: 5 } },
    ],
    [
      'tuple SegmentLike와 tuple XYInput',
      [
        [0, 0],
        [4, 0],
      ] as const,
      [2, 3] as const,
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } },
    ],
  ])('%s', (_, base, apex, expected) => {
    const out = createTriangle();
    expect(fromSegmentApexInto(out, base, apex)).toBe(out);
    expect(out).toEqual(expected);
  });

  test.each([
    [
      'apex가 out.a storage',
      (out: TrianglePoints) => {
        out.a.x = 9;
        out.a.y = 9;
        return {
          base: { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
          apex: out.a,
          expected: { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 9, y: 9 } },
        };
      },
    ],
    [
      'apex가 out.b storage',
      (out: TrianglePoints) => {
        out.b.x = 7;
        out.b.y = 7;
        return {
          base: { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
          apex: out.b,
          expected: { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 7, y: 7 } },
        };
      },
    ],
    [
      'base.b가 out.a storage',
      (out: TrianglePoints) => {
        out.a.x = 9;
        out.a.y = 8;
        return {
          base: { a: { x: 0, y: 1 }, b: out.a },
          apex: { x: 5, y: 5 },
          expected: { a: { x: 0, y: 1 }, b: { x: 9, y: 8 }, c: { x: 5, y: 5 } },
        };
      },
    ],
  ])('aliasing: %s', (_, setup) => {
    const out = createTriangle();
    const { base, apex, expected } = setup(out);
    fromSegmentApexInto(out, base, apex);
    expect(out).toEqual(expected);
  });

  test('non-finite 좌표는 그대로 기록된다', () => {
    const out = createTriangle();
    fromSegmentApexInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, { x: Number.NaN, y: 0 });
    expect(Number.isNaN(out.c.x)).toBe(true);

    fromSegmentApexInto(
      out,
      { a: { x: Number.POSITIVE_INFINITY, y: 0 }, b: { x: 4, y: Number.NEGATIVE_INFINITY } },
      { x: 0, y: 0 }
    );
    expect(out.a.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.b.y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('allocating companion은 새 TriangleWritable을 반환한다', () => {
    expect(fromSegmentApex({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, { x: 2, y: 3 })).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 2, y: 3 },
    });
  });
});

describe('fromSegmentHeightInto / fromSegmentHeight', () => {
  test.each([
    [
      '기본 left side',
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      3,
      undefined,
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } },
    ],
    [
      "side: 'right'",
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      3,
      { side: 'right' as const },
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: -3 } },
    ],
    [
      'negative height',
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      -3,
      undefined,
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: -3 } },
    ],
    [
      '수직 base와 left side',
      { a: { x: 0, y: 0 }, b: { x: 0, y: 4 } },
      3,
      undefined,
      { a: { x: 0, y: 0 }, b: { x: 0, y: 4 }, c: { x: -3, y: 2 } },
    ],
    [
      'tuple SegmentLike',
      [
        [0, 0],
        [4, 0],
      ] as const,
      3,
      undefined,
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } },
    ],
  ])('%s', (_, base, height, options, expected) => {
    const out = createTriangle();
    expect(fromSegmentHeightInto(out, base, height, options)).toBe(out);
    expectTriangle(out, expected);
  });

  test.each([
    ['zero-length base', { a: { x: 5, y: 5 }, b: { x: 5, y: 5 } }],
    ['NaN base 좌표', { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 } }],
    ['Infinity base 좌표', { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 } }],
    ['-Infinity base 좌표', { a: { x: 0, y: Number.NEGATIVE_INFINITY }, b: { x: 4, y: 0 } }],
  ])('%s: false를 반환하고 out을 수정하지 않는다', (_, base) => {
    const out = createTriangle();
    setTriangle(out);
    expect(fromSegmentHeightInto(out, base, 3)).toBe(false);
    expect(out).toEqual(SENTINEL);
  });

  test('non-finite height는 성공 분기에서 그대로 기록된다', () => {
    const out = createTriangle();
    expect(fromSegmentHeightInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, Number.NaN)).toBe(out);
    expectXY(out.a, 0, 0);
    expectXY(out.b, 4, 0);
    expect(Number.isNaN(out.c.x) && Number.isNaN(out.c.y)).toBe(true);

    expect(fromSegmentHeightInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, Number.POSITIVE_INFINITY)).toBe(out);
    expect(Number.isNaN(out.c.x)).toBe(true);
    expect(out.c.y).toBe(Number.POSITIVE_INFINITY);
  });

  test('isosceles와 allocating companion 계약을 지킨다', () => {
    const out = createTriangle();
    fromSegmentHeightInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 3);
    expect(Math.hypot(out.c.x - out.a.x, out.c.y - out.a.y)).toBeCloseTo(
      Math.hypot(out.c.x - out.b.x, out.c.y - out.b.y),
      12
    );

    expect(fromSegmentHeight({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 3)).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 2, y: 3 },
    });
    expect(fromSegmentHeight({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 3, { side: 'right' })).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 2, y: -3 },
    });
  });

  test.each([
    ['zero-length base', { a: { x: 5, y: 5 }, b: { x: 5, y: 5 } }],
    ['NaN base 좌표', { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 } }],
    ['Infinity base 좌표', { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 } }],
  ])('%s는 undefined를 반환한다', (_, base) => {
    expect(fromSegmentHeight(base, 3)).toBeUndefined();
  });
});
