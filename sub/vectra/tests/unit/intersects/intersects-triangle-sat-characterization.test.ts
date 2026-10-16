/**
 * triangle SAT 판정 3종의 출력을 고정하는 characterization test.
 *
 * 대상은 intersectsTriangleTriangle, intersectsRectTriangle, intersectsBoundsTriangle이다.
 * 판정 로직을 internal kernel로 모으는 리팩터링이 출력을 바꾸지 않는지 확인하는 안전망이다.
 * 구성은 두 가지다.
 * - fixture: 정책 차이(빈 도형, 폭 0 bounds)와 NaN/Infinity 입력의 현재 출력을 값으로 고정한다.
 * - oracle fuzz: 리팩터링 전 구현 사본과 현재 구현을 고정 seed 랜덤 입력으로 비교한다.
 *
 * 정책 차이는 일부러 통일하지 않는다. rect는 width/height <= 0이면 false이고,
 * bounds는 max < min일 때만 false라서 폭 0 bounds는 통과한다.
 */

import { describe, expect, test } from 'vitest';
import { readBoundsMax, readBoundsMin } from '../../../src/internal/bounds';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../../../src/internal/rect';
import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../../../src/internal/triangle';
import { readX, readY } from '../../../src/internal/xy';
import { intersectsBoundsTriangle } from '../../../src/intersects/intersects-bounds-triangle';
import { intersectsRectTriangle } from '../../../src/intersects/intersects-rect-triangle';
import { intersectsTriangleTriangle } from '../../../src/intersects/intersects-triangle-triangle';
import type { BoundsLike, RectLike, TriangleLike } from '../../../src/types';

/**
 * 리팩터링 전 intersectsTriangleTriangle 구현 사본.
 * 튜플 배열과 6축 루프를 그대로 둔다. 수정하지 않는다.
 */
function oracleTriangleTriangle(a: TriangleLike, b: TriangleLike): boolean {
  if (hasNonFiniteVertex(a) || triangleSignedArea2x(a) === 0) return false;
  if (hasNonFiniteVertex(b) || triangleSignedArea2x(b) === 0) return false;

  const { ax: ax1, ay: ay1, bx: bx1, by: by1, cx: cx1, cy: cy1 } = readTriangleRawCoords(a);
  const { ax: ax2, ay: ay2, bx: bx2, by: by2, cx: cx2, cy: cy2 } = readTriangleRawCoords(b);
  const aVerts: [number, number][] = [
    [ax1, ay1],
    [bx1, by1],
    [cx1, cy1],
  ];
  const bVerts: [number, number][] = [
    [ax2, ay2],
    [bx2, by2],
    [cx2, cy2],
  ];
  const axes: [number, number][] = [
    [-(by1 - ay1), bx1 - ax1],
    [-(cy1 - by1), cx1 - bx1],
    [-(ay1 - cy1), ax1 - cx1],
    [-(by2 - ay2), bx2 - ax2],
    [-(cy2 - by2), cx2 - bx2],
    [-(ay2 - cy2), ax2 - cx2],
  ];

  for (const [nx, ny] of axes) {
    let minA = Infinity;
    let maxA = -Infinity;
    for (const [vx, vy] of aVerts) {
      const p = vx * nx + vy * ny;
      if (p < minA) minA = p;
      if (p > maxA) maxA = p;
    }
    let minB = Infinity;
    let maxB = -Infinity;
    for (const [vx, vy] of bVerts) {
      const p = vx * nx + vy * ny;
      if (p < minB) minB = p;
      if (p > maxB) maxB = p;
    }
    if (maxA < minB || maxB < minA) return false;
  }

  return true;
}

/**
 * 리팩터링 전 intersectsRectTriangle 구현 사본.
 * 빈 rect guard, AABB 조기 반환, 삼각형 변 법선 3축 순서를 그대로 둔다.
 */
