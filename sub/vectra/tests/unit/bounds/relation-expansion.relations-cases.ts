import { describe, expect, test } from 'vitest';
import { containsBounds } from '../../../src/bounds/contains-bounds';
import { containsPoint } from '../../../src/bounds/contains-point';
import { intersectionInto } from '../../../src/bounds/intersection-into';
import type { BoundsWritable } from '../../../src/types';
import { makeBounds, sentinel } from './relation-expansion.helpers';

// ---------------------------------------------------------------------------
// containsPoint
// ---------------------------------------------------------------------------
describe('bounds - containsPoint (closed boundary)', () => {
  test('내부 점은 true를 반환한다', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 3, y: 3 })).toBe(true);
  });

  test('min corner(경계)는 포함한다 - true', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 0, y: 0 })).toBe(true);
  });

  test('max corner(경계)는 포함한다 - true', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 5, y: 5 })).toBe(true);
  });

  test('left edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 0, y: 3 })).toBe(true);
  });

  test('right edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 5, y: 3 })).toBe(true);
  });

  test('top edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 3, y: 0 })).toBe(true);
  });

  test('bottom edge(경계) 위 점은 포함한다 - true', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 3, y: 5 })).toBe(true);
  });

  test('경계 밖 점은 false를 반환한다', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 6, y: 3 })).toBe(false);
  });

  test('x만 밖에 있는 점은 false를 반환한다', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: -1, y: 3 })).toBe(false);
  });

  test('y만 밖에 있는 점은 false를 반환한다', () => {
    expect(containsPoint({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { x: 3, y: -1 })).toBe(false);
  });

  test('empty bounds(inverted)는 항상 false를 반환한다', () => {
    expect(containsPoint({ min: { x: 5, y: 0 }, max: { x: 0, y: 5 } }, { x: 3, y: 3 })).toBe(false);
  });

  test('sentinel bounds는 항상 false를 반환한다', () => {
    expect(containsPoint(sentinel(), { x: 0, y: 0 })).toBe(false);
  });

  test('tuple point 입력도 처리한다 - 내부', () => {
    expect(containsPoint({ min: [0, 0], max: [5, 5] }, [3, 3])).toBe(true);
  });

  test('tuple point 입력도 처리한다 - 경계', () => {
    expect(containsPoint({ min: [0, 0], max: [5, 5] }, [0, 0])).toBe(true);
  });

  test('tuple point 입력도 처리한다 - 외부', () => {
    expect(containsPoint({ min: [0, 0], max: [5, 5] }, [6, 3])).toBe(false);
  });

  test('point bounds(min === max)는 정확히 그 점을 포함한다', () => {
    expect(containsPoint({ min: { x: 3, y: 3 }, max: { x: 3, y: 3 } }, { x: 3, y: 3 })).toBe(true);
  });

  test('point bounds(min === max)는 다른 점을 포함하지 않는다', () => {
    expect(containsPoint({ min: { x: 3, y: 3 }, max: { x: 3, y: 3 } }, { x: 3, y: 4 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// containsBounds
// ---------------------------------------------------------------------------
describe('bounds - containsBounds (closed boundary)', () => {
  test('자기 자신을 포함한다 - true', () => {
    const b = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    expect(containsBounds(b, b)).toBe(true);
  });

  test('내부에 완전히 포함된 bounds는 true', () => {
    expect(
      containsBounds({ min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, { min: { x: 2, y: 2 }, max: { x: 8, y: 8 } })
    ).toBe(true);
  });

  test('edge가 일치하는 bounds는 포함한다 - true', () => {
    expect(
      containsBounds({ min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, { min: { x: 0, y: 2 }, max: { x: 10, y: 8 } })
    ).toBe(true);
  });

  test('other의 min이 밖에 있으면 false', () => {
    expect(
      containsBounds({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { min: { x: -1, y: 0 }, max: { x: 4, y: 4 } })
    ).toBe(false);
  });

  test('other의 max가 밖에 있으면 false', () => {
    expect(
      containsBounds({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { min: { x: 1, y: 1 }, max: { x: 6, y: 4 } })
    ).toBe(false);
  });

  test('other가 empty이면 항상 true', () => {
    const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const empty = { min: { x: 5, y: 0 }, max: { x: 0, y: 5 } };
    expect(containsBounds(bounds, empty)).toBe(true);
  });

  test('other가 sentinel이면 true', () => {
    const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    expect(containsBounds(bounds, sentinel())).toBe(true);
  });

  test('bounds가 empty이고 other가 non-empty이면 false', () => {
    const empty = { min: { x: 5, y: 0 }, max: { x: 0, y: 5 } };
    const other = { min: { x: 0, y: 0 }, max: { x: 3, y: 3 } };
    expect(containsBounds(empty, other)).toBe(false);
  });

  test('bounds와 other 둘 다 empty이면 true', () => {
    const emptyA = { min: { x: 5, y: 0 }, max: { x: 0, y: 5 } };
    const emptyB = { min: { x: 3, y: 0 }, max: { x: 0, y: 3 } };
    expect(containsBounds(emptyA, emptyB)).toBe(true);
  });

  test('line bounds가 line bounds를 포함한다 (같은 라인)', () => {
    expect(
      containsBounds({ min: { x: 0, y: 0 }, max: { x: 10, y: 0 } }, { min: { x: 2, y: 0 }, max: { x: 8, y: 0 } })
    ).toBe(true);
  });

  test('tuple min/max bounds도 처리한다', () => {
    expect(containsBounds({ min: [0, 0], max: [10, 10] }, { min: [2, 2], max: [8, 8] })).toBe(true);
  });

  test('tuple shorthand BoundsLike도 처리한다', () => {
    expect(
      containsBounds(
        [
          [0, 0],
          [10, 10],
        ],
        [
          [2, 2],
          [8, 8],
        ]
      )
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// intersectionInto
// ---------------------------------------------------------------------------
describe('bounds - intersectionInto', () => {
  test('양수 area 겹침: 교차 bounds를 기록하고 true를 반환한다', () => {
    const out = makeBounds();
    const a = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const b = { min: { x: 3, y: 2 }, max: { x: 8, y: 7 } };
    expect(intersectionInto(out, a, b)).toBe(true);
    expect(out.min).toEqual({ x: 3, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 5 });
  });

  test('edge touch: out을 수정하지 않고 false를 반환한다 (closed boundary != object intersection)', () => {
    const out = makeBounds();
    out.min.x = 99;
    out.min.y = 99;
    const a = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const b = { min: { x: 5, y: 0 }, max: { x: 8, y: 5 } };
    expect(intersectionInto(out, a, b)).toBe(false);
    // out이 수정되지 않아야 한다
    expect(out.min.x).toBe(99);
  });

  test('corner-only 접촉: out을 수정하지 않고 false를 반환한다', () => {
    const out = makeBounds();
    out.min.x = 99;
    const a = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const b = { min: { x: 5, y: 5 }, max: { x: 8, y: 8 } };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.min.x).toBe(99);
  });

  test('disjoint: out을 수정하지 않고 false를 반환한다', () => {
    const out = makeBounds();
    out.min.x = 99;
    const a = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const b = { min: { x: 7, y: 7 }, max: { x: 10, y: 10 } };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.min.x).toBe(99);
  });

  test('한쪽이 empty: out을 수정하지 않고 false를 반환한다', () => {
    const out = makeBounds();
    out.min.x = 99;
    const empty = sentinel();
    const b = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    expect(intersectionInto(out, empty, b)).toBe(false);
    expect(out.min.x).toBe(99);
  });

  test('out === a aliasing: 양수 area 겹침에서도 정확하게 기록한다', () => {
    const a: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const b = { min: { x: 3, y: 2 }, max: { x: 8, y: 7 } };
    expect(intersectionInto(a, a, b)).toBe(true);
    expect(a.min).toEqual({ x: 3, y: 2 });
    expect(a.max).toEqual({ x: 5, y: 5 });
  });

  test('out === b aliasing: 양수 area 겹침에서도 정확하게 기록한다', () => {
    const a = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const b: BoundsWritable = { min: { x: 3, y: 2 }, max: { x: 8, y: 7 } };
    expect(intersectionInto(b, a, b)).toBe(true);
    expect(b.min).toEqual({ x: 3, y: 2 });
    expect(b.max).toEqual({ x: 5, y: 5 });
  });

  test('line bounds 간 정상 overlap도 area=0이면 false를 반환한다', () => {
    const out = makeBounds();
    out.min.x = 99;
    // 두 line bounds가 같은 수평선 위에서 겹침 → area=0
    const a = { min: { x: 0, y: 0 }, max: { x: 5, y: 0 } };
    const b = { min: { x: 3, y: 0 }, max: { x: 8, y: 0 } };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.min.x).toBe(99);
  });

  test('tuple min/max 입력도 처리한다', () => {
    const out = makeBounds();
    const a = { min: [0, 0] as const, max: [5, 5] as const };
    const b = { min: [3, 2] as const, max: [8, 7] as const };
    expect(intersectionInto(out, a, b)).toBe(true);
    expect(out.min).toEqual({ x: 3, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 5 });
  });
});
