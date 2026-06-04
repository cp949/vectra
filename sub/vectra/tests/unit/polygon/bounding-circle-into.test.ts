import { describe, expect, test } from 'vitest';
import { boundingCircle } from '../../../src/polygon/bounding-circle';
import { boundingCircleInto } from '../../../src/polygon/bounding-circle-into';
import type { CircleWritable, PolygonLike, XYObjectWritable } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공통 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolygonLike = { points: [] };
const SINGLE: PolygonLike = { points: [{ x: 3, y: 4 }] };
const TWO_PT: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
  ],
};

// 단위 정사각형
const UNIT_SQUARE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
};

// 정삼각형 (변 길이 2, 중심 원점)
const EQ_TRIANGLE: PolygonLike = {
  points: [
    { x: 0, y: 2 },
    { x: -Math.sqrt(3), y: -1 },
    { x: Math.sqrt(3), y: -1 },
  ],
};

/** 모든 점이 원 안에 있는지 검증하는 helper */
function allPointsInCircle(polygon: PolygonLike, cx: number, cy: number, r: number, tol = 1e-9): boolean {
  const pts = Array.isArray(polygon) ? polygon : (polygon as { points: { x: number; y: number }[] }).points;
  for (const p of pts) {
    const px = Array.isArray(p) ? p[0] : (p as { x: number; y: number }).x;
    const py = Array.isArray(p) ? p[1] : (p as { x: number; y: number }).y;
    const dx = px - cx;
    const dy = py - cy;
    if (Math.sqrt(dx * dx + dy * dy) > r + tol) return false;
  }
  return true;
}

function makeCircleOut(): CircleWritable<XYObjectWritable> {
  return { center: { x: 0, y: 0 }, radius: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// empty / degenerate polygon
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircleInto (empty/degenerate)', () => {
  test('empty polygon은 center=(0,0), radius=0을 기록한다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, EMPTY);
    expect(out.center).toEqual({ x: 0, y: 0 });
    expect(out.radius).toBe(0);
  });

  test('단일 점 polygon은 center=해당점, radius=0을 기록한다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, SINGLE);
    expect(out.center.x).toBeCloseTo(3, 9);
    expect(out.center.y).toBeCloseTo(4, 9);
    expect(out.radius).toBeCloseTo(0, 9);
  });

  test('2점 polygon은 두 점을 모두 포함하는 원을 기록한다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, TWO_PT);
    expect(allPointsInCircle(TWO_PT, out.center.x, out.center.y, out.radius)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// correctness — 모든 점이 원 안에 있어야 한다
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircleInto (correctness)', () => {
  test('단위 정사각형 모든 점이 원 안에 있다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, UNIT_SQUARE);
    expect(allPointsInCircle(UNIT_SQUARE, out.center.x, out.center.y, out.radius)).toBe(true);
    expect(out.radius).toBeGreaterThan(0);
  });

  test('정삼각형 모든 점이 원 안에 있다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, EQ_TRIANGLE);
    expect(allPointsInCircle(EQ_TRIANGLE, out.center.x, out.center.y, out.radius)).toBe(true);
  });

  test('단위 정사각형 radius는 양수이다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, UNIT_SQUARE);
    // Ritter는 근사 알고리즘이므로 최적값(sqrt(2)/2≈0.707) 보다 클 수 있다
    expect(out.radius).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// out 반환 및 mutation
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircleInto (out mutation)', () => {
  test('반환값이 out의 동일 참조이다', () => {
    const out = makeCircleOut();
    const result = boundingCircleInto(out, UNIT_SQUARE);
    expect(result).toBe(out);
  });

  test('out.center object reference를 mutation한다', () => {
    const centerPt: XYObjectWritable = { x: 99, y: 99 };
    const out: CircleWritable<XYObjectWritable> = { center: centerPt, radius: 0 };
    boundingCircleInto(out, UNIT_SQUARE);
    expect(out.center).toBe(centerPt);
    expect(centerPt.x).not.toBe(99);
  });

  test('tuple center out에 기록한다', () => {
    const out = { center: [0, 0] as [number, number], radius: 0 };
    boundingCircleInto(out, UNIT_SQUARE);
    // 정확한 center 값은 알고리즘 의존이므로 기록 여부와 radius만 확인한다
    expect(typeof out.center[0]).toBe('number');
    expect(typeof out.center[1]).toBe('number');
    expect(out.radius).toBeGreaterThan(0);
    // 단위 정사각형 모든 vertex가 원 안에 있다
    const pts = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    for (const [px, py] of pts) {
      const dx = px - out.center[0];
      const dy = py - out.center[1];
      expect(Math.sqrt(dx * dx + dy * dy)).toBeLessThanOrEqual(out.radius + 1e-9);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tuple point input
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircleInto (tuple input)', () => {
  test('tuple point 입력을 지원한다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, {
      points: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    });
    expect(allPointsInCircle(UNIT_SQUARE, out.center.x, out.center.y, out.radius)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// boundingCircle companion
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircle', () => {
  test('empty polygon은 { center: {x:0,y:0}, radius: 0 }을 반환한다', () => {
    const result = boundingCircle(EMPTY);
    expect(result.center).toEqual({ x: 0, y: 0 });
    expect(result.radius).toBe(0);
  });

  test('단위 정사각형 모든 점이 원 안에 있다', () => {
    const { center, radius } = boundingCircle(UNIT_SQUARE);
    expect(allPointsInCircle(UNIT_SQUARE, center.x, center.y, radius)).toBe(true);
  });

  test('반환값은 새로운 plain object이다', () => {
    const r1 = boundingCircle(UNIT_SQUARE);
    const r2 = boundingCircle(UNIT_SQUARE);
    expect(r1).not.toBe(r2);
    expect(r1.center).not.toBe(r2.center);
  });
});
