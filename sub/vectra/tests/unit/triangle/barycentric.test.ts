/**
 * triangle barycentric 좌표 변환 단위 테스트.
 *
 * barycentricInto / barycentric의 vertex/centroid/내부/외부 점 분류, sum=1 invariant,
 * degenerate triangle 실패 정책, tuple input 처리를 다룬다.
 * pointFromBarycentricInto / pointFromBarycentric의 affine combination, degenerate triangle 성공,
 * non-normalized/negative weight pass-through, non-finite pass-through, aliasing, round-trip을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { barycentric } from '../../../src/triangle/barycentric';
import { type BarycentricWritable, barycentricInto } from '../../../src/triangle/barycentric-into';
import { pointFromBarycentric } from '../../../src/triangle/point-from-barycentric';
import { pointFromBarycentricInto } from '../../../src/triangle/point-from-barycentric-into';

/** collinear(degenerate) triangle */
const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

describe('barycentricInto', () => {
  /** 테스트용 triangle: a(0,0) b(4,0) c(0,4) */
  const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

  /** 빈 BarycentricWritable seed를 생성한다. 각 테스트는 신선한 out으로 호출한다. */
  function seed(): BarycentricWritable {
    return { x: 0, y: 0, w: 0 };
  }

  test('centroid(4/3, 4/3): u=v=w=1/3이다', () => {
    const cx = (0 + 4 + 0) / 3;
    const cy = (0 + 0 + 4) / 3;
    const out = seed();
    const result = barycentricInto(out, tri, { x: cx, y: cy });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(1 / 3, 10);
    expect(out.y).toBeCloseTo(1 / 3, 10);
    expect(out.w).toBeCloseTo(1 / 3, 10);
  });

  test('vertex a(0,0): u=1, v=0, w=0이다', () => {
    const out = seed();
    barycentricInto(out, tri, { x: 0, y: 0 });
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
    expect(out.w).toBeCloseTo(0, 10);
  });

  test('vertex b(4,0): u=0, v=1, w=0이다', () => {
    const out = seed();
    barycentricInto(out, tri, { x: 4, y: 0 });
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
    expect(out.w).toBeCloseTo(0, 10);
  });

  test('vertex c(0,4): u=0, v=0, w=1이다', () => {
    const out = seed();
    barycentricInto(out, tri, { x: 0, y: 4 });
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(0, 10);
    expect(out.w).toBeCloseTo(1, 10);
  });

  test('u + v + w === 1이다', () => {
    const out = seed();
    barycentricInto(out, tri, { x: 1, y: 1 });
    expect(out.x + out.y + out.w).toBeCloseTo(1, 10);
  });

  test('내부 point: 세 좌표가 모두 양수다', () => {
    const out = seed();
    barycentricInto(out, tri, { x: 1, y: 1 });
    expect(out.x).toBeGreaterThan(0);
    expect(out.y).toBeGreaterThan(0);
    expect(out.w).toBeGreaterThan(0);
  });

  test('외부 point: 한 좌표가 음수다', () => {
    const out = seed();
    barycentricInto(out, tri, { x: 5, y: 5 });
    const hasNegative = out.x < 0 || out.y < 0 || out.w < 0;
    expect(hasNegative).toBe(true);
  });

  test('degenerate triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = seed();
    out.x = 99;
    out.y = 99;
    out.w = 99;
    const result = barycentricInto(out, collinear, { x: 1, y: 0 });
    expect(result).toBe(false);
    expect(out.x).toBe(99);
  });

  test('tuple input(XYTuple point)도 처리한다', () => {
    const out = seed();
    barycentricInto(out, tri, [0, 0] as const);
    expect(out.x).toBeCloseTo(1, 10);
  });
});

describe('barycentric', () => {
  const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

  test('centroid: u=v=w=1/3인 object를 반환한다', () => {
    const cx = (0 + 4 + 0) / 3;
    const cy = (0 + 0 + 4) / 3;
    const result = barycentric(tri, { x: cx, y: cy });
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(1 / 3, 10);
    expect(result?.y).toBeCloseTo(1 / 3, 10);
    expect(result?.w).toBeCloseTo(1 / 3, 10);
  });

  test('degenerate triangle: undefined를 반환한다', () => {
    expect(barycentric(collinear, { x: 1, y: 0 })).toBeUndefined();
  });
});

