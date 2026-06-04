/**
 * segmentSegmentDetail boolean 일치와 epsilon 경계 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';

describe('segmentSegmentDetail — boolean 판정 일치 (non-parallel 경계)', () => {
  test('교점이 segment b 범위 밖(tB>1)이면 none이고 boolean도 false다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 2 }, b: { x: 5, y: 1 } };
    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('교점이 segment a 시작 이전(tA<0)이면 none이고 boolean도 false다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: -5, y: -5 }, b: { x: -5, y: 5 } };
    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('대좌표 공유 끝점은 boolean과 같은 point 판정을 유지한다', () => {
    // 한 segment가 매우 길어 raw/scaled parameter가 [0,1] 경계에서 갈리던 회귀 케이스.
    // none 판정을 boolean과 같은 raw range 식으로 통일해 mismatch를 제거했다.
    const a = { a: { x: 2, y: 9.457417568065555 }, b: { x: -4, y: -7 } };
    const b = { a: { x: -715155.5739611284, y: 554154.8904856098 }, b: { x: -4, y: -7 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
    const result = segmentSegmentDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.point.x).toBeCloseTo(-4, 6);
    expect(result.point.y).toBeCloseTo(-7, 6);
  });

  test('b 양 끝점이 epsilon band 안이지만 교점이 segment 범위 밖이면 boolean과 같이 none이다', () => {
    // 회귀: collinearByDistance가 finite cross의 non-parallel 분기를 가로채
    // 가짜 overlap을 만들던 false positive. boolean은 raw t/u range로 false 판정.
    const eps = 1e-9;
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    // b는 line a에서 0.9e-9(<eps) 이내지만, a-축 along 위치가 segment a 범위 밖이다.
    const b = { a: { x: 12, y: 0.9e-9 }, b: { x: 18, y: -0.9e-9 } };
    expect(intersectsSegmentSegment(a, b, eps)).toBe(false);
    expect(segmentSegmentDetail(a, b, eps)).toEqual({ kind: 'none' });
  });

  test('a 시작 endpoint가 b 내부에 닿으면 tA=0, tB=중간인 point다', () => {
    const a = { a: { x: 5, y: 0 }, b: { x: 5, y: 5 } };
    const b = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const result = segmentSegmentDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.tA).toBeCloseTo(0, 12);
    expect(result.tB).toBeCloseTo(0.5, 12);
  });
});

describe('segmentSegmentDetail — overlap 분기 보강', () => {
  test('세로 collinear 부분 overlap은 tA 오름차순 start/end를 반환한다 (y-dominant 정렬)', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 0, y: 10 } };
    const b = { a: { x: 0, y: 5 }, b: { x: 0, y: 15 } };
    const result = segmentSegmentDetail(a, b);
    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(result.kind).toBe('overlap');
    if (result.kind !== 'overlap') return;
    expect(result.start).toEqual({ x: 0, y: 5 });
    expect(result.end).toEqual({ x: 0, y: 10 });
    expect(result.tA[0]).toBeCloseTo(0.5, 12);
    expect(result.tA[1]).toBeCloseTo(1, 12);
  });

  test('대좌표 y-dominant collinear overlap은 raw cross cancellation에도 overlap을 반환한다', () => {
    const a = {
      a: { x: -9.514409420080483e-301, y: -0.7037402398418635 },
      b: { x: 0.6887789163738489, y: 6.500200578011573e298 },
    };
    const b = {
      a: { x: 0.3855724422374807, y: 3.638755705665446e298 },
      b: { x: 0.5355792626142448, y: 5.05441230800761e298 },
    };
    const result = segmentSegmentDetail(a, b);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(result.kind).toBe('overlap');
    if (result.kind !== 'overlap') return;
    expect(result.start).toEqual(b.a);
    expect(result.end).toEqual(b.b);
    expect(result.tA[0]).toBeCloseTo(0.5597912959754467, 12);
    expect(result.tA[1]).toBeCloseTo(0.7775778989198157, 12);
    expect(result.tB[0]).toBeCloseTo(0, 12);
    expect(result.tB[1]).toBeCloseTo(1, 12);
  });

  test('b가 a를 완전히 포함하면 a 양 끝점이 overlap 구간이다', () => {
    const a = { a: { x: 2, y: 0 }, b: { x: 8, y: 0 } };
    const b = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const result = segmentSegmentDetail(a, b);
    expect(result.kind).toBe('overlap');
    if (result.kind !== 'overlap') return;
    expect(result.start).toEqual({ x: 2, y: 0 });
    expect(result.end).toEqual({ x: 8, y: 0 });
    expect(result.tA[0]).toBeCloseTo(0, 12);
    expect(result.tA[1]).toBeCloseTo(1, 12);
    expect(result.tB[0]).toBeCloseTo(0.2, 12);
    expect(result.tB[1]).toBeCloseTo(0.8, 12);
  });

  test('동일 segment는 tA/tB가 [0,1] 전체인 overlap이다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const result = segmentSegmentDetail(a, a);
    expect(result.kind).toBe('overlap');
    if (result.kind !== 'overlap') return;
    expect(result.tA[0]).toBeCloseTo(0, 12);
    expect(result.tA[1]).toBeCloseTo(1, 12);
    expect(result.tB[0]).toBeCloseTo(0, 12);
    expect(result.tB[1]).toBeCloseTo(1, 12);
  });
});

describe('segmentSegmentDetail — epsilon=0 경계', () => {
  test('epsilon=0에서 정확한 정수 교차는 point다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: -5 }, b: { x: 5, y: 5 } };
    const result = segmentSegmentDetail(a, b, 0);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.point).toEqual({ x: 5, y: 0 });
  });

  test('epsilon=0에서 떨어진 평행 segment는 none이다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 0, y: 1 }, b: { x: 10, y: 1 } };
    expect(segmentSegmentDetail(a, b, 0)).toEqual({ kind: 'none' });
  });

  test('epsilon=0에서 정확히 collinear인 부분 overlap은 overlap이다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 15, y: 0 } };
    const result = segmentSegmentDetail(a, b, 0);
    expect(result.kind).toBe('overlap');
    if (result.kind !== 'overlap') return;
    expect(result.start).toEqual({ x: 5, y: 0 });
    expect(result.end).toEqual({ x: 10, y: 0 });
  });
});

describe('segmentSegmentDetail — epsilon 수렴 경계', () => {
  test('overlap 길이가 epsilon 초과면 overlap을 유지한다', () => {
    const eps = 1e-9;
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 10 - 2 * eps, y: 0 }, b: { x: 20, y: 0 } };
    expect(segmentSegmentDetail(a, b, eps).kind).toBe('overlap');
  });

  test('overlap 길이가 epsilon 이하면 point로 수렴한다', () => {
    const eps = 1e-9;
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 10 - 0.5 * eps, y: 0 }, b: { x: 20, y: 0 } };
    expect(segmentSegmentDetail(a, b, eps).kind).toBe('point');
  });
});