function oracleRectTriangle(rect: RectLike, triangle: TriangleLike): boolean {
  if (hasNonFiniteVertex(triangle) || triangleSignedArea2x(triangle) === 0) return false;

  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;

  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const rx2 = rx + rw;
  const ry2 = ry + rh;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const rectVerts: [number, number][] = [
    [rx, ry],
    [rx2, ry],
    [rx2, ry2],
    [rx, ry2],
  ];
  const triVerts: [number, number][] = [
    [ax, ay],
    [bx, by],
    [cx, cy],
  ];

  const triMinX = Math.min(ax, bx, cx);
  const triMaxX = Math.max(ax, bx, cx);
  if (triMaxX < rx || rx2 < triMinX) return false;
  const triMinY = Math.min(ay, by, cy);
  const triMaxY = Math.max(ay, by, cy);
  if (triMaxY < ry || ry2 < triMinY) return false;

  const triEdges: [number, number][] = [
    [-(by - ay), bx - ax],
    [-(cy - by), cx - bx],
    [-(ay - cy), ax - cx],
  ];

  for (const [nx, ny] of triEdges) {
    let minTri = Infinity;
    let maxTri = -Infinity;
    for (const [vx, vy] of triVerts) {
      const p = vx * nx + vy * ny;
      if (p < minTri) minTri = p;
      if (p > maxTri) maxTri = p;
    }
    let minRect = Infinity;
    let maxRect = -Infinity;
    for (const [vx, vy] of rectVerts) {
      const p = vx * nx + vy * ny;
      if (p < minRect) minRect = p;
      if (p > maxRect) maxRect = p;
    }
    if (maxTri < minRect || maxRect < minTri) return false;
  }

  return true;
}

/**
 * 리팩터링 전 intersectsBoundsTriangle 구현 사본.
 * inverted bounds guard와 AABB 조기 반환, 삼각형 변 법선 3축 순서를 그대로 둔다.
 */
