/**
 * 선분·ray·infinite-line 교차 판정의 scale 불변성 테스트.
 *
 * cross product는 길이² 단위이고 epsilon은 길이 단위다. 이전 구현은 `|cross| <= epsilon`으로
 * 비교해 작은 입력을 평행으로 오판했다. epsilon을 생략하면 `|cross| <= DEFAULT_EPSILON·|a|·|b|`
 * (sin θ 기준)로 판정한다. epsilon을 명시하면 기존 절대 cross 비교를 유지한다.
 *
 * 좌표를 s배, direction 길이를 m배 해도 hit 여부, kind, 정규화 parameter는 같아야 한다.
 * 거리 임계값(1e-9)은 길이 단위로 남는다. 그래서 선분 길이가 임계값보다 충분히 긴 scale만 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { isCollinear } from '../../../src/infinite-line/is-collinear';
import { isParallel } from '../../../src/infinite-line/is-parallel';
import { singleIntersectionInto as infiniteLineSingleIntersectionInto } from '../../../src/infinite-line/single-intersection-into';
import { intersectsInfiniteLineSegment } from '../../../src/intersects/intersects-infinite-line-segment';
import { intersectsRaySegment } from '../../../src/intersects/intersects-ray-segment';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';
import { isSimple } from '../../../src/polygon/is-simple';
import { singleIntersectionInto as raySingleIntersectionInto } from '../../../src/ray/single-intersection-into';
import { singleIntersectionInto as segmentSingleIntersectionInto } from '../../../src/segment/single-intersection-into';
import type { InfiniteLineLike, RayLike, SegmentLike } from '../../../src/types';
import { expectOverlapDetail, expectPointDetail } from './_helpers/segment-segment-detail';

/** 좌표 scale 후보. 선분 길이가 거리 임계값(1e-9)보다 충분히 긴 범위만 쓴다. */
const COORD_SCALES = [1e-8, 1e-6, 1e-3, 1, 1e3, 1e8];

/** direction 길이 배율 후보. 정규화되지 않은 direction이 만드는 cross 크기를 바꾼다. */
const DIRECTION_SCALES = [1e-8, 1e-6, 1e-3, 1, 1e3, 1e6];

/** parameter 비교 자릿수. 큰 offset 케이스의 반올림 오차를 허용한다. */
const PARAM_DIGITS = 6;

/**
 * 기준 좌표(단위 scale)에 scale과 offset을 적용한 segment를 만든다.
 * 모든 좌표에 `offset + s·값`을 쓴다. offset은 큰 좌표 + 작은 선분 케이스에서 쓴다.
 */
function scaledSegment(s: number, ax: number, ay: number, bx: number, by: number, offset = 0): SegmentLike {
  return {
    a: { x: offset + s * ax, y: offset + s * ay },
    b: { x: offset + s * bx, y: offset + s * by },
  };
}

/**
 * origin은 좌표 scale s로, direction은 길이 배율 m으로 키운 ray를 만든다.
 * direction 방향은 바꾸지 않고 길이만 바꾼다.
 */
function scaledRay(s: number, m: number, ox: number, oy: number, dx: number, dy: number): RayLike {
  return { origin: { x: s * ox, y: s * oy }, direction: { x: m * dx, y: m * dy } };
}

/**
 * origin은 좌표 scale s로, direction은 길이 배율 m으로 키운 infinite-line을 만든다.
 */
function scaledLine(s: number, m: number, ox: number, oy: number, dx: number, dy: number): InfiniteLineLike {
  return { origin: { x: s * ox, y: s * oy }, direction: { x: m * dx, y: m * dy } };
}

