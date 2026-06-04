/**
 * sampleFixedCountInto unit test.
 *
 * arc-length 기준 count개 균등 샘플링 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { sampleFixedCountInto } from '../../../src/polyline/sample-fixed-count-into';
import type { PolylineLike, XYObjectWritable } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공용 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolylineLike = { points: [] };
const SINGLE: PolylineLike = { points: [{ x: 1, y: 2 }] };
const REPEATED: PolylineLike = {
  points: [
    { x: 3, y: 5 },
    { x: 3, y: 5 },
  ],
};

const HLINE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ],
};

const L_SHAPE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 3, y: 4 },
  ],
};

function makeOut(): XYObjectWritable[] {
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// 입력 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleFixedCountInto 입력 검증', () => {
  test('count <= 0이면 RangeError를 던진다', () => {
    expect(() => sampleFixedCountInto([], HLINE, 0)).toThrow(RangeError);
    expect(() => sampleFixedCountInto([], HLINE, -1)).toThrow(RangeError);
  });

  test('count가 비정수이면 RangeError를 던진다', () => {
    expect(() => sampleFixedCountInto([], HLINE, 1.5)).toThrow(RangeError);
    expect(() => sampleFixedCountInto([], HLINE, Number.NaN)).toThrow(RangeError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// empty / single / repeated
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleFixedCountInto edge-case', () => {
  test('empty polyline은 outPoints를 비우고 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    const result = sampleFixedCountInto(out, EMPTY, 5);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 outPoints를 비우고 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    sampleFixedCountInto(out, SINGLE, 5);
    expect(out).toHaveLength(0);
  });

  test('repeated-point polyline은 count개 모두 시작점을 반환한다', () => {
    const out = makeOut();
    sampleFixedCountInto(out, REPEATED, 3);
    expect(out).toHaveLength(3);
    for (const pt of out) {
      expect(pt).toEqual({ x: 3, y: 5 });
    }
  });

  test('반환값이 outPoints 자체다', () => {
    const out = makeOut();
    const result = sampleFixedCountInto(out, HLINE, 3);
    expect(result).toBe(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// count === 1
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleFixedCountInto count=1', () => {
  test('count=1이면 시작점 1개만 반환한다', () => {
    const out = makeOut();
    sampleFixedCountInto(out, HLINE, 1);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// count >= 2 균등 샘플링
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleFixedCountInto count>=2', () => {
  test('count=2이면 시작점과 끝점을 반환한다', () => {
    const out = makeOut();
    sampleFixedCountInto(out, HLINE, 2);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 10, y: 0 });
  });

  test('count=3이면 양 끝과 중점을 반환한다', () => {
    const out = makeOut();
    sampleFixedCountInto(out, HLINE, 3);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1].x).toBeCloseTo(5, 10);
    expect(out[1].y).toBeCloseTo(0, 10);
    expect(out[2]).toEqual({ x: 10, y: 0 });
  });

  test('count=5이면 0,2.5,5,7.5,10 좌표를 반환한다', () => {
    const out = makeOut();
    sampleFixedCountInto(out, HLINE, 5);
    expect(out).toHaveLength(5);
    const xs = [0, 2.5, 5, 7.5, 10];
    for (let i = 0; i < 5; i++) {
      expect(out[i].x).toBeCloseTo(xs[i], 10);
      expect(out[i].y).toBeCloseTo(0, 10);
    }
  });

  test('L자 polyline에서 count=3: 시작점, 중점(arc-length 3.5), 끝점', () => {
    const out = makeOut();
    sampleFixedCountInto(out, L_SHAPE, 3);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    // arc-length 3.5: 첫 segment(3) 끝 + 0.5 진행
    expect(out[1].x).toBeCloseTo(3, 10);
    expect(out[1].y).toBeCloseTo(0.5, 10);
    expect(out[2]).toEqual({ x: 3, y: 4 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// outPoints clear
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleFixedCountInto outPoints clear', () => {
  test('기존 outPoints 내용이 clear된다', () => {
    const out: XYObjectWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    sampleFixedCountInto(out, HLINE, 3);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });

  test('점 배열 자체를 PolylineLike로 사용할 수 있다', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const out = makeOut();
    sampleFixedCountInto(out, pts, 3);
    expect(out).toHaveLength(3);
  });
});