function oracleBoundsTriangle(bounds: BoundsLike, triangle: TriangleLike): boolean {
  if (hasNonFiniteVertex(triangle) || triangleSignedArea2x(triangle) === 0) return false;

  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  if (maxX < minX || maxY < minY) return false;

  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const boundsVerts: [number, number][] = [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
  const triVerts: [number, number][] = [
    [ax, ay],
    [bx, by],
    [cx, cy],
  ];

  const triMinX = Math.min(ax, bx, cx);
  const triMaxX = Math.max(ax, bx, cx);
  if (triMaxX < minX || maxX < triMinX) return false;
  const triMinY = Math.min(ay, by, cy);
  const triMaxY = Math.max(ay, by, cy);
  if (triMaxY < minY || maxY < triMinY) return false;

  const triEdges: [number, number][] = [
    [-(by - ay), bx - ax],
    [-(cy - by), cx - bx],
    [-(ay - cy), ax - cx],
  ];

  for (const [nx, ny] of triEdges) {
    let minTri = Infinity;
    let maxTri = -Infinity;
    for (const [vx, vy] of triVerts) {
      const p = vx * nx + vy * ny;
      if (p < minTri) minTri = p;
      if (p > maxTri) maxTri = p;
    }
    let minBounds = Infinity;
    let maxBounds = -Infinity;
    for (const [vx, vy] of boundsVerts) {
      const p = vx * nx + vy * ny;
      if (p < minBounds) minBounds = p;
      if (p > maxBounds) maxBounds = p;
    }
    if (maxTri < minBounds || maxBounds < minTri) return false;
  }

  return true;
}

/**
 * 고정 seed 의사 난수 생성기(mulberry32)를 만든다.
 * 실행마다 같은 입력열이 나와야 하므로 Math.random을 쓰지 않는다.
 */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** fuzz 좌표에 섞는 특수 값. 접촉과 비유한 입력을 자주 만들려는 목적이다. */
const SPECIAL_VALUES = [Number.NaN, Infinity, -Infinity, -0, 0];

/**
 * fuzz용 좌표 하나를 뽑는다.
 * 정수 격자 값이 대부분이라 접촉, 포함, collinear가 자주 나온다.
 * 일부는 실수 값이고, 일부는 NaN/Infinity/-Infinity/-0이다.
 */
function pickCoord(rng: () => number): number {
  const r = rng();
  if (r < 0.04) return SPECIAL_VALUES[Math.floor(rng() * SPECIAL_VALUES.length)];
  if (r < 0.25) return (rng() - 0.5) * 20;
  return Math.floor(rng() * 11) - 5;
}

/**
 * fuzz용 삼각형을 뽑는다. 객체 형태와 tuple 형태를 섞는다.
 * 일부는 b, c를 a의 일차 결합으로 만들어 degenerate triangle을 보장한다.
 */
function pickTriangle(rng: () => number): TriangleLike {
  const ax = pickCoord(rng);
  const ay = pickCoord(rng);
  let bx = pickCoord(rng);
  let by = pickCoord(rng);
  let cx = pickCoord(rng);
  let cy = pickCoord(rng);
  if (rng() < 0.08) {
    const t = Math.floor(rng() * 5) - 2;
    cx = ax + t * (bx - ax);
    cy = ay + t * (by - ay);
  }
  if (rng() < 0.03) {
    bx = ax;
    by = ay;
  }
  if (rng() < 0.5) {
    return { a: { x: ax, y: ay }, b: { x: bx, y: by }, c: { x: cx, y: cy } };
  }
  return [
    { x: ax, y: ay },
    { x: bx, y: by },
    { x: cx, y: cy },
  ] as TriangleLike;
}

/**
 * fuzz용 rect를 뽑는다. width/height는 0, 음수, NaN, Infinity도 나온다.
 */
function pickRect(rng: () => number): RectLike {
  const dim = () => {
    const r = rng();
    if (r < 0.05) return SPECIAL_VALUES[Math.floor(rng() * SPECIAL_VALUES.length)];
    if (r < 0.15) return -(Math.floor(rng() * 4) + 1);
    if (r < 0.3) return 0;
    return Math.floor(rng() * 8) + rng() * 0.5;
  };
  return { x: pickCoord(rng), y: pickCoord(rng), width: dim(), height: dim() };
}

/**
 * fuzz용 bounds를 뽑는다. 좌표를 독립으로 뽑으므로 inverted, 폭 0, NaN bounds가 모두 나온다.
 */
function pickBounds(rng: () => number): BoundsLike {
  const x1 = pickCoord(rng);
  const y1 = pickCoord(rng);
  const x2 = rng() < 0.15 ? x1 : pickCoord(rng);
  const y2 = rng() < 0.15 ? y1 : pickCoord(rng);
  if (rng() < 0.7) {
    return { min: { x: Math.min(x1, x2), y: Math.min(y1, y2) }, max: { x: Math.max(x1, x2), y: Math.max(y1, y2) } };
  }
  return { min: { x: x1, y: y1 }, max: { x: x2, y: y2 } };
}

/**
 * 입력 한 건을 직렬화한다. 불일치 시 재현 가능한 메시지를 남기려는 목적이다.
 */
function describeInput(value: unknown): string {
  return JSON.stringify(value, (_key, v) => (typeof v === 'number' && !Number.isFinite(v) ? String(v) : v));
}

const REF_TRIANGLE = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
const FAR_TRIANGLE = { a: { x: 100, y: 100 }, b: { x: 104, y: 100 }, c: { x: 100, y: 104 } };

describe('triangle SAT characterization — intersectsTriangleTriangle fixture', () => {
  test('끝점 하나만 공유하면 true를 반환한다', () => {
    const other = { a: { x: 4, y: 0 }, b: { x: 8, y: 0 }, c: { x: 8, y: 4 } };
    expect(intersectsTriangleTriangle(REF_TRIANGLE, other)).toBe(true);
  });

  test('edge가 맞닿으면 true를 반환한다', () => {
    const other = { a: { x: 4, y: 0 }, b: { x: 0, y: 4 }, c: { x: 4, y: 4 } };
    expect(intersectsTriangleTriangle(REF_TRIANGLE, other)).toBe(true);
  });

  test('틈이 있으면 false를 반환한다', () => {
    const other = { a: { x: 4.5, y: 0 }, b: { x: 0, y: 4.5 }, c: { x: 4.5, y: 4.5 } };
    expect(intersectsTriangleTriangle(REF_TRIANGLE, other)).toBe(false);
  });

  test('한쪽이 다른 쪽을 포함하면 인자 순서와 무관하게 true를 반환한다', () => {
    const inner = { a: { x: 0.5, y: 0.5 }, b: { x: 1, y: 0.5 }, c: { x: 0.5, y: 1 } };
    expect(intersectsTriangleTriangle(REF_TRIANGLE, inner)).toBe(true);
    expect(intersectsTriangleTriangle(inner, REF_TRIANGLE)).toBe(true);
  });

  test('tuple 형태 triangle도 같은 결과를 낸다', () => {
    const tuple = [
      { x: 3, y: 0 },
      { x: 7, y: 0 },
      { x: 3, y: 4 },
    ] as TriangleLike;
    expect(intersectsTriangleTriangle(REF_TRIANGLE, tuple)).toBe(true);
  });

  test('degenerate나 non-finite triangle이 한쪽에라도 있으면 false를 반환한다', () => {
    const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    const withNaN = { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
    const withInfinity = { a: { x: 0, y: 0 }, b: { x: Infinity, y: 0 }, c: { x: 0, y: 4 } };
    expect(intersectsTriangleTriangle(REF_TRIANGLE, collinear)).toBe(false);
    expect(intersectsTriangleTriangle(collinear, REF_TRIANGLE)).toBe(false);
    expect(intersectsTriangleTriangle(REF_TRIANGLE, withNaN)).toBe(false);
    expect(intersectsTriangleTriangle(withNaN, REF_TRIANGLE)).toBe(false);
    expect(intersectsTriangleTriangle(REF_TRIANGLE, withInfinity)).toBe(false);
    expect(intersectsTriangleTriangle(withInfinity, REF_TRIANGLE)).toBe(false);
  });
});

describe('triangle SAT characterization — intersectsRectTriangle fixture', () => {
  test('모서리 한 점만 닿으면 true를 반환한다', () => {
    expect(intersectsRectTriangle({ x: 2, y: 2, width: 1, height: 1 }, REF_TRIANGLE)).toBe(true);
  });

  test('빗변 바깥으로 살짝 벗어나면 false를 반환한다', () => {
    expect(intersectsRectTriangle({ x: 2.1, y: 2, width: 1, height: 1 }, REF_TRIANGLE)).toBe(false);
  });

  test('AABB는 겹치지만 변 법선 축에서 분리되면 false를 반환한다', () => {
    expect(intersectsRectTriangle({ x: 3, y: 3, width: 1, height: 1 }, REF_TRIANGLE)).toBe(false);
  });

  test('rect가 triangle을 포함하거나 triangle이 rect를 포함하면 true를 반환한다', () => {
    expect(intersectsRectTriangle({ x: -1, y: -1, width: 10, height: 10 }, REF_TRIANGLE)).toBe(true);
    expect(intersectsRectTriangle({ x: 0.5, y: 0.5, width: 1, height: 1 }, REF_TRIANGLE)).toBe(true);
  });

  test('빈 rect는 width 또는 height가 0 이하이면 false를 반환한다', () => {
    expect(intersectsRectTriangle({ x: 0, y: 0, width: 0, height: 1 }, REF_TRIANGLE)).toBe(false);
    expect(intersectsRectTriangle({ x: 0, y: 0, width: 1, height: 0 }, REF_TRIANGLE)).toBe(false);
    expect(intersectsRectTriangle({ x: 0, y: 0, width: -1, height: 1 }, REF_TRIANGLE)).toBe(false);
    expect(intersectsRectTriangle({ x: 0, y: 0, width: 1, height: -1 }, REF_TRIANGLE)).toBe(false);
  });

  test('degenerate나 non-finite triangle이면 false를 반환한다', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    const withNaN = { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
    expect(intersectsRectTriangle(rect, collinear)).toBe(false);
    expect(intersectsRectTriangle(rect, withNaN)).toBe(false);
  });

  test('width가 NaN인 rect는 AABB 비교가 모두 false라 true를 반환한다', () => {
    expect(intersectsRectTriangle({ x: 0, y: 0, width: Number.NaN, height: 1 }, REF_TRIANGLE)).toBe(true);
  });

  test('x가 NaN인 rect는 false를 반환한다', () => {
    expect(intersectsRectTriangle({ x: Number.NaN, y: 0, width: 1, height: 1 }, REF_TRIANGLE)).toBe(false);
  });

  test('width가 Infinity인 rect는 먼 triangle과 false를 반환한다', () => {
    expect(intersectsRectTriangle({ x: 0, y: 0, width: Infinity, height: 1 }, FAR_TRIANGLE)).toBe(false);
  });
});

describe('triangle SAT characterization — intersectsBoundsTriangle fixture', () => {
  test('모서리 한 점만 닿으면 true를 반환한다', () => {
    expect(intersectsBoundsTriangle({ min: { x: 2, y: 2 }, max: { x: 3, y: 3 } }, REF_TRIANGLE)).toBe(true);
  });

  test('변 법선 축에서 분리되면 false를 반환한다', () => {
    expect(intersectsBoundsTriangle({ min: { x: 3, y: 3 }, max: { x: 4, y: 4 } }, REF_TRIANGLE)).toBe(false);
  });

  test('inverted bounds는 false를 반환한다', () => {
    expect(intersectsBoundsTriangle({ min: { x: 3, y: 0 }, max: { x: 1, y: 1 } }, REF_TRIANGLE)).toBe(false);
    expect(intersectsBoundsTriangle({ min: { x: 0, y: 3 }, max: { x: 1, y: 1 } }, REF_TRIANGLE)).toBe(false);
  });

  test('폭 0 bounds는 rect와 달리 통과해 true를 반환한다', () => {
    expect(intersectsBoundsTriangle({ min: { x: 1, y: 0 }, max: { x: 1, y: 1 } }, REF_TRIANGLE)).toBe(true);
    expect(intersectsBoundsTriangle({ min: { x: 1, y: 1 }, max: { x: 1, y: 1 } }, REF_TRIANGLE)).toBe(true);
  });

  test('폭 0 bounds가 triangle 밖에 있으면 false를 반환한다', () => {
    expect(intersectsBoundsTriangle({ min: { x: 3, y: 3 }, max: { x: 3, y: 3 } }, REF_TRIANGLE)).toBe(false);
  });

  test('degenerate triangle이면 false를 반환한다', () => {
    const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(intersectsBoundsTriangle({ min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, collinear)).toBe(false);
  });

  test('min.x가 NaN인 bounds는 가까운 triangle과 true를 반환한다', () => {
    const bounds = { min: { x: Number.NaN, y: 0 }, max: { x: 1, y: 1 } };
    expect(intersectsBoundsTriangle(bounds, REF_TRIANGLE)).toBe(true);
  });

  test('min.x가 NaN인 bounds는 먼 triangle과 false를 반환한다', () => {
    const bounds = { min: { x: Number.NaN, y: 0 }, max: { x: 1, y: 1 } };
    expect(intersectsBoundsTriangle(bounds, FAR_TRIANGLE)).toBe(false);
  });
});

describe('triangle SAT characterization — oracle fuzz', () => {
  const CASES = 20000;

  test('triangle-triangle은 oracle과 모든 입력에서 같다', () => {
    const rng = createRng(0x5a7a01);
    const mismatches: string[] = [];
    let trueCount = 0;
    for (let i = 0; i < CASES; i++) {
      const a = pickTriangle(rng);
      const b = pickTriangle(rng);
      const expected = oracleTriangleTriangle(a, b);
      if (expected) trueCount++;
      if (intersectsTriangleTriangle(a, b) !== expected) mismatches.push(describeInput({ a, b, expected }));
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
    expect(trueCount).toBeGreaterThan(CASES * 0.1);
    expect(trueCount).toBeLessThan(CASES * 0.9);
  });

  test('rect-triangle은 oracle과 모든 입력에서 같다', () => {
    const rng = createRng(0x5a7a02);
    const mismatches: string[] = [];
    let trueCount = 0;
    for (let i = 0; i < CASES; i++) {
      const rect = pickRect(rng);
      const triangle = pickTriangle(rng);
      const expected = oracleRectTriangle(rect, triangle);
      if (expected) trueCount++;
      if (intersectsRectTriangle(rect, triangle) !== expected) {
        mismatches.push(describeInput({ rect, triangle, expected }));
      }
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
    expect(trueCount).toBeGreaterThan(CASES * 0.05);
    expect(trueCount).toBeLessThan(CASES * 0.9);
  });

  test('bounds-triangle은 oracle과 모든 입력에서 같다', () => {
    const rng = createRng(0x5a7a03);
    const mismatches: string[] = [];
    let trueCount = 0;
    for (let i = 0; i < CASES; i++) {
      const bounds = pickBounds(rng);
      const triangle = pickTriangle(rng);
      const expected = oracleBoundsTriangle(bounds, triangle);
      if (expected) trueCount++;
      if (intersectsBoundsTriangle(bounds, triangle) !== expected) {
        mismatches.push(describeInput({ bounds, triangle, expected }));
      }
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
    expect(trueCount).toBeGreaterThan(CASES * 0.05);
    expect(trueCount).toBeLessThan(CASES * 0.9);
  });
});
