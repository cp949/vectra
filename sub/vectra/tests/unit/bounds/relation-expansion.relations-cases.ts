/** 경계 상자의 점·상자 포함과 교집합 시험을 relation-expansion.test.ts에 제공한다. */

import { describe, expect, test } from 'vitest';
import { containsBounds } from '../../../src/bounds/contains-bounds';
import { containsPoint } from '../../../src/bounds/contains-point';
import { createBounds } from '../../../src/bounds/create-bounds';
import { intersectionInto } from '../../../src/bounds/intersection-into';

import type { BoundsWritable } from '../../../src/types/flat-shapes.internal';
import { sentinel } from './relation-expansion.helpers';

// ---------------------------------------------------------------------------
// containsPoint
// ---------------------------------------------------------------------------
describe('bounds - containsPoint (closed boundary)', () => {
  test('내부 점은 true를 반환한다', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 3, y: 3 })).toBe(true);
  });

  test('min corner(경계)는 포함한다 - true', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 0, y: 0 })).toBe(true);
  });

  test('max corner(경계)는 포함한다 - true', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 5, y: 5 })).toBe(true);
  });

  test('left edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 0, y: 3 })).toBe(true);
  });

  test('right edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 5, y: 3 })).toBe(true);
  });

  test('top edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 3, y: 0 })).toBe(true);
  });

  test('bottom edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 3, y: 5 })).toBe(true);
  });

  test('경계 밖 점은 false를 반환한다', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 6, y: 3 })).toBe(false);
  });

  test('x만 밖에 있는 점은 false를 반환한다', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: -1, y: 3 })).toBe(false);
  });

  test('y만 밖에 있는 점은 false를 반환한다', () => {
    expect(containsPoint({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { x: 3, y: -1 })).toBe(false);
  });

  test('empty bounds(inverted)는 항상 false를 반환한다', () => {
    expect(containsPoint({ minX: 5, minY: 0, maxX: 0, maxY: 5 }, { x: 3, y: 3 })).toBe(false);
  });

  test('sentinel bounds는 항상 false를 반환한다', () => {
    expect(containsPoint(sentinel(), { x: 0, y: 0 })).toBe(false);
  });

  test('point bounds(min === max)는 정확히 그 점을 포함한다', () => {
    expect(containsPoint({ minX: 3, minY: 3, maxX: 3, maxY: 3 }, { x: 3, y: 3 })).toBe(true);
  });

  test('point bounds(min === max)는 다른 점을 포함하지 않는다', () => {
    expect(containsPoint({ minX: 3, minY: 3, maxX: 3, maxY: 3 }, { x: 3, y: 4 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// containsBounds
// ---------------------------------------------------------------------------
describe('bounds - containsBounds (closed boundary)', () => {
  test('자기 자신을 포함한다 - true', () => {
    const b = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    expect(containsBounds(b, b)).toBe(true);
  });

  test('내부에 완전히 포함된 bounds는 true', () => {
    expect(containsBounds({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, { minX: 2, minY: 2, maxX: 8, maxY: 8 })).toBe(true);
  });

  test('edge가 일치하는 bounds는 포함한다 - true', () => {
    expect(containsBounds({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, { minX: 0, minY: 2, maxX: 10, maxY: 8 })).toBe(
      true
    );
  });

  test('other의 min이 밖에 있으면 false', () => {
    expect(containsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: -1, minY: 0, maxX: 4, maxY: 4 })).toBe(false);
  });

  test('other의 max가 밖에 있으면 false', () => {
    expect(containsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 1, minY: 1, maxX: 6, maxY: 4 })).toBe(false);
  });

  test('other가 empty이면 항상 true', () => {
    const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const empty = { minX: 5, minY: 0, maxX: 0, maxY: 5 };
    expect(containsBounds(bounds, empty)).toBe(true);
  });

  test('other가 sentinel이면 true', () => {
    const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    expect(containsBounds(bounds, sentinel())).toBe(true);
  });

  test('bounds가 empty이고 other가 non-empty이면 false', () => {
    const empty = { minX: 5, minY: 0, maxX: 0, maxY: 5 };
    const other = { minX: 0, minY: 0, maxX: 3, maxY: 3 };
    expect(containsBounds(empty, other)).toBe(false);
  });

  test('bounds와 other 둘 다 empty이면 true', () => {
    const emptyA = { minX: 5, minY: 0, maxX: 0, maxY: 5 };
    const emptyB = { minX: 3, minY: 0, maxX: 0, maxY: 3 };
    expect(containsBounds(emptyA, emptyB)).toBe(true);
  });

  test('line bounds가 line bounds를 포함한다 (같은 라인)', () => {
    expect(containsBounds({ minX: 0, minY: 0, maxX: 10, maxY: 0 }, { minX: 2, minY: 0, maxX: 8, maxY: 0 })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// intersectionInto
// ---------------------------------------------------------------------------
describe('bounds - intersectionInto', () => {
  test('양수 area 겹침: 교차 bounds를 기록하고 true를 반환한다', () => {
    const out = createBounds();
    const a = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const b = { minX: 3, minY: 2, maxX: 8, maxY: 7 };
    expect(intersectionInto(out, a, b)).toBe(true);
    expect(out).toEqual({ minX: 3, minY: 2, maxX: 5, maxY: 5 });
  });

  test('edge touch: out을 수정하지 않고 false를 반환한다 (closed boundary != object intersection)', () => {
    const out = createBounds();
    out.minX = 99;
    out.minY = 99;
    const a = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const b = { minX: 5, minY: 0, maxX: 8, maxY: 5 };
    expect(intersectionInto(out, a, b)).toBe(false);
    // out이 수정되지 않아야 한다
    expect(out.minX).toBe(99);
  });

  test('corner-only 접촉: out을 수정하지 않고 false를 반환한다', () => {
    const out = createBounds();
    out.minX = 99;
    const a = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const b = { minX: 5, minY: 5, maxX: 8, maxY: 8 };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.minX).toBe(99);
  });

  test('disjoint: out을 수정하지 않고 false를 반환한다', () => {
    const out = createBounds();
    out.minX = 99;
    const a = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const b = { minX: 7, minY: 7, maxX: 10, maxY: 10 };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.minX).toBe(99);
  });

  test('한쪽이 empty: out을 수정하지 않고 false를 반환한다', () => {
    const out = createBounds();
    out.minX = 99;
    const empty = sentinel();
    const b = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    expect(intersectionInto(out, empty, b)).toBe(false);
    expect(out.minX).toBe(99);
  });

  test('out === a aliasing: 양수 area 겹침에서도 정확하게 기록한다', () => {
    const a: BoundsWritable = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const b = { minX: 3, minY: 2, maxX: 8, maxY: 7 };
    expect(intersectionInto(a, a, b)).toBe(true);
    expect(a).toEqual({ minX: 3, minY: 2, maxX: 5, maxY: 5 });
  });

  test('out === b aliasing: 양수 area 겹침에서도 정확하게 기록한다', () => {
    const a = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const b: BoundsWritable = { minX: 3, minY: 2, maxX: 8, maxY: 7 };
    expect(intersectionInto(b, a, b)).toBe(true);
    expect(b).toEqual({ minX: 3, minY: 2, maxX: 5, maxY: 5 });
  });

  test('line bounds 간 정상 overlap도 area=0이면 false를 반환한다', () => {
    const out = createBounds();
    out.minX = 99;
    // 두 line bounds가 같은 수평선 위에서 겹침 → area=0
    const a = { minX: 0, minY: 0, maxX: 5, maxY: 0 };
    const b = { minX: 3, minY: 0, maxX: 8, maxY: 0 };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.minX).toBe(99);
  });
});
