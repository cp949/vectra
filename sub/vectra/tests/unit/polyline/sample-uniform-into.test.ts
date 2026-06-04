/**
 * sampleUniformInto unit test.
 *
 * arc-length 기준 균등 간격 샘플링 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { sampleUniformInto } from '../../../src/polyline/sample-uniform-into';
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

/** x축으로 10 단위 직선 polyline */
const HLINE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ],
};

/** 꺾인 L자 polyline: (0,0)→(3,0)→(3,4), 총 arc-length 7 */
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

describe('polyline sampling - sampleUniformInto 입력 검증', () => {
  test('spacing <= 0이면 RangeError를 던진다', () => {
    expect(() => sampleUniformInto([], HLINE, 0)).toThrow(RangeError);
    expect(() => sampleUniformInto([], HLINE, -1)).toThrow(RangeError);
  });

  test('spacing이 Infinity이면 RangeError를 던진다', () => {
    expect(() => sampleUniformInto([], HLINE, Infinity)).toThrow(RangeError);
  });

  test('spacing이 NaN이면 RangeError를 던진다', () => {
    expect(() => sampleUniformInto([], HLINE, Number.NaN)).toThrow(RangeError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// empty / single / repeated
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleUniformInto edge-case', () => {
  test('empty polyline은 outPoints를 비우고 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    const result = sampleUniformInto(out, EMPTY, 1);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 outPoints를 비우고 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    sampleUniformInto(out, SINGLE, 1);
    expect(out).toHaveLength(0);
  });

  test('repeated-point polyline(total length 0)은 시작점 1개만 반환한다', () => {
    const out = makeOut();
    sampleUniformInto(out, REPEATED, 1);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 3, y: 5 });
  });

  test('반환값이 outPoints 자체다', () => {
    const out = makeOut();
    const result = sampleUniformInto(out, HLINE, 5);
    expect(result).toBe(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 직선 균등 샘플링
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleUniformInto 직선', () => {
  test('spacing=5, 길이=10인 직선: [0,5,10] 3개 point', () => {
    const out = makeOut();
    sampleUniformInto(out, HLINE, 5);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1].x).toBeCloseTo(5, 10);
    expect(out[1].y).toBeCloseTo(0, 10);
    expect(out[2]).toEqual({ x: 10, y: 0 });
  });

  test('spacing=3, 길이=10인 직선: [0,3,6,9,10] 5개 point', () => {
    const out = makeOut();
    sampleUniformInto(out, HLINE, 3);
    expect(out).toHaveLength(5);
    expect(out[0].x).toBeCloseTo(0, 10);
    expect(out[1].x).toBeCloseTo(3, 10);
    expect(out[2].x).toBeCloseTo(6, 10);
    expect(out[3].x).toBeCloseTo(9, 10);
    expect(out[4]).toEqual({ x: 10, y: 0 });
  });

  test('spacing이 polyline 전체 길이보다 크면 시작점과 끝점 2개', () => {
    const out = makeOut();
    sampleUniformInto(out, HLINE, 100);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 10, y: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// includeLast 옵션
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleUniformInto includeLast', () => {
  test('includeLast 미지정(기본값 true)이면 끝점을 포함한다', () => {
    const out = makeOut();
    sampleUniformInto(out, HLINE, 3);
    const last = out[out.length - 1];
    expect(last).toEqual({ x: 10, y: 0 });
  });

  test('includeLast: false이면 끝점을 강제로 추가하지 않는다', () => {
    const out = makeOut();
    sampleUniformInto(out, HLINE, 3, { includeLast: false });
    // spacing 3: 0, 3, 6, 9 — 마지막 sample이 9이므로 10은 포함되지 않아야 한다
    expect(out).toHaveLength(4);
    expect(out[out.length - 1].x).toBeCloseTo(9, 10);
  });

  test('마지막 균등 sample이 끝점과 정확히 같으면 중복 push하지 않는다', () => {
    // spacing=5, length=10: sample이 0, 5, 10 — 10이 끝점과 같으므로 중복 없이 3개
    const out = makeOut();
    sampleUniformInto(out, HLINE, 5);
    expect(out).toHaveLength(3);
    expect(out[out.length - 1]).toEqual({ x: 10, y: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 꺾인 polyline
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleUniformInto 꺾인 polyline', () => {
  test('L자 polyline(length 7)에서 spacing=3.5이면 [0, 3.5, 7] 3개', () => {
    const out = makeOut();
    sampleUniformInto(out, L_SHAPE, 3.5);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    // distance 3.5: 첫 segment(length 3) 끝 + 0.5 진행
    expect(out[1].x).toBeCloseTo(3, 10);
    expect(out[1].y).toBeCloseTo(0.5, 10);
    // 끝점
    expect(out[2]).toEqual({ x: 3, y: 4 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// outPoints clear 및 aliasing
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - sampleUniformInto outPoints clear', () => {
  test('기존 outPoints 내용이 clear된다', () => {
    const out: XYObjectWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    sampleUniformInto(out, HLINE, 5);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });

  test('점 배열 자체를 PolylineLike로 사용할 수 있다', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const out = makeOut();
    sampleUniformInto(out, pts, 5);
    expect(out).toHaveLength(3);
  });
});
