/**
 * TASK-02: triangle closest point / distance 단위 테스트
 *
 * 대상 함수:
 *   closestPointInto, closestPoint
 *   distanceToPoint
 */
import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/triangle/closest-point';
import { closestPointInto } from '../../../src/triangle/closest-point-into';
import { distanceToPoint } from '../../../src/triangle/distance-to-point';
import type { TriangleLike, XYObjectWritable, XYTupleWritable } from '../../../src/types';

// ─── 공통 helper ─────────────────────────────────────────────────────────────

/** 두 좌표가 12 소수점 이내로 일치하는지 확인한다. */
function expectXY(actual: { x: number; y: number }, x: number, y: number): void {
  expect(actual.x).toBeCloseTo(x, 12);
  expect(actual.y).toBeCloseTo(y, 12);
}

/** 새 XYObjectWritable seed를 만든다. */
function seed(): XYObjectWritable {
  return { x: Number.NaN, y: Number.NaN };
}

// 기본 CCW 직각삼각형: A=(0,0), B=(4,0), C=(0,3)
const BASE: TriangleLike = {
  a: { x: 0, y: 0 },
  b: { x: 4, y: 0 },
  c: { x: 0, y: 3 },
};

// ─── closestPointInto ────────────────────────────────────────────────────────

describe('closestPointInto', () => {
  test('내부 point는 input 좌표를 그대로 기록한다', () => {
    const out = seed();
    const result = closestPointInto(out, BASE, { x: 1, y: 1 });
    expect(result).toBe(out);
    expectXY(out, 1, 1);
  });

  test('edge AB 위 point는 input 좌표를 그대로 기록한다', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: 2, y: 0 });
    expectXY(out, 2, 0);
  });

  test('edge CA 위 point는 input 좌표를 그대로 기록한다', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: 0, y: 1.5 });
    expectXY(out, 0, 1.5);
  });

  test('vertex 위 point는 input 좌표를 그대로 기록한다', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: 4, y: 0 });
    expectXY(out, 4, 0);
  });

  test('외부 point가 AB 위로 project된다 (y<0 영역)', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: 2, y: -3 });
    expectXY(out, 2, 0);
  });

  test('외부 point가 CA 위로 project된다 (x<0 영역)', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: -2, y: 1 });
    expectXY(out, 0, 1);
  });

  test('외부 point가 BC 위로 project된다 (hypotenuse 바깥)', () => {
    // BC: B=(4,0)→C=(0,3). line normal 방향 바깥 point는 BC 위 foot에 project된다.
    // p=(4,3): BC line 식 3x+4y=12, 거리 = |3*4+4*3-12|/5 = 12/5 = 2.4
    // foot = p - normal*dist = (4,3) - (3/5, 4/5)*2.4 = (4 - 1.44, 3 - 1.92) = (2.56, 1.08)
    const out = seed();
    closestPointInto(out, BASE, { x: 4, y: 3 });
    expectXY(out, 2.56, 1.08);
  });

  test('외부 point가 vertex A에 clamp된다 (제3 사분면)', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: -1, y: -1 });
    expectXY(out, 0, 0);
  });

  test('외부 point가 vertex B에 clamp된다 (x>4, y<0)', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: 6, y: -2 });
    expectXY(out, 4, 0);
  });

  test('외부 point가 vertex C에 clamp된다 (x<0, y>3)', () => {
    const out = seed();
    closestPointInto(out, BASE, { x: -2, y: 5 });
    expectXY(out, 0, 3);
  });

  test('동거리 tie-break: AB와 CA 동거리이면 AB를 우선한다', () => {
    // A=(0,0), B=(4,0), C=(0,3) 기준 p=(-1,-1)은 AB segment 위 closest=(0,0), CA 위 closest=(0,0).
    // 둘 다 같은 거리 sqrt(2)지만 AB가 먼저이므로 AB의 (0,0)을 기록한다.
    //
    // 회귀 시뮬레이션: 외부 점이 두 vertex로 동거리 clamp되는 경우 두 vertex가 동일 좌표를
    // 공유하므로(여기서는 vertex A) 좌표 동거리 catch만으로 strict `<` 회귀(`<=`)를 잡지
    // 못한다. 이 테스트는 동거리 후보가 모두 vertex A에 clamp되는 정책의 결과(AB 후보
    // 유지)를 검증하는 sanity test다. strict-vs-non-strict 비교 회귀를 본격적으로 catch
    // 하려면 internal helper에 대한 직접 단위 테스트가 필요하며, 외부 점에서 좌표 다른
    // 동거리 두 후보가 동시에 winning이려면 segment foot이 항상 더 가까운 기하학적 성질
    // 때문에 만들 수 없다. 후속 internal-only 테스트로 보강한다.
    const out = seed();
    closestPointInto(out, BASE, { x: -1, y: -1 });
    expectXY(out, 0, 0);
  });

  test('동거리 tie-break: AB와 BC가 같은 vertex B에 clamp되면 AB를 유지한다', () => {
    // p=(5,-1)은 AB segment 위 closest=(4,0)이고 BC 위 closest=(4,0)도 vertex B다.
    // 둘 다 같은 거리지만 AB가 먼저이므로 AB의 (4,0)을 유지한다.
    //
    // 회귀 시뮬레이션: 두 후보 좌표가 동일(vertex B)하므로 strict `<` → `<=` 회귀에서도
    // 결과 좌표가 같다. 위 동기와 같이 좌표 catch는 불가능하고 정책 결과만 검증한다.
    const out = seed();
    closestPointInto(out, BASE, { x: 5, y: -1 });
    expectXY(out, 4, 0);
  });

  test('degenerate collinear triangle: 세 segment 최단점으로 환원한다', () => {
    // A=(0,0), B=(2,0), C=(4,0) 일직선 triangle. p=(3,2)와의 closest는 AB 또는 BC 위 foot.
    // AB segment (0,0)-(2,0): t = ((3-0)*2 + (2-0)*0)/4 = 1.5 → clamp 1 → (2,0), 거리 sqrt(1+4)=sqrt(5)
    // BC segment (2,0)-(4,0): t = ((3-2)*2 + (2-0)*0)/4 = 0.5 → (3,0), 거리 2
    // CA segment (4,0)-(0,0): t = ((3-4)*(-4) + (2-0)*0)/16 = 4/16 = 0.25 → (3,0), 거리 2
    // 최단은 BC (3,0)와 CA (3,0). BC가 CA보다 먼저이므로 BC 유지.
    const out = seed();
    closestPointInto(out, { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } }, { x: 3, y: 2 });
    expectXY(out, 3, 0);
  });

  test('degenerate collinear triangle 내부 영역도 segment 환원한다 (closed area로 보지 않는다)', () => {
    // A=(0,0), B=(4,0), C=(2,0) 일직선. p=(1,0)은 일직선 위 점이지만 degenerate으로 area 처리하지 않는다.
    // AB 위 closest=(1,0), 거리 0. BC, CA도 (1,0) 근처지만 distance 0이면 첫 후보 AB 유지.
    const out = seed();
    closestPointInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 0 } }, { x: 1, y: 0 });
    expectXY(out, 1, 0);
  });

  test('all-same vertex triangle: 그 vertex를 기록한다', () => {
    const out = seed();
    closestPointInto(out, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } }, { x: 0, y: 0 });
    expectXY(out, 5, 7);
  });

  test('tuple TriangleLike 입력을 처리한다', () => {
    const out = seed();
    closestPointInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 },
      ] as const,
      { x: 4, y: 3 }
    );
    expectXY(out, 2.56, 1.08);
  });

  test('tuple XYInput point 입력을 처리한다', () => {
    const out = seed();
    closestPointInto(out, BASE, [2, -3] as const);
    expectXY(out, 2, 0);
  });

  test('tuple writable output을 처리한다', () => {
    const out: XYTupleWritable = [Number.NaN, Number.NaN];
    closestPointInto(out, BASE, { x: 2, y: -3 });
    expect(out[0]).toBeCloseTo(2, 12);
    expect(out[1]).toBeCloseTo(0, 12);
  });

  test('aliasing: out이 triangle.a storage와 같아도 정확히 기록한다', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    // out으로 tri.a를 넘긴다. 외부 point (-2,5)는 vertex C에 clamp.
    closestPointInto(tri.a, tri, { x: -2, y: 5 });
    expectXY(tri.a, 0, 3);
    // b, c는 mutate되지 않는다.
    expectXY(tri.b, 4, 0);
    expectXY(tri.c, 0, 3);
  });

  test('aliasing: out이 triangle.b storage와 같아도 정확히 기록한다', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    // 외부 point (6, -2)는 vertex B에 clamp. out으로 tri.b를 넘겨도 결과가 (4, 0)이어야 한다.
    closestPointInto(tri.b, tri, { x: 6, y: -2 });
    expectXY(tri.b, 4, 0);
    expectXY(tri.a, 0, 0);
    expectXY(tri.c, 0, 3);
  });

  test('aliasing: out이 triangle.c storage와 같아도 정확히 기록한다', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    // 외부 point (-2, 5)는 vertex C에 clamp. out으로 tri.c를 넘겨도 결과가 (0, 3)이어야 한다.
    closestPointInto(tri.c, tri, { x: -2, y: 5 });
    expectXY(tri.c, 0, 3);
    expectXY(tri.a, 0, 0);
    expectXY(tri.b, 4, 0);
  });

  test('aliasing: out이 point storage와 같아도 정확히 기록한다 (내부)', () => {
    const p: XYObjectWritable = { x: 1, y: 1 };
    closestPointInto(p, BASE, p);
    expectXY(p, 1, 1);
  });

  test('aliasing: out이 point storage와 같아도 정확히 기록한다 (외부)', () => {
    const p: XYObjectWritable = { x: 2, y: -3 };
    closestPointInto(p, BASE, p);
    expectXY(p, 2, 0);
  });

  test('항상 out을 반환한다', () => {
    const out = seed();
    expect(closestPointInto(out, BASE, { x: 0, y: 0 })).toBe(out);
  });

  test('NaN point는 pass through한다 (모든 비교가 NaN이면 AB 첫 후보)', () => {
    // NaN < x는 항상 false라 best 비교에서 AB 후보가 그대로 남는다.
    const out = seed();
    closestPointInto(out, BASE, { x: Number.NaN, y: Number.NaN });
    // AB segment (0,0)-(4,0)에서 NaN point의 clamp 결과: t = NaN → max(0, min(1, NaN)) = NaN
    // dx = 4, dy = 0 → cp = (0 + NaN*4, 0 + NaN*0) = (NaN, NaN)
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity point는 JS 산술 결과를 따른다', () => {
    // Infinity * 0 = NaN 등 pass-through. 결과는 정의된 값(또는 NaN)이지만 throw 하지 않는다.
    const out = seed();
    expect(() => closestPointInto(out, BASE, { x: Number.POSITIVE_INFINITY, y: 0 })).not.toThrow();
  });

  test('-Infinity point는 JS 산술 결과를 따른다', () => {
    const out = seed();
    expect(() => closestPointInto(out, BASE, { x: 0, y: Number.NEGATIVE_INFINITY })).not.toThrow();
  });

  test('NaN triangle vertex는 pass through한다', () => {
    const out = seed();
    expect(() =>
      closestPointInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } }, { x: 1, y: 1 })
    ).not.toThrow();
  });

  test('Infinity triangle vertex는 pass through한다', () => {
    const out = seed();
    expect(() =>
      closestPointInto(
        out,
        { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 }, c: { x: 0, y: 3 } },
        { x: 1, y: 1 }
      )
    ).not.toThrow();
  });

  test('zero degenerate (all-same vertex)는 점 거리로 환원한다', () => {
    const out = seed();
    closestPointInto(out, { a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, c: { x: 0, y: 0 } }, { x: 3, y: 4 });
    expectXY(out, 0, 0);
  });

  test('CW triangle도 동일한 결과를 낸다 (winding 무관)', () => {
    // CW: A=(0,0), B=(0,3), C=(4,0). 내부 point (1,1)은 그대로 기록.
    const cw: TriangleLike = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    const out = seed();
    closestPointInto(out, cw, { x: 1, y: 1 });
    expectXY(out, 1, 1);
  });
});

