import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromRect } from '../../../src/triangle/from-rect';
import { fromRectInto } from '../../../src/triangle/from-rect-into';
import { expectTriangle } from './builders.helpers';

describe('fromRectInto / fromRect', () => {
  test.each([
    ['object rect', { x: 1, y: 2, width: 3, height: 4 }, { a: { x: 1, y: 2 }, b: { x: 4, y: 2 }, c: { x: 1, y: 6 } }],
    ['tuple rect', [1, 2, 3, 4] as const, { a: { x: 1, y: 2 }, b: { x: 4, y: 2 }, c: { x: 1, y: 6 } }],
    ['width=0', { x: 5, y: 7, width: 0, height: 4 }, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 11 } }],
    ['height=0', { x: 5, y: 7, width: 3, height: 0 }, { a: { x: 5, y: 7 }, b: { x: 8, y: 7 }, c: { x: 5, y: 7 } }],
    [
      'width=0, height=0',
      { x: 5, y: 7, width: 0, height: 0 },
      { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } },
    ],
    [
      '음수 width/height',
      { x: 0, y: 0, width: -3, height: -4 },
      { a: { x: 0, y: 0 }, b: { x: -3, y: 0 }, c: { x: 0, y: -4 } },
    ],
  ])('%s', (_, rect, expected) => {
    const out = createTriangle();
    expect(fromRectInto(out, rect)).toBe(out);
    expectTriangle(out, expected);
  });

  test('non-finite component는 JS 산술 결과를 따른다', () => {
    const out = createTriangle();
    fromRectInto(out, { x: Number.NaN, y: 0, width: 3, height: 4 });
    expect(Number.isNaN(out.a.x) && Number.isNaN(out.b.x) && Number.isNaN(out.c.x)).toBe(true);

    fromRectInto(out, { x: 0, y: 0, width: Number.POSITIVE_INFINITY, height: Number.NEGATIVE_INFINITY });
    expect(out.b.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.c.y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('allocating companion은 object/tuple rect 좌표 정의를 따른다', () => {
    const expected = { a: { x: 1, y: 2 }, b: { x: 4, y: 2 }, c: { x: 1, y: 6 } };
    expect(fromRect({ x: 1, y: 2, width: 3, height: 4 })).toEqual(expected);
    expect(fromRect([1, 2, 3, 4] as const)).toEqual(expected);
  });
});
