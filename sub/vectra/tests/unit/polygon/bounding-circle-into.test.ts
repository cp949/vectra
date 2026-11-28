/**
 * polygon boundingCircleInto와 boundingCircle의 외접원 출력을 확인하는 테스트.
 * empty와 degenerate 입력, 결과 정확도, out 기록 방식을 다룬다.
 */
import type { CircleWritable, Polygon, PointWritable } from '../../../src/types/flat-shapes.internal';
import { describe, expect, test } from 'vitest';
import { boundingCircle } from '../../../src/polygon/bounding-circle';
import { boundingCircleInto } from '../../../src/polygon/bounding-circle-into';

// ─────────────────────────────────────────────────────────────────────────────
// 공통 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: Polygon = [];
const SINGLE: Polygon = [3, 4];
const TWO_PT: Polygon = [0, 0, 4, 0];

// 단위 정사각형
const UNIT_SQUARE: Polygon = [0, 0, 1, 0, 1, 1, 0, 1];

// 정삼각형 (변 길이 2, 중심 원점)
const EQ_TRIANGLE: Polygon = [0, 2, -Math.sqrt(3), -1, Math.sqrt(3), -1];

/**
 * polygon의 모든 vertex가 허용 오차 안에서 원 안에 있는지 확인한다.
 * 근사 외접원의 정확한 반지름 대신 포함 조건을 검증할 때 쓴다.
 */
function allPointsInCircle(polygon: Polygon, cx: number, cy: number, r: number, tol = 1e-9): boolean {
  for (let i = 0; i < polygon.length; i += 2) {
    const px = polygon[i];
    const py = polygon[i + 1];
    const dx = px - cx;
    const dy = py - cy;
    if (Math.sqrt(dx * dx + dy * dy) > r + tol) return false;
  }
  return true;
}

/**
 * boundingCircleInto에 넘길 0 circle seed를 만든다.
 * 테스트마다 새 객체를 써서 이전 기록이 섞이지 않게 한다.
 */
function makeCircleOut(): CircleWritable {
  return { cx: 0, cy: 0, r: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// empty / degenerate polygon
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircleInto (empty/degenerate)', () => {
  test('empty polygon은 center=(0,0), radius=0을 기록한다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, EMPTY);
    expect(out).toEqual({ cx: 0, cy: 0, r: 0 });
    expect(out.r).toBe(0);
  });

  test('단일 점 polygon은 center=해당점, radius=0을 기록한다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, SINGLE);
    expect(out.cx).toBeCloseTo(3, 9);
    expect(out.cy).toBeCloseTo(4, 9);
    expect(out.r).toBeCloseTo(0, 9);
  });

  test('2점 polygon은 두 점을 모두 포함하는 원을 기록한다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, TWO_PT);
    expect(allPointsInCircle(TWO_PT, out.cx, out.cy, out.r)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// correctness — 모든 점이 원 안에 있어야 한다
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircleInto (correctness)', () => {
  test('단위 정사각형 모든 점이 원 안에 있다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, UNIT_SQUARE);
    expect(allPointsInCircle(UNIT_SQUARE, out.cx, out.cy, out.r)).toBe(true);
    expect(out.r).toBeGreaterThan(0);
  });

  test('정삼각형 모든 점이 원 안에 있다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, EQ_TRIANGLE);
    expect(allPointsInCircle(EQ_TRIANGLE, out.cx, out.cy, out.r)).toBe(true);
  });

  test('단위 정사각형 radius는 양수이다', () => {
    const out = makeCircleOut();
    boundingCircleInto(out, UNIT_SQUARE);
    // Ritter는 근사 알고리즘이므로 최적값(sqrt(2)/2≈0.707) 보다 클 수 있다
    expect(out.r).toBeGreaterThan(0);
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
});

// ─────────────────────────────────────────────────────────────────────────────
// boundingCircle companion
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundingCircle', () => {
  test('empty polygon은 { cx: 0, cy: 0, r: 0 }을 반환한다', () => {
    const result = boundingCircle(EMPTY);
    expect(result).toEqual({ cx: 0, cy: 0, r: 0 });
    expect(result.r).toBe(0);
  });

  test('단위 정사각형 모든 점이 원 안에 있다', () => {
    const { cx, cy, r } = boundingCircle(UNIT_SQUARE);
    expect(allPointsInCircle(UNIT_SQUARE, cx, cy, r)).toBe(true);
  });

  test('반환값은 새로운 plain object이다', () => {
    const r1 = boundingCircle(UNIT_SQUARE);
    const r2 = boundingCircle(UNIT_SQUARE);
    expect(r1).not.toBe(r2);
  });
});
