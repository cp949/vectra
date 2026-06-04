import { describe, expect, test } from 'vitest';
import { emptyInto } from '../../../src/bounds/empty-into';
import { intersectsBoundsBounds } from '../../../src/intersects/intersects-bounds-bounds';
import type { BoundsWritable } from '../../../src/types';

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

function sentinel(): BoundsWritable {
  const out = makeBounds();
  emptyInto(out);
  return out;
}

describe('bounds - intersectsBounds (closed boundary, edge touch = true)', () => {
  test('겹치는 두 bounds는 true', () => {
    expect(
      intersectsBoundsBounds({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { min: { x: 3, y: 3 }, max: { x: 8, y: 8 } })
    ).toBe(true);
  });

  test('edge 전체가 접하는 경우는 true (closed boundary)', () => {
    expect(
      intersectsBoundsBounds({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { min: { x: 5, y: 0 }, max: { x: 8, y: 5 } })
    ).toBe(true);
  });

  test('corner만 접하는 경우도 true (closed boundary)', () => {
    expect(
      intersectsBoundsBounds({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { min: { x: 5, y: 5 }, max: { x: 8, y: 8 } })
    ).toBe(true);
  });

  test('disjoint bounds는 false', () => {
    expect(
      intersectsBoundsBounds(
        { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } },
        { min: { x: 6, y: 6 }, max: { x: 10, y: 10 } }
      )
    ).toBe(false);
  });

  test('x축 disjoint는 false', () => {
    expect(
      intersectsBoundsBounds(
        { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } },
        { min: { x: 7, y: 0 }, max: { x: 10, y: 5 } }
      )
    ).toBe(false);
  });

  test('y축 disjoint는 false', () => {
    expect(
      intersectsBoundsBounds(
        { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } },
        { min: { x: 0, y: 7 }, max: { x: 5, y: 10 } }
      )
    ).toBe(false);
  });

  test('한쪽이 empty이면 false', () => {
    expect(
      intersectsBoundsBounds({ min: { x: 5, y: 0 }, max: { x: 0, y: 5 } }, { min: { x: 0, y: 0 }, max: { x: 8, y: 8 } })
    ).toBe(false);
  });

  test('둘 다 empty이면 false', () => {
    expect(intersectsBoundsBounds(sentinel(), sentinel())).toBe(false);
  });

  test('line bounds 간 corner 접촉도 true (closed boundary)', () => {
    expect(
      intersectsBoundsBounds({ min: { x: 0, y: 0 }, max: { x: 5, y: 0 } }, { min: { x: 5, y: 0 }, max: { x: 8, y: 3 } })
    ).toBe(true);
  });

  test('포함 관계인 두 bounds는 true', () => {
    expect(
      intersectsBoundsBounds(
        { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
        { min: { x: 2, y: 2 }, max: { x: 8, y: 8 } }
      )
    ).toBe(true);
  });

  test('tuple min/max 입력도 처리한다', () => {
    expect(intersectsBoundsBounds({ min: [0, 0], max: [5, 5] }, { min: [3, 3], max: [8, 8] })).toBe(true);
  });

  test('tuple shorthand BoundsLike 입력도 처리한다', () => {
    expect(
      intersectsBoundsBounds(
        [
          [0, 0],
          [5, 5],
        ],
        [
          [3, 3],
          [8, 8],
        ]
      )
    ).toBe(true);
  });
});