// ─── closestPoint ────────────────────────────────────────────────────────────

describe('closestPoint', () => {
  test('새 XYObjectWritable을 반환한다', () => {
    const p = closestPoint(BASE, { x: 2, y: -3 });
    expectXY(p, 2, 0);
    expect(typeof p.x).toBe('number');
    expect(typeof p.y).toBe('number');
  });

  test('내부 point는 input 좌표를 그대로 반환한다', () => {
    const p = closestPoint(BASE, { x: 1, y: 1 });
    expectXY(p, 1, 1);
  });

  test('input mutation 없음', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    const point = { x: 4, y: 3 };
    closestPoint(tri, point);
    expectXY(tri.a, 0, 0);
    expectXY(tri.b, 4, 0);
    expectXY(tri.c, 0, 3);
    expectXY(point, 4, 3);
  });

  test('호출마다 새 object를 반환한다', () => {
    const p1 = closestPoint(BASE, { x: 0, y: 0 });
    const p2 = closestPoint(BASE, { x: 0, y: 0 });
    expect(p1).not.toBe(p2);
  });
});

// ─── distanceToPoint ─────────────────────────────────────────────────────────

describe('distanceToPoint', () => {
  test('내부 point는 0을 반환한다', () => {
    expect(distanceToPoint(BASE, { x: 1, y: 1 })).toBe(0);
  });

  test('edge 위 point는 0을 반환한다', () => {
    expect(distanceToPoint(BASE, { x: 2, y: 0 })).toBe(0);
    expect(distanceToPoint(BASE, { x: 0, y: 1.5 })).toBe(0);
  });

  test('vertex 위 point는 0을 반환한다', () => {
    expect(distanceToPoint(BASE, { x: 0, y: 0 })).toBe(0);
    expect(distanceToPoint(BASE, { x: 4, y: 0 })).toBe(0);
    expect(distanceToPoint(BASE, { x: 0, y: 3 })).toBe(0);
  });

  test('외부 point AB project: 거리는 |y|', () => {
    expect(distanceToPoint(BASE, { x: 2, y: -3 })).toBeCloseTo(3, 12);
  });

  test('외부 point CA project: 거리는 |x|', () => {
    expect(distanceToPoint(BASE, { x: -2, y: 1 })).toBeCloseTo(2, 12);
  });

  test('외부 point BC project: hypotenuse 거리', () => {
    // p=(4,3), BC 거리 = 12/5 = 2.4
    expect(distanceToPoint(BASE, { x: 4, y: 3 })).toBeCloseTo(2.4, 12);
  });

  test('외부 point vertex clamp: 거리는 Euclidean', () => {
    // p=(-1,-1), 가장 가까운 vertex A=(0,0), 거리 sqrt(2)
    expect(distanceToPoint(BASE, { x: -1, y: -1 })).toBeCloseTo(Math.sqrt(2), 12);
  });

  test('closestPointInto 결과와 거리가 일치한다 (외부 BC)', () => {
    const cp = closestPoint(BASE, { x: 4, y: 3 });
    const dx = cp.x - 4;
    const dy = cp.y - 3;
    const expected = Math.sqrt(dx * dx + dy * dy);
    expect(distanceToPoint(BASE, { x: 4, y: 3 })).toBeCloseTo(expected, 12);
  });

  test('degenerate collinear triangle은 segment distance로 환원한다', () => {
    // A=(0,0), B=(2,0), C=(4,0), p=(3,2). 최단 거리 2.
    expect(distanceToPoint({ a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } }, { x: 3, y: 2 })).toBeCloseTo(
      2,
      12
    );
  });

  test('degenerate collinear에서 line 위 point는 0', () => {
    expect(distanceToPoint({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 0 } }, { x: 1, y: 0 })).toBe(0);
  });

  test('all-same vertex triangle은 point distance를 반환한다', () => {
    expect(distanceToPoint({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, c: { x: 0, y: 0 } }, { x: 3, y: 4 })).toBeCloseTo(
      5,
      12
    );
  });

  test('tuple TriangleLike 입력을 처리한다', () => {
    expect(
      distanceToPoint(
        [
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 0, y: 3 },
        ] as const,
        { x: 4, y: 3 }
      )
    ).toBeCloseTo(2.4, 12);
  });

  test('NaN point는 NaN을 반환한다 (비교 가능한 후보 없음)', () => {
    expect(Number.isNaN(distanceToPoint(BASE, { x: Number.NaN, y: 0 }))).toBe(true);
  });

  test('Infinity point는 Infinity 또는 NaN을 반환한다 (JS 산술)', () => {
    // (Infinity, 0)은 AB 위 foot=(Infinity 또는 NaN, 0) → 거리 Infinity 또는 NaN.
    // 정확한 값보다 throw 하지 않음과 finite하지 않음을 확인한다.
    const d = distanceToPoint(BASE, { x: Number.POSITIVE_INFINITY, y: 0 });
    expect(Number.isFinite(d)).toBe(false);
  });

  test('-Infinity point는 Infinity 또는 NaN을 반환한다 (JS 산술)', () => {
    const d = distanceToPoint(BASE, { x: 0, y: Number.NEGATIVE_INFINITY });
    expect(Number.isFinite(d)).toBe(false);
  });

  test('NaN triangle vertex는 pass through한다 (throw 없음)', () => {
    expect(() =>
      distanceToPoint({ a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } }, { x: 1, y: 1 })
    ).not.toThrow();
  });

  test('비교 가능한 edge 후보가 없으면 NaN을 반환한다', () => {
    // vertex B=(NaN, NaN)이면 AB / BC 후보의 거리²가 NaN. CA 후보는 finite C=(0,3)→A=(0,0)이고
    // strict < 비교에서 NaN과 비교는 false이므로 AB(NaN) 첫 후보가 유지되어 distSq=NaN, 결과 NaN.
    // polygonContainsPoint도 외부 점 (1,1)에 대해 NaN edge가 crossing flip을 만들지 못해 inside가
    // false이고 edge 환원 분기로 들어간다.
    const d = distanceToPoint(
      { a: { x: 0, y: 0 }, b: { x: Number.NaN, y: Number.NaN }, c: { x: 0, y: 3 } },
      { x: 1, y: 1 }
    );
    expect(Number.isNaN(d)).toBe(true);
  });

  test('zero degenerate (all-same vertex)에서도 결과 반환', () => {
    expect(distanceToPoint({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, c: { x: 0, y: 0 } }, { x: 0, y: 0 })).toBe(0);
  });

  test('CW triangle도 동일한 결과 (내부)', () => {
    const cw: TriangleLike = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    expect(distanceToPoint(cw, { x: 1, y: 1 })).toBe(0);
  });

  test('CW triangle도 동일한 결과 (외부)', () => {
    const cw: TriangleLike = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    expect(distanceToPoint(cw, { x: 2, y: -3 })).toBeCloseTo(3, 12);
  });
});