describe('pointFromBarycentricInto', () => {
  /** 테스트용 triangle: a(0,0) b(4,0) c(0,4) */
  const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

  test('object triangle + {x:0.25, y:0.25, w:0.5} → (1,2)이다', () => {
    const out = { x: 0, y: 0 };
    const result = pointFromBarycentricInto(out, tri, { x: 0.25, y: 0.25, w: 0.5 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('tuple triangle input도 같은 결과다', () => {
    const out = { x: 0, y: 0 };
    pointFromBarycentricInto(out, [[0, 0] as const, [4, 0] as const, [0, 4] as const] as const, {
      x: 0.25,
      y: 0.25,
      w: 0.5,
    });
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('mutable tuple output을 보존하고 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = pointFromBarycentricInto(out, tri, { x: 0.25, y: 0.25, w: 0.5 });
    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(1, 10);
    expect(out[1]).toBeCloseTo(2, 10);
  });

  test('degenerate collinear triangle도 weighted sum을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = pointFromBarycentricInto(out, collinear, { x: 0.5, y: 0.25, w: 0.25 });
    // 0.5*(0,0) + 0.25*(2,0) + 0.25*(4,0) = (1.5, 0)
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(1.5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('non-normalized weights {x:1, y:1, w:1}을 normalize하지 않는다', () => {
    const out = { x: 0, y: 0 };
    pointFromBarycentricInto(out, tri, { x: 1, y: 1, w: 1 });
    // 1*(0,0) + 1*(4,0) + 1*(0,4) = (4, 4)
    expect(out.x).toBeCloseTo(4, 10);
    expect(out.y).toBeCloseTo(4, 10);
  });

  test('negative weight를 clamp하지 않는다', () => {
    const out = { x: 0, y: 0 };
    pointFromBarycentricInto(out, tri, { x: 2, y: -0.5, w: -0.5 });
    // 2*(0,0) + (-0.5)*(4,0) + (-0.5)*(0,4) = (-2, -2)
    expect(out.x).toBeCloseTo(-2, 10);
    expect(out.y).toBeCloseTo(-2, 10);
  });

  test('NaN component가 JS 산술 결과로 흐른다', () => {
    const out = { x: 0, y: 0 };
    pointFromBarycentricInto(out, tri, { x: Number.NaN, y: 0.25, w: 0.5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity / -Infinity weight가 JS 산술 결과로 흐른다', () => {
    const out = { x: 0, y: 0 };
    // u=Infinity는 a=(0,0)과 곱해 Infinity*0=NaN을 만든다. out.x=NaN+1+0, out.y=NaN+0+2.
    pointFromBarycentricInto(out, tri, { x: Number.POSITIVE_INFINITY, y: 0.25, w: 0.5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);

    // w=-Infinity는 c=(0,4)와 곱해 out.y에 -Infinity*4=-Infinity를 전파한다. out.x은 -Infinity*0=NaN.
    const out2 = { x: 0, y: 0 };
    pointFromBarycentricInto(out2, tri, { x: 0.25, y: 0.25, w: Number.NEGATIVE_INFINITY });
    expect(Number.isNaN(out2.x)).toBe(true);
    expect(out2.y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('triangle vertex 좌표의 non-finite도 pass-through한다', () => {
    // vertex b.x=Infinity는 v=0.25와 곱해 out.x에 Infinity를 전파한다.
    const out = { x: 0, y: 0 };
    const triInfVertex = { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 }, c: { x: 0, y: 4 } };
    pointFromBarycentricInto(out, triInfVertex, { x: 0.25, y: 0.25, w: 0.5 });
    // out.x = 0.25*0 + 0.25*Infinity + 0.5*0 = Infinity, out.y = 0.25*0 + 0.25*0 + 0.5*4 = 2
    expect(out.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.y).toBeCloseTo(2, 10);

    // vertex a.y=NaN은 u=0.25와 곱해 out.y에 NaN을 전파한다.
    const out2 = { x: 0, y: 0 };
    const triNaNVertex = { a: { x: 0, y: Number.NaN }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
    pointFromBarycentricInto(out2, triNaNVertex, { x: 0.25, y: 0.25, w: 0.5 });
    // out.x = 0.25*0 + 0.25*4 + 0.5*0 = 1, out.y = 0.25*NaN + 0.25*0 + 0.5*4 = NaN
    expect(out2.x).toBeCloseTo(1, 10);
    expect(Number.isNaN(out2.y)).toBe(true);
  });

  test('aliasing: out이 triangle.a storage여도 정확하다', () => {
    const shared = { x: 0, y: 0 };
    const aliased = { a: shared, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
    const result = pointFromBarycentricInto(shared, aliased, { x: 0.25, y: 0.25, w: 0.5 });
    expect(result).toBe(shared);
    expect(shared.x).toBeCloseTo(1, 10);
    expect(shared.y).toBeCloseTo(2, 10);
  });

  test('round-trip: barycentric 결과를 다시 넣으면 원래 point다', () => {
    const point = { x: 1.3, y: 2.7 };
    const bary = barycentricInto({ x: 0, y: 0, w: 0 }, tri, point);
    expect(bary).not.toBe(false);
    if (bary === false) return;
    const out = { x: 0, y: 0 };
    pointFromBarycentricInto(out, tri, bary);
    expect(out.x).toBeCloseTo(point.x, 10);
    expect(out.y).toBeCloseTo(point.y, 10);
  });
});

describe('pointFromBarycentric', () => {
  const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

  test('새 {x, y} plain object를 반환한다', () => {
    const result = pointFromBarycentric(tri, { x: 0.25, y: 0.25, w: 0.5 });
    expect(result).toEqual({ x: expect.closeTo(1, 10), y: expect.closeTo(2, 10) });
  });

  test('degenerate triangle도 weighted point를 반환한다', () => {
    const result = pointFromBarycentric(collinear, { x: 0.5, y: 0.25, w: 0.25 });
    expect(result).not.toBeUndefined();
    expect(result.x).toBeCloseTo(1.5, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });
});
