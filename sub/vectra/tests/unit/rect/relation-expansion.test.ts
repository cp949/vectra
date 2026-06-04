import { describe, expect, test } from 'vitest';
import { containsPoint } from '../../../src/rect/contains-point';
import { containsRect } from '../../../src/rect/contains-rect';
import { expandToIncludePointInto } from '../../../src/rect/expand-to-include-point-into';
import { expandToIncludeRectInto } from '../../../src/rect/expand-to-include-rect-into';
import { inflateInto } from '../../../src/rect/inflate-into';
import { intersectionInto } from '../../../src/rect/intersection-into';
import { scaleInto } from '../../../src/rect/scale-into';
import { translateInto } from '../../../src/rect/translate-into';
import { unionInto } from '../../../src/rect/union-into';
import type { RectWritable } from '../../../src/types';

function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

// ---------------------------------------------------------------------------
// containsPoint
// ---------------------------------------------------------------------------
describe('rect - containsPoint (closed boundary)', () => {
  test('내부 점은 true를 반환한다', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5 })).toBe(true);
  });

  test('tuple rect의 내부 점은 true를 반환한다', () => {
    expect(containsPoint([0, 0, 10, 10], { x: 5, y: 5 })).toBe(true);
  });

  test('left edge 위 점은 포함한다 - true', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 5 })).toBe(true);
  });

  test('right edge 위 점은 포함한다 - true', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 5 })).toBe(true);
  });

  test('top edge 위 점은 포함한다 - true', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 0 })).toBe(true);
  });

  test('bottom edge 위 점은 포함한다 - true', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 10 })).toBe(true);
  });

  test('topLeft corner는 포함한다 - true', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 0 })).toBe(true);
  });

  test('bottomRight corner는 포함한다 - true', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 10 })).toBe(true);
  });

  test('경계 밖 점은 false를 반환한다', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 11, y: 5 })).toBe(false);
  });

  test('x만 밖에 있는 점은 false를 반환한다', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: -1, y: 5 })).toBe(false);
  });

  test('y만 밖에 있는 점은 false를 반환한다', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: -1 })).toBe(false);
  });

  test('empty rect는 항상 false를 반환한다 (width === 0)', () => {
    expect(containsPoint({ x: 0, y: 0, width: 0, height: 10 }, { x: 0, y: 5 })).toBe(false);
  });

  test('empty rect는 항상 false를 반환한다 (height === 0)', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 0 }, { x: 5, y: 0 })).toBe(false);
  });

  test('음수 origin rect의 내부 점을 포함한다', () => {
    expect(containsPoint({ x: -5, y: -5, width: 10, height: 10 }, { x: 0, y: 0 })).toBe(true);
  });

  test('tuple point 입력도 처리한다', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, [5, 5])).toBe(true);
  });

  test('tuple point - 경계 위 점도 처리한다', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, [10, 10])).toBe(true);
  });

  test('tuple point - 경계 밖 점도 처리한다', () => {
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, [11, 5])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// containsRect
// ---------------------------------------------------------------------------
describe('rect - containsRect (closed boundary)', () => {
  test('자기 자신을 포함한다 - true', () => {
    const r = { x: 0, y: 0, width: 10, height: 10 };
    expect(containsRect(r, r)).toBe(true);
  });

  test('내부에 완전히 포함된 rect는 true', () => {
    expect(containsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 2, y: 2, width: 6, height: 6 })).toBe(true);
  });

  test('tuple rect와 tuple other의 포함 관계를 처리한다', () => {
    expect(containsRect([0, 0, 10, 10], [2, 2, 6, 6])).toBe(true);
  });

  test('edge가 일치하는 rect는 포함한다 - true', () => {
    expect(containsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 2, width: 10, height: 6 })).toBe(true);
  });

  test('other의 right가 밖에 있으면 false', () => {
    expect(containsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 0, width: 8, height: 10 })).toBe(false);
  });

  test('other의 x가 밖에 있으면 false', () => {
    expect(containsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: -1, y: 0, width: 5, height: 10 })).toBe(false);
  });

  test('other가 empty이면 항상 true', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    const empty = { x: 5, y: 5, width: 0, height: 5 };
    expect(containsRect(rect, empty)).toBe(true);
  });

  test('rect가 empty이고 other가 non-empty이면 false', () => {
    const empty = { x: 0, y: 0, width: 0, height: 10 };
    const other = { x: 0, y: 0, width: 5, height: 5 };
    expect(containsRect(empty, other)).toBe(false);
  });

  test('둘 다 empty이면 true', () => {
    const emptyA = { x: 0, y: 0, width: 0, height: 10 };
    const emptyB = { x: 0, y: 0, width: 5, height: 0 };
    expect(containsRect(emptyA, emptyB)).toBe(true);
  });

  test('rect의 우측 절반과 같은 edge-coincident rect도 포함한다 - true', () => {
    expect(containsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 0, width: 5, height: 10 })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// intersectionInto
// ---------------------------------------------------------------------------
describe('rect - intersectionInto', () => {
  test('양수 area 겹침: 교차 rect를 기록하고 true를 반환한다', () => {
    const out = makeRect();
    const a = { x: 0, y: 0, width: 5, height: 5 };
    const b = { x: 3, y: 2, width: 5, height: 5 };
    expect(intersectionInto(out, a, b)).toBe(true);
    expect(out).toEqual({ x: 3, y: 2, width: 2, height: 3 });
  });

  test('edge touch: out을 수정하지 않고 false를 반환한다 (closed boundary != object intersection)', () => {
    const out = makeRect();
    out.x = 99;
    const a = { x: 0, y: 0, width: 5, height: 5 };
    const b = { x: 5, y: 0, width: 3, height: 5 };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('corner-only 접촉: out을 수정하지 않고 false를 반환한다', () => {
    const out = makeRect();
    out.x = 99;
    const a = { x: 0, y: 0, width: 5, height: 5 };
    const b = { x: 5, y: 5, width: 3, height: 3 };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('disjoint: out을 수정하지 않고 false를 반환한다', () => {
    const out = makeRect();
    out.x = 99;
    const a = { x: 0, y: 0, width: 5, height: 5 };
    const b = { x: 7, y: 7, width: 3, height: 3 };
    expect(intersectionInto(out, a, b)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('한쪽이 empty: out을 수정하지 않고 false를 반환한다', () => {
    const out = makeRect();
    out.x = 99;
    const empty = { x: 0, y: 0, width: 0, height: 5 };
    const b = { x: 0, y: 0, width: 5, height: 5 };
    expect(intersectionInto(out, empty, b)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('out === a aliasing: 양수 area 겹침에서도 정확하게 기록한다', () => {
    const a: RectWritable = { x: 0, y: 0, width: 5, height: 5 };
    const b = { x: 3, y: 2, width: 5, height: 5 };
    expect(intersectionInto(a, a, b)).toBe(true);
    expect(a).toEqual({ x: 3, y: 2, width: 2, height: 3 });
  });

  test('out === b aliasing: 양수 area 겹침에서도 정확하게 기록한다', () => {
    const a = { x: 0, y: 0, width: 5, height: 5 };
    const b: RectWritable = { x: 3, y: 2, width: 5, height: 5 };
    expect(intersectionInto(b, a, b)).toBe(true);
    expect(b).toEqual({ x: 3, y: 2, width: 2, height: 3 });
  });
});

// ---------------------------------------------------------------------------
// unionInto
// ---------------------------------------------------------------------------
describe('rect - unionInto', () => {
  test('두 non-empty rect의 union을 기록한다', () => {
    const out = makeRect();
    const a = { x: 0, y: 1, width: 4, height: 4 };
    const b = { x: 2, y: 0, width: 4, height: 5 };
    const result = unionInto(out, a, b);
    expect(out).toEqual({ x: 0, y: 0, width: 6, height: 5 });
    expect(result).toBe(out);
  });

  test('tuple rect union을 기록한다', () => {
    const out = makeRect();
    unionInto(out, [0, 1, 4, 4], [2, 0, 4, 5]);
    expect(out).toEqual({ x: 0, y: 0, width: 6, height: 5 });
  });

  test('b가 empty이면 a를 복사한다', () => {
    const out = makeRect();
    const a = { x: 1, y: 2, width: 5, height: 4 };
    const b = { x: 0, y: 0, width: 0, height: 5 };
    unionInto(out, a, b);
    expect(out).toEqual({ x: 1, y: 2, width: 5, height: 4 });
  });

  test('a가 empty이면 b를 복사한다', () => {
    const out = makeRect();
    const a = { x: 0, y: 0, width: 0, height: 5 };
    const b = { x: 1, y: 2, width: 5, height: 4 };
    unionInto(out, a, b);
    expect(out).toEqual({ x: 1, y: 2, width: 5, height: 4 });
  });

  test('둘 다 empty이면 a를 그대로 복사한다', () => {
    const out = makeRect();
    const a = { x: 3, y: 3, width: 0, height: 0 };
    const b = { x: 5, y: 5, width: -1, height: -1 };
    unionInto(out, a, b);
    expect(out).toEqual({ x: 3, y: 3, width: 0, height: 0 });
  });

  test('out === a aliasing: union이 정확하게 기록된다', () => {
    const a: RectWritable = { x: 0, y: 1, width: 4, height: 4 };
    const b = { x: 2, y: 0, width: 4, height: 5 };
    unionInto(a, a, b);
    expect(a).toEqual({ x: 0, y: 0, width: 6, height: 5 });
  });

  test('out === b aliasing: union이 정확하게 기록된다', () => {
    const a = { x: 0, y: 1, width: 4, height: 4 };
    const b: RectWritable = { x: 2, y: 0, width: 4, height: 5 };
    unionInto(b, a, b);
    expect(b).toEqual({ x: 0, y: 0, width: 6, height: 5 });
  });

  test('line rect(width=0)는 empty로 처리되어 non-empty 쪽을 복사한다', () => {
    const out = makeRect();
    const a = { x: 0, y: 0, width: 0, height: 5 };
    const b = { x: 2, y: 2, width: 3, height: 3 };
    unionInto(out, a, b);
    expect(out).toEqual({ x: 2, y: 2, width: 3, height: 3 });
  });

  test('negative-dim rect는 empty로 처리된다', () => {
    const out = makeRect();
    const a = { x: 0, y: 0, width: 5, height: 5 };
    const b = { x: 10, y: 10, width: -3, height: -3 };
    unionInto(out, a, b);
    expect(out).toEqual({ x: 0, y: 0, width: 5, height: 5 });
  });
});

// ---------------------------------------------------------------------------
// translateInto
// ---------------------------------------------------------------------------
describe('rect - translateInto', () => {
  test('양수 offset으로 rect를 이동한다', () => {
    const out = makeRect();
    const result = translateInto(out, { x: 1, y: 2, width: 5, height: 3 }, { x: 3, y: -1 });
    expect(out).toEqual({ x: 4, y: 1, width: 5, height: 3 });
    expect(result).toBe(out);
  });

  test('tuple rect를 이동한다', () => {
    const out = makeRect();
    translateInto(out, [1, 2, 5, 3], { x: 3, y: -1 });
    expect(out).toEqual({ x: 4, y: 1, width: 5, height: 3 });
  });

  test('음수 offset으로 rect를 이동한다', () => {
    const out = makeRect();
    translateInto(out, { x: 5, y: 5, width: 5, height: 5 }, { x: -3, y: -4 });
    expect(out).toEqual({ x: 2, y: 1, width: 5, height: 5 });
  });

  test('zero offset은 rect를 변경하지 않는다', () => {
    const out = makeRect();
    translateInto(out, { x: 1, y: 2, width: 5, height: 3 }, { x: 0, y: 0 });
    expect(out).toEqual({ x: 1, y: 2, width: 5, height: 3 });
  });

  test('width/height는 변경하지 않는다', () => {
    const out = makeRect();
    translateInto(out, { x: 0, y: 0, width: 7, height: 8 }, { x: 10, y: 10 });
    expect(out.width).toBe(7);
    expect(out.height).toBe(8);
  });

  test('out === rect aliasing: 정확하게 기록된다', () => {
    const r: RectWritable = { x: 1, y: 2, width: 5, height: 3 };
    translateInto(r, r, { x: 3, y: -1 });
    expect(r).toEqual({ x: 4, y: 1, width: 5, height: 3 });
  });

  test('tuple offset 입력도 처리한다', () => {
    const out = makeRect();
    translateInto(out, { x: 1, y: 2, width: 5, height: 3 }, [3, -1]);
    expect(out).toEqual({ x: 4, y: 1, width: 5, height: 3 });
  });
});

// ---------------------------------------------------------------------------
// scaleInto
// ---------------------------------------------------------------------------
describe('rect - scaleInto (origin anchor)', () => {
  test('양수 scalar로 origin 기준 scale한다', () => {
    const out = makeRect();
    const result = scaleInto(out, { x: 2, y: 3, width: 4, height: 6 }, 2);
    expect(out).toEqual({ x: 4, y: 6, width: 8, height: 12 });
    expect(result).toBe(out);
  });

  test('scalar 1은 변경하지 않는다', () => {
    const out = makeRect();
    scaleInto(out, { x: 2, y: 3, width: 4, height: 6 }, 1);
    expect(out).toEqual({ x: 2, y: 3, width: 4, height: 6 });
  });

  test('scalar 0이면 모두 0이 된다', () => {
    const out = makeRect();
    scaleInto(out, { x: 2, y: 3, width: 4, height: 6 }, 0);
    expect(out).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  test('음수 scalar는 정규화 없이 그대로 기록한다', () => {
    const out = makeRect();
    scaleInto(out, { x: 2, y: 3, width: 4, height: 6 }, -1);
    expect(out).toEqual({ x: -2, y: -3, width: -4, height: -6 });
  });

  test('소수 scalar도 처리한다', () => {
    const out = makeRect();
    scaleInto(out, { x: 0, y: 0, width: 10, height: 10 }, 0.5);
    expect(out).toEqual({ x: 0, y: 0, width: 5, height: 5 });
  });

  test('out === rect aliasing: 정확하게 기록된다', () => {
    const r: RectWritable = { x: 2, y: 3, width: 4, height: 6 };
    scaleInto(r, r, 2);
    expect(r).toEqual({ x: 4, y: 6, width: 8, height: 12 });
  });
});

// ---------------------------------------------------------------------------
// inflateInto
// ---------------------------------------------------------------------------
describe('rect - inflateInto', () => {
  test('양수 amount로 사방을 확장한다', () => {
    const out = makeRect();
    const result = inflateInto(out, { x: 1, y: 2, width: 8, height: 6 }, 2);
    expect(out).toEqual({ x: -1, y: 0, width: 12, height: 10 });
    expect(result).toBe(out);
  });

  test('amount 0은 변경하지 않는다', () => {
    const out = makeRect();
    inflateInto(out, { x: 1, y: 2, width: 8, height: 6 }, 0);
    expect(out).toEqual({ x: 1, y: 2, width: 8, height: 6 });
  });

  test('음수 amount(deflate)를 정규화 없이 적용한다', () => {
    const out = makeRect();
    inflateInto(out, { x: 0, y: 0, width: 10, height: 10 }, -2);
    expect(out).toEqual({ x: 2, y: 2, width: 6, height: 6 });
  });

  test('deflate가 너무 크면 empty rect가 된다', () => {
    const out = makeRect();
    inflateInto(out, { x: 0, y: 0, width: 4, height: 4 }, -5);
    expect(out.width).toBeLessThan(0);
    expect(out.height).toBeLessThan(0);
  });

  test('out === rect aliasing: 정확하게 기록된다', () => {
    const r: RectWritable = { x: 1, y: 2, width: 8, height: 6 };
    inflateInto(r, r, 2);
    expect(r).toEqual({ x: -1, y: 0, width: 12, height: 10 });
  });
});

// ---------------------------------------------------------------------------
// expandToIncludePointInto
// ---------------------------------------------------------------------------
describe('rect - expandToIncludePointInto', () => {
  test('내부 점은 rect를 변경하지 않는다', () => {
    const out = makeRect();
    const result = expandToIncludePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5 });
    expect(out).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    expect(result).toBe(out);
  });

  test('x 방향 외부 점은 right를 확장한다', () => {
    const out = makeRect();
    expandToIncludePointInto(out, { x: 0, y: 0, width: 5, height: 5 }, { x: 8, y: 3 });
    expect(out).toEqual({ x: 0, y: 0, width: 8, height: 5 });
  });

  test('y 방향 외부 점은 bottom을 확장한다', () => {
    const out = makeRect();
    expandToIncludePointInto(out, { x: 0, y: 0, width: 5, height: 5 }, { x: 3, y: 8 });
    expect(out).toEqual({ x: 0, y: 0, width: 5, height: 8 });
  });

  test('x 방향 왼쪽 외부 점은 x를 당기고 width를 늘린다', () => {
    const out = makeRect();
    expandToIncludePointInto(out, { x: 2, y: 0, width: 5, height: 5 }, { x: -2, y: 3 });
    expect(out).toEqual({ x: -2, y: 0, width: 9, height: 5 });
  });

  test('사방 외부 점은 rect를 모두 확장한다', () => {
    const out = makeRect();
    expandToIncludePointInto(out, { x: 2, y: 2, width: 5, height: 5 }, { x: -1, y: -1 });
    expect(out).toEqual({ x: -1, y: -1, width: 8, height: 8 });
  });

  test('out === rect aliasing: 정확하게 기록된다', () => {
    const r: RectWritable = { x: 0, y: 0, width: 5, height: 5 };
    expandToIncludePointInto(r, r, { x: 8, y: 3 });
    expect(r).toEqual({ x: 0, y: 0, width: 8, height: 5 });
  });

  test('tuple point 입력도 처리한다', () => {
    const out = makeRect();
    expandToIncludePointInto(out, { x: 0, y: 0, width: 5, height: 5 }, [8, 3]);
    expect(out).toEqual({ x: 0, y: 0, width: 8, height: 5 });
  });
});

// ---------------------------------------------------------------------------
// expandToIncludeRectInto
// ---------------------------------------------------------------------------
describe('rect - expandToIncludeRectInto', () => {
  test('포함된 other는 rect를 변경하지 않는다', () => {
    const out = makeRect();
    const result = expandToIncludeRectInto(
      out,
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 2, y: 2, width: 6, height: 6 }
    );
    expect(out).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    expect(result).toBe(out);
  });

  test('외부 other는 rect를 확장한다', () => {
    const out = makeRect();
    expandToIncludeRectInto(out, { x: 0, y: 0, width: 5, height: 5 }, { x: 3, y: 3, width: 6, height: 6 });
    expect(out).toEqual({ x: 0, y: 0, width: 9, height: 9 });
  });

  test('왼쪽 위 외부 other도 확장한다', () => {
    const out = makeRect();
    expandToIncludeRectInto(out, { x: 5, y: 5, width: 5, height: 5 }, { x: 0, y: 0, width: 3, height: 3 });
    expect(out).toEqual({ x: 0, y: 0, width: 10, height: 10 });
  });

  test('out === rect aliasing: 정확하게 기록된다', () => {
    const r: RectWritable = { x: 0, y: 0, width: 5, height: 5 };
    expandToIncludeRectInto(r, r, { x: 3, y: 3, width: 6, height: 6 });
    expect(r).toEqual({ x: 0, y: 0, width: 9, height: 9 });
  });

  test('out === other aliasing: 정확하게 기록된다', () => {
    const rect = { x: 0, y: 0, width: 5, height: 5 };
    const other: RectWritable = { x: 3, y: 3, width: 6, height: 6 };
    expandToIncludeRectInto(other, rect, other);
    expect(other).toEqual({ x: 0, y: 0, width: 9, height: 9 });
  });

  test('negative-dim other의 raw 자연식을 그대로 적용한다', () => {
    // docs: expandToIncludeRectInto는 normalize 없이 raw min/max 자연식 적용
    // other = {x:10, y:10, width:-3, height:-3} → right=7, bottom=7
    // new_x = min(0, 10)=0, new_right = max(5, 7)=7
    const out = makeRect();
    expandToIncludeRectInto(out, { x: 0, y: 0, width: 5, height: 5 }, { x: 10, y: 10, width: -3, height: -3 });
    expect(out).toEqual({ x: 0, y: 0, width: 7, height: 7 });
  });
});
