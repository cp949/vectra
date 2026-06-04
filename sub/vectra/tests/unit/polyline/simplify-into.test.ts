/**
 * simplifyInto unit test.
 *
 * Ramer-Douglas-Peucker 기반 polyline 단순화 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { simplifyInto } from '../../../src/polyline/simplify-into';
import type { PolylineLike, XYObjectWritable } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공용 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolylineLike = { points: [] };
const SINGLE: PolylineLike = { points: [{ x: 1, y: 2 }] };
const TWO_PT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ],
};

/** x축 위 직선 4점 — 중간 점들은 모두 tolerance 1.0 이내 */
const COLLINEAR: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 7, y: 0 },
    { x: 10, y: 0 },
  ],
};

/** 직각 꺾임: 제거되면 안 되는 vertex 포함 */
const L_SHAPE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 5 },
  ],
};

/** 직선 위 근사점 포함 (약간 벗어남) */
const NEAR_LINE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 5, y: 0.5 }, // 직선에서 0.5 벗어남
    { x: 10, y: 0 },
  ],
};

function makeOut(): XYObjectWritable[] {
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// 입력 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline simplify - simplifyInto 입력 검증', () => {
  test('tolerance < 0이면 RangeError를 던진다', () => {
    expect(() => simplifyInto([], COLLINEAR, -0.1)).toThrow(RangeError);
    expect(() => simplifyInto([], COLLINEAR, -1)).toThrow(RangeError);
  });

  test('tolerance === 0은 허용한다', () => {
    expect(() => simplifyInto([], COLLINEAR, 0)).not.toThrow();
  });

  test('tolerance 미지정이면 기본값 1.0을 사용한다', () => {
    const out = makeOut();
    // NEAR_LINE: 중간점이 0.5 벗어남, tolerance 1.0이면 제거된다
    simplifyInto(out, NEAR_LINE);
    expect(out).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// edge-case
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline simplify - simplifyInto edge-case', () => {
  test('empty polyline은 outPoints를 비우고 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    const result = simplifyInto(out, EMPTY);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 그 점 1개만 반환한다', () => {
    const out = makeOut();
    simplifyInto(out, SINGLE);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 1, y: 2 });
  });

  test('2점 polyline은 항상 2점을 반환한다', () => {
    const out = makeOut();
    simplifyInto(out, TWO_PT);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 10, y: 0 });
  });

  test('반환값이 outPoints 자체다', () => {
    const out = makeOut();
    const result = simplifyInto(out, COLLINEAR);
    expect(result).toBe(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 동일선상 점 제거
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline simplify - simplifyInto 동일선상', () => {
  test('동일선상 중간점은 tolerance 1.0에서 제거된다', () => {
    const out = makeOut();
    simplifyInto(out, COLLINEAR, 1.0);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 10, y: 0 });
  });

  test('tolerance 0에서 동일선상 점은 제거된다(수직 거리 = 0 <= 0)', () => {
    const out = makeOut();
    simplifyInto(out, COLLINEAR, 0);
    // tolerance=0: distSq > 0 조건이므로 정확히 직선 위 점은 제거된다
    expect(out).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 꺾임점 유지
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline simplify - simplifyInto 꺾임점 유지', () => {
  test('직각 꺾임은 중간점이 유지된다', () => {
    const out = makeOut();
    simplifyInto(out, L_SHAPE, 1.0);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 5, y: 0 });
    expect(out[2]).toEqual({ x: 5, y: 5 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tolerance에 따른 점 수 변화
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline simplify - simplifyInto tolerance', () => {
  test('tolerance가 크면 중간점 수가 줄어든다', () => {
    const out1 = makeOut();
    const out2 = makeOut();
    simplifyInto(out1, NEAR_LINE, 0.1); // 중간점 0.5 > 0.1, 유지
    simplifyInto(out2, NEAR_LINE, 1.0); // 중간점 0.5 < 1.0, 제거
    expect(out1).toHaveLength(3);
    expect(out2).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// outPoints clear 및 aliasing
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline simplify - simplifyInto outPoints clear', () => {
  test('기존 outPoints 내용이 clear된다', () => {
    const out: XYObjectWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    simplifyInto(out, COLLINEAR);
    expect(out).toHaveLength(2);
  });

  test('점 배열 자체를 PolylineLike로 사용할 수 있다', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
    ];
    const out = makeOut();
    simplifyInto(out, pts, 1.0);
    expect(out).toHaveLength(2);
  });
});