describe('segment 교차 판정은 좌표 scale에 불변이다', () => {
  test.each(COORD_SCALES)('scale %s: 수직 X자 교차는 point이고 parameter가 0.5다', (s) => {
    const a = scaledSegment(s, -1, -1, 1, 1);
    const b = scaledSegment(s, -1, 1, 1, -1);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expectPointDetail(segmentSegmentDetail(a, b), { tA: 0.5, tB: 0.5 }, PARAM_DIGITS);
    const out = { x: Number.NaN, y: Number.NaN };
    expect(segmentSingleIntersectionInto(out, a, b)).toBe(true);
    expect(Math.abs(out.x)).toBeLessThanOrEqual(s * 1e-6);
    expect(Math.abs(out.y)).toBeLessThanOrEqual(s * 1e-6);
  });

  test.each(COORD_SCALES)('scale %s: 끝점 접촉은 tA=1, tB=0인 point다', (s) => {
    const a = scaledSegment(s, 0, 0, 2, 0);
    const b = scaledSegment(s, 2, 0, 2, 2);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expectPointDetail(segmentSegmentDetail(a, b), { tA: 1, tB: 0 }, PARAM_DIGITS);
  });

  test.each(COORD_SCALES)('scale %s: sin θ = 1e-3인 거의 평행한 교차도 교차한다', (s) => {
    const a = scaledSegment(s, -1, 0, 1, 0);
    const b = scaledSegment(s, -1, -1e-3, 1, 1e-3);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(segmentSegmentDetail(a, b).kind).not.toBe('none');
  });

  // 끝점 이탈(1e-3·s)이 거리 임계값(1e-9)보다 클 때만 collinear가 아닌 point로 분류된다.
  test.each([1e-3, 1, 1e3, 1e8])('scale %s: sin θ = 1e-3인 거의 평행한 교차는 point다', (s) => {
    const a = scaledSegment(s, -1, 0, 1, 0);
    const b = scaledSegment(s, -1, -1e-3, 1, 1e-3);

    expectPointDetail(segmentSegmentDetail(a, b), { tA: 0.5, tB: 0.5 }, PARAM_DIGITS);
  });

  test.each(COORD_SCALES)('scale %s: 떨어진 평행 선분은 교차 없음이다', (s) => {
    const a = scaledSegment(s, 0, 0, 2, 0);
    const b = scaledSegment(s, 0, 1, 2, 1);

    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
    const out = { x: -7, y: -7 };
    expect(segmentSingleIntersectionInto(out, a, b)).toBe(false);
    expect(out).toEqual({ x: -7, y: -7 });
  });

  test.each(COORD_SCALES)('scale %s: collinear overlap은 a 기준 [0.5, 1] overlap이다', (s) => {
    const a = scaledSegment(s, 0, 0, 4, 0);
    const b = scaledSegment(s, 2, 0, 6, 0);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expectOverlapDetail(segmentSegmentDetail(a, b), { tA: [0.5, 1], tB: [0, 0.5] }, PARAM_DIGITS);
  });

  test.each(COORD_SCALES)('scale %s: collinear이지만 떨어진 선분은 교차 없음이다', (s) => {
    const a = scaledSegment(s, 0, 0, 2, 0);
    const b = scaledSegment(s, 4, 0, 6, 0);

    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test.each([1e-6, 1e-5, 1e-4])('큰 좌표(1e6) 위의 반길이 %s 십자 선분은 point다', (half) => {
    const a = scaledSegment(half, -1, -1, 1, 1, 1e6);
    const b = scaledSegment(half, -1, 1, 1, -1, 1e6);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    // offset 1e6의 반올림(약 1e-10)이 반길이 1e-6 대비 1e-4이므로 3자리만 비교한다
    expectPointDetail(segmentSegmentDetail(a, b), { tA: 0.5, tB: 0.5 }, 3);
  });

  test('반길이 1e-8 십자 선분은 교차한다 (TODO 1.4 재현)', () => {
    const a = scaledSegment(1e-8, -1, -1, 1, 1);
    const b = scaledSegment(1e-8, -1, 1, 1, -1);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(segmentSegmentDetail(a, b).kind).toBe('point');
  });
});

describe('방향 길이 곱이 오버플로하는 큰 입력은 절대 비교로 되돌린다', () => {
  // |a|²·|b|²가 Infinity가 되면 상대 임계를 만들 수 없다. 임계가 Infinity로 번져 모두 평행이 되면 안 된다.
  test('길이 1e100 수직 segment는 교차한다', () => {
    const a = scaledSegment(1e100, -1, 0, 1, 0);
    const b = scaledSegment(1e100, 0, -1, 0, 1);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expectPointDetail(segmentSegmentDetail(a, b), { tA: 0.5, tB: 0.5 }, PARAM_DIGITS);
  });

  test('길이 1e100 수직 infinite-line은 평행이 아니고 같은 방향은 평행이다', () => {
    expect(isParallel(scaledLine(1, 1e100, 0, 0, 1, 0), scaledLine(1, 1e100, 0, 0, 0, 1))).toBe(false);
    expect(isParallel(scaledLine(1, 1e100, 0, 0, 1, 0), scaledLine(1, 1e100, 0, 1, -2, 0))).toBe(true);
  });
});

describe('epsilon을 명시하면 절대 cross 비교를 유지한다', () => {
  // 상대 판정의 대가다. sin θ <= 1e-9인 두 선분은 길이와 무관하게 평행으로 본다.
  // 평행이면 끝점이 상대 직선의 거리 임계값(1e-9) 안에 있어야 collinear로 인정한다.
  test('길이 1e4 선분 2개가 sin θ = 5e-10로 교차하면 epsilon 생략 시 교차 없음이고 명시하면 교차다', () => {
    const half = 5e3;
    const th = Math.asin(5e-10);
    const a = { a: { x: -half, y: 0 }, b: { x: half, y: 0 } };
    const b = {
      a: { x: -half * Math.cos(th), y: -half * Math.sin(th) },
      b: { x: half * Math.cos(th), y: half * Math.sin(th) },
    };

    // 끝점이 상대 직선에서 2.5e-6 벗어나 거리 임계값 1e-9를 넘는다
    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
    // 명시 epsilon은 절대 cross 비교라 cross = 0.05 > 1e-9로 non-parallel이다
    expect(intersectsSegmentSegment(a, b, 1e-9)).toBe(true);
    expect(segmentSegmentDetail(a, b, 1e-9).kind).toBe('point');
  });

  test('epsilon=1e-9를 명시한 반길이 1e-5 십자 선분은 평행으로 본다', () => {
    const a = scaledSegment(1e-5, -1, -1, 1, 1);
    const b = scaledSegment(1e-5, -1, 1, 1, -1);

    // cross = -8e-10, |cross| <= 1e-9이므로 명시 epsilon에서는 기존대로 평행 분기를 탄다
    expect(intersectsSegmentSegment(a, b, 1e-9)).toBe(false);
  });

  test('epsilon=1e-9를 명시한 isParallel은 direction 길이에 따라 결과가 달라진다', () => {
    const a = scaledLine(1, 1, 0, 0, 1, 0);

    // cross = 0.5e-9 → 평행
    expect(isParallel(a, scaledLine(1, 1, 0, 0, 1, 0.5e-9), 1e-9)).toBe(true);
    // direction을 1e3배 하면 cross = 0.5e-3 → 절대 비교이므로 평행이 아니다
    expect(isParallel(scaledLine(1, 1e3, 0, 0, 1, 0), scaledLine(1, 1e3, 0, 0, 1, 0.5e-9), 1e-9)).toBe(false);
  });
});

describe('direction 길이는 판정 결과에 영향을 주지 않는다', () => {
  test.each(DIRECTION_SCALES)('direction 배율 %s: 수직 infinite-line은 평행이 아니다', (m) => {
    expect(isParallel(scaledLine(1, m, 0, 0, 1, 0), scaledLine(1, m, 0, 0, 0, 1))).toBe(false);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: 같은 방향 infinite-line은 평행이다', (m) => {
    expect(isParallel(scaledLine(1, m, 0, 0, 1, 0), scaledLine(1, m, 0, 1, -2, 0))).toBe(true);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: sin θ = 1e-12인 infinite-line은 평행이다', (m) => {
    expect(isParallel(scaledLine(1, m, 0, 0, 1, 0), scaledLine(1, m, 0, 0, 1, 1e-12))).toBe(true);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: 원점을 공유한 수직 infinite-line은 collinear가 아니다', (m) => {
    expect(isCollinear(scaledLine(1, m, 0, 0, 1, 0), scaledLine(1, m, 0, 0, 0, 1))).toBe(false);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: 같은 직선 위의 infinite-line은 collinear다', (m) => {
    expect(isCollinear(scaledLine(1, m, 0, 0, 1, 0), scaledLine(1, m, 3, 0, -1, 0))).toBe(true);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: 평행하게 1만큼 떨어진 infinite-line은 collinear가 아니다', (m) => {
    expect(isCollinear(scaledLine(1, m, 0, 0, 1, 0), scaledLine(1, m, 0, 1, 1, 0))).toBe(false);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: infinite-line 단일 교점은 원점이다', (m) => {
    const out = { x: Number.NaN, y: Number.NaN };

    expect(infiniteLineSingleIntersectionInto(out, scaledLine(1, m, -1, 0, 1, 0), scaledLine(1, m, 0, -1, 0, 1))).toBe(
      true
    );
    expect(out.x).toBeCloseTo(0, 9);
    expect(out.y).toBeCloseTo(0, 9);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: ray 단일 교점은 원점이다', (m) => {
    const out = { x: Number.NaN, y: Number.NaN };

    expect(raySingleIntersectionInto(out, scaledRay(1, m, -1, 0, 1, 0), scaledRay(1, m, 0, -1, 0, 1))).toBe(true);
    expect(out.x).toBeCloseTo(0, 9);
    expect(out.y).toBeCloseTo(0, 9);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: 평행한 ray는 단일 교점이 없다', (m) => {
    const out = { x: -7, y: -7 };

    expect(raySingleIntersectionInto(out, scaledRay(1, m, 0, 0, 1, 0), scaledRay(1, m, 0, 1, 1, 0))).toBe(false);
    expect(out).toEqual({ x: -7, y: -7 });
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: ray와 segment가 수직으로 만나면 교차한다', (m) => {
    expect(intersectsRaySegment(scaledRay(1, m, -1, 0, 1, 0), scaledSegment(1, 0, -1, 0, 1))).toBe(true);
  });

  test.each(DIRECTION_SCALES)('direction 배율 %s: infinite-line과 segment가 수직으로 만나면 교차한다', (m) => {
    expect(intersectsInfiniteLineSegment(scaledLine(1, m, -1, 0, 1, 0), scaledSegment(1, 0, -1, 0, 1))).toBe(true);
  });
});

describe('작은 scale에서 intersects 공개 함수가 같은 결과를 낸다', () => {
  test.each(COORD_SCALES)('scale %s: 작은 segment와 수직 ray는 교차한다', (s) => {
    expect(intersectsRaySegment(scaledRay(s, s, -1, 0, 1, 0), scaledSegment(s, 0, -1, 0, 1))).toBe(true);
  });

  test.each(COORD_SCALES)('scale %s: 작은 segment와 수직 infinite-line은 교차한다', (s) => {
    expect(intersectsInfiniteLineSegment(scaledLine(s, s, -1, 0, 1, 0), scaledSegment(s, 0, -1, 0, 1))).toBe(true);
  });

  test.each(COORD_SCALES)('scale %s: 작은 bowtie polygon은 simple이 아니다', (s) => {
    const bowtie = [
      { x: 0, y: 0 },
      { x: 2 * s, y: 2 * s },
      { x: 2 * s, y: 0 },
      { x: 0, y: 2 * s },
    ];

    expect(isSimple(bowtie)).toBe(false);
  });

  test.each(COORD_SCALES)('scale %s: 작은 정사각형 polygon은 simple이다', (s) => {
    const square = [
      { x: 0, y: 0 },
      { x: 2 * s, y: 0 },
      { x: 2 * s, y: 2 * s },
      { x: 0, y: 2 * s },
    ];

    expect(isSimple(square)).toBe(true);
  });
});
