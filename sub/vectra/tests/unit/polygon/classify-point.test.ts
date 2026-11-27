/** 다각형 계산과 출력 계약을 검증한다. */
import type { Polygon } from '../../../src/types/flat-shapes.internal';
import { describe, expect, test } from 'vitest';
import { classifyPoint } from '../../../src/polygon/classify-point';

// ─────────────────────────────────────────────────────────────────────────────
// 공통 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: Polygon = [];
const TWO_PT: Polygon = [0, 0, 1, 0];

// 단위 정사각형 (0,0)–(1,0)–(1,1)–(0,1)
const UNIT_SQUARE: Polygon = [0, 0, 1, 0, 1, 1, 0, 1];

// 3-4-5 직각삼각형
const TRIANGLE: Polygon = [0, 0, 4, 0, 0, 3];

// ─────────────────────────────────────────────────────────────────────────────
// empty / degenerate polygon
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon classify - empty/degenerate', () => {
  test('empty polygon(0점)은 outside를 반환한다', () => {
    expect(classifyPoint(EMPTY, { x: 0, y: 0 })).toBe('outside');
  });

  test('2점 polygon은 outside를 반환한다', () => {
    expect(classifyPoint(TWO_PT, { x: 0.5, y: 0 })).toBe('outside');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// epsilon validation
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon classify - epsilon validation', () => {
  test('epsilon < 0이면 RangeError를 던진다', () => {
    expect(() => classifyPoint(UNIT_SQUARE, { x: 0.5, y: 0.5 }, -1)).toThrow(RangeError);
  });

  test('epsilon = 0은 유효하다', () => {
    expect(() => classifyPoint(UNIT_SQUARE, { x: 0.5, y: 0.5 }, 0)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// inside
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon classify - inside', () => {
  test('단위 정사각형 중심은 inside이다', () => {
    expect(classifyPoint(UNIT_SQUARE, { x: 0.5, y: 0.5 })).toBe('inside');
  });

  test('삼각형 내부 점은 inside이다', () => {
    // (1, 1)은 3-4-5 삼각형 내부
    expect(classifyPoint(TRIANGLE, { x: 1, y: 0.5 })).toBe('inside');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// boundary (epsilon = 0)
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon classify - boundary (epsilon=0)', () => {
  test('단위 정사각형 edge 위 점은 boundary이다', () => {
    // 아래 edge 중점
    expect(classifyPoint(UNIT_SQUARE, { x: 0.5, y: 0 })).toBe('boundary');
  });

  test('단위 정사각형 vertex는 boundary이다', () => {
    expect(classifyPoint(UNIT_SQUARE, { x: 0, y: 0 })).toBe('boundary');
    expect(classifyPoint(UNIT_SQUARE, { x: 1, y: 1 })).toBe('boundary');
  });

  test('삼각형 edge 위 점은 boundary이다', () => {
    // 아래 edge 중점 (2, 0)
    expect(classifyPoint(TRIANGLE, { x: 2, y: 0 })).toBe('boundary');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// boundary (epsilon > 0)
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon classify - boundary (epsilon>0)', () => {
  test('epsilon 이내 근접 점은 boundary이다', () => {
    // edge y=0 위에서 약간 아래 (0.5, -0.05), epsilon=0.1
    expect(classifyPoint(UNIT_SQUARE, { x: 0.5, y: -0.05 }, 0.1)).toBe('boundary');
  });

  test('epsilon 초과 점은 boundary가 아니다', () => {
    // edge y=0 에서 0.2 떨어진 점, epsilon=0.1
    expect(classifyPoint(UNIT_SQUARE, { x: 0.5, y: -0.2 }, 0.1)).toBe('outside');
  });

  test('epsilon 확장으로 내부 점도 boundary로 분류될 수 있다', () => {
    // 중심 (0.5, 0.5), 거리 0.5인 edge에 epsilon=0.6이면 boundary
    expect(classifyPoint(UNIT_SQUARE, { x: 0.5, y: 0.5 }, 0.6)).toBe('boundary');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// outside
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon classify - outside', () => {
  test('단위 정사각형 밖의 점은 outside이다', () => {
    expect(classifyPoint(UNIT_SQUARE, { x: 2, y: 0.5 })).toBe('outside');
    expect(classifyPoint(UNIT_SQUARE, { x: 0.5, y: -1 })).toBe('outside');
    expect(classifyPoint(UNIT_SQUARE, { x: -0.5, y: 0.5 })).toBe('outside');
  });

  test('삼각형 밖의 점은 outside이다', () => {
    expect(classifyPoint(TRIANGLE, { x: 3, y: 3 })).toBe('outside');
  });

  test('ray casting x 교점 좌표 차이가 overflow해도 outside를 유지한다', () => {
    const huge = Number.MAX_VALUE;
    const tri = [huge, 0, -huge, 2, huge, 4];

    expect(classifyPoint(tri, { x: -1, y: 1 })).toBe('outside');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// input 형식
// ─────────────────────────────────────────────────────────────────────────────
