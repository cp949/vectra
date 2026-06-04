/**
 * S12-RM-008: triangle edge-only closest point 단위 테스트
 *
 * 대상 함수:
 *   closestPointOnEdgeInto, closestPointOnEdge
 *
 * 핵심 차이: closestPoint와 달리 non-degenerate triangle 내부/boundary point도
 * 가장 가까운 edge로 강제 투영한다.
 */
import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/triangle/closest-point';
import { closestPointOnEdge } from '../../../src/triangle/closest-point-on-edge';
import { closestPointOnEdgeInto } from '../../../src/triangle/closest-point-on-edge-into';
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

// ─── closestPointOnEdgeInto ──────────────────────────────────────────────────

describe('closestPointOnEdgeInto', () => {
  test('내부 point는 closestPoint와 달리 가장 가까운 edge로 투영된다', () => {
    // 내부 point (1, 0.5). closestPoint는 내부라 (1, 0.5)를 그대로 반환한다.
    // closestPointOnEdge는 가장 가까운 edge AB 위 (1, 0)으로 투영한다.
    expectXY(closestPoint(BASE, { x: 1, y: 0.5 }), 1, 0.5);
    const out = seed();
    const result = closestPointOnEdgeInto(out, BASE, { x: 1, y: 0.5 });
    expect(result).toBe(out);
    expectXY(out, 1, 0);
  });

  test('내부 point가 가장 가까운 CA edge로 투영된다', () => {
    // 내부 point (0.5, 1.5). AB foot (0.5,0) dist²=2.25, CA foot (0,1.5) dist²=0.25,
    // BC foot (1.04,2.22) dist²=0.81. CA가 최단이라 (0,1.5)로 투영한다.
    expectXY(closestPoint(BASE, { x: 0.5, y: 1.5 }), 0.5, 1.5);
    const out = seed();
    closestPointOnEdgeInto(out, BASE, { x: 0.5, y: 1.5 });
    expectXY(out, 0, 1.5);
  });

  test('AB·CA 동거리 내부 point는 strict < tie-break로 AB를 유지한다', () => {
    // 내부 point (0.5, 0.5)는 AB foot (0.5,0)과 CA foot (0, 0.4999999999999999)이 모두 dist²=0.25.
    // AB foot dist²와 CA foot dist²가 bit-equal 0.25라 `caDistSq < abDistSq`가 false → AB 유지.
    // foot 좌표가 아니라 squared distance가 정확히 동값이라 knife-edge가 아니다(폐기한 (1,1)과 대비).
    const out = seed();
    closestPointOnEdgeInto(out, BASE, { x: 0.5, y: 0.5 });
    expectXY(out, 0.5, 0);
  });

  test('AB·BC 동거리는 strict < tie-break로 AB를 유지한다 (foot 좌표가 서로 다름)', () => {
    // tri A=(0,0), B=(2,0), C=(2,2). point (1.5, 0.5).
    // AB foot (1.5,0) dist²=0.25, BC foot (2,0.5) dist²=0.25 (둘 다 정확히 0.25, foot 좌표는 다름).
    // CA foot (1,1) dist²=0.5. strict < (AB → BC → CA)로 AB의 (1.5, 0)을 유지한다.
    // foot이 동일했던 기존 aliasing 케이스와 달리 AB-우선 precedence를 실제로 구분한다.
    const out = seed();
    closestPointOnEdgeInto(out, { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 2, y: 2 } }, { x: 1.5, y: 0.5 });
    expectXY(out, 1.5, 0);
  });

  test('boundary point는 같은 edge 좌표를 기록한다', () => {
    const out = seed();
    closestPointOnEdgeInto(out, BASE, { x: 2, y: 0 });
    expectXY(out, 2, 0);
  });

  test('CA edge 위 boundary point도 같은 좌표를 기록한다', () => {
    const out = seed();
    closestPointOnEdgeInto(out, BASE, { x: 0, y: 1.5 });
    expectXY(out, 0, 1.5);
  });

  test('외부 point는 hypotenuse BC 위로 투영된다', () => {
    // p=(4,3): BC line 3x+4y=12, foot=(2.56,1.08).
    const out = seed();
    closestPointOnEdgeInto(out, BASE, { x: 4, y: 3 });
    expectXY(out, 2.56, 1.08);
  });

  test('외부 point가 vertex로 clamp된다', () => {
    const out = seed();
    closestPointOnEdgeInto(out, BASE, { x: -1, y: -1 });
    expectXY(out, 0, 0);
  });

  test('degenerate collinear triangle은 세 segment 최단점으로 환원한다', () => {
    // A=(0,0), B=(2,0), C=(4,0), p=(3,2). BC foot (3,0)와 CA foot (3,0). BC tie-break 유지.
    const out = seed();
    closestPointOnEdgeInto(out, { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } }, { x: 3, y: 2 });
    expectXY(out, 3, 0);
  });

  test('degenerate collinear 내부 영역 point도 segment로 환원한다', () => {
    // A=(0,0), B=(4,0), C=(2,0) 일직선. p=(1,0)은 AB 위 (1,0), 거리 0.
    const out = seed();
    closestPointOnEdgeInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 0 } }, { x: 1, y: 0 });
    expectXY(out, 1, 0);
  });

  test('all-same vertex triangle은 그 vertex를 기록한다', () => {
    const out = seed();
    closestPointOnEdgeInto(out, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } }, { x: 0, y: 0 });
    expectXY(out, 5, 7);
  });

  test('tuple TriangleLike 입력을 처리한다', () => {
    const out = seed();
    closestPointOnEdgeInto(
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
    closestPointOnEdgeInto(out, BASE, [1, 0.5] as const);
    expectXY(out, 1, 0);
  });

  test('tuple writable output을 처리한다', () => {
    const out: XYTupleWritable = [Number.NaN, Number.NaN];
    closestPointOnEdgeInto(out, BASE, { x: 1, y: 0.5 });
    expect(out[0]).toBeCloseTo(1, 12);
    expect(out[1]).toBeCloseTo(0, 12);
  });

  test('aliasing: out이 triangle.a storage와 같아도 정확히 기록한다', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    // 내부 point (1, 0.5)의 winner는 vertex a를 읽는 AB edge다. out으로 tri.a를 넘기므로
    // a를 write 전에 local로 capture하지 못한 구현이면 결과가 깨진다. AB foot (1,0)이어야 한다.
    closestPointOnEdgeInto(tri.a, tri, { x: 1, y: 0.5 });
    expectXY(tri.a, 1, 0);
    expectXY(tri.b, 4, 0);
    expectXY(tri.c, 0, 3);
  });

  test('aliasing: out이 triangle.b storage와 같아도 정확히 기록한다', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    closestPointOnEdgeInto(tri.b, tri, { x: 6, y: -2 });
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
    closestPointOnEdgeInto(tri.c, tri, { x: -2, y: 5 });
    expectXY(tri.c, 0, 3);
    expectXY(tri.a, 0, 0);
    expectXY(tri.b, 4, 0);
  });

  test('aliasing: out이 point storage와 같아도 정확히 투영한다 (내부)', () => {
    // 내부 point (1, 0.5)를 out으로도 넘긴다. AB 위 (1,0)으로 투영돼야 한다.
    const p: XYObjectWritable = { x: 1, y: 0.5 };
    closestPointOnEdgeInto(p, BASE, p);
    expectXY(p, 1, 0);
  });

  test('항상 out을 반환한다', () => {
    const out = seed();
    expect(closestPointOnEdgeInto(out, BASE, { x: 0, y: 0 })).toBe(out);
  });

  test('NaN point는 AB 첫 후보 pass-through 결과를 따른다', () => {
    const out = seed();
    closestPointOnEdgeInto(out, BASE, { x: Number.NaN, y: Number.NaN });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity point는 throw 없이 pass-through 결과를 기록한다', () => {
    // scale=Infinity가 모든 segment의 lenSq를 0으로 무너뜨려 각 segment-A를 foot으로 반환한다.
    // 세 후보 dist² 모두 Infinity라 strict <가 false → 첫 후보 AB의 segment-A (0,0)을 유지한다.
    const out = seed();
    expect(() => closestPointOnEdgeInto(out, BASE, { x: Number.POSITIVE_INFINITY, y: 0 })).not.toThrow();
    expectXY(out, 0, 0);
  });

  test('-Infinity point는 throw 없이 pass-through 결과를 기록한다', () => {
    const out = seed();
    expect(() => closestPointOnEdgeInto(out, BASE, { x: 0, y: Number.NEGATIVE_INFINITY })).not.toThrow();
    expectXY(out, 0, 0);
  });

  test('NaN triangle vertex는 throw 하지 않는다', () => {
    const out = seed();
    expect(() =>
      closestPointOnEdgeInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } }, { x: 1, y: 1 })
    ).not.toThrow();
  });

  test('Infinity triangle vertex는 throw 하지 않는다', () => {
    const out = seed();
    expect(() =>
      closestPointOnEdgeInto(
        out,
        { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 }, c: { x: 0, y: 3 } },
        { x: 1, y: 1 }
      )
    ).not.toThrow();
  });

  test('-Infinity triangle vertex는 throw 하지 않는다', () => {
    const out = seed();
    expect(() =>
      closestPointOnEdgeInto(
        out,
        { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: Number.NEGATIVE_INFINITY, y: 3 } },
        { x: 1, y: 1 }
      )
    ).not.toThrow();
  });

  test('CW triangle 내부 point도 edge로 투영한다 (winding 무관)', () => {
    // CW: A=(0,0), B=(0,3), C=(4,0). 내부 point (1, 0.5)는 CA edge (y=0) 위 (1,0)으로 투영.
    const cw: TriangleLike = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    const out = seed();
    closestPointOnEdgeInto(out, cw, { x: 1, y: 0.5 });
    expectXY(out, 1, 0);
  });
});

// ─── closestPointOnEdge ──────────────────────────────────────────────────────

describe('closestPointOnEdge', () => {
  test('새 XYObjectWritable을 반환한다', () => {
    const p = closestPointOnEdge(BASE, { x: 1, y: 0.5 });
    expectXY(p, 1, 0);
    expect(typeof p.x).toBe('number');
    expect(typeof p.y).toBe('number');
  });

  test('내부 point도 edge로 투영한다', () => {
    const p = closestPointOnEdge(BASE, { x: 1, y: 0.5 });
    expectXY(p, 1, 0);
  });

  test('input mutation 없음', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    const point = { x: 4, y: 3 };
    closestPointOnEdge(tri, point);
    expectXY(tri.a, 0, 0);
    expectXY(tri.b, 4, 0);
    expectXY(tri.c, 0, 3);
    expectXY(point, 4, 3);
  });

  test('호출마다 새 object를 반환한다', () => {
    const p1 = closestPointOnEdge(BASE, { x: 0, y: 0 });
    const p2 = closestPointOnEdge(BASE, { x: 0, y: 0 });
    expect(p1).not.toBe(p2);
  });
});
