/**
 * segmentSegmentDetail degenerate segment 단위 테스트.
 *
 * zero-length segment와 overflow 길이 segment가 섞인 경계 입력을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';
import { expectPointDetail, segment } from './_helpers/segment-segment-detail';

describe('segmentSegmentDetail — zero-length segment', () => {
  test('normal segment 위의 zero-length segment는 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(0, 0, 10, 0), segment(5, 0, 5, 0)), {
      point: { x: 5, y: 0 },
      tA: 0.5,
      tB: 0,
    });
  });

  test('zero-length segment가 normal segment 밖이면 none을 반환한다', () => {
    expect(segmentSegmentDetail(segment(0, 0, 10, 0), segment(5, 1, 5, 1))).toEqual({ kind: 'none' });
  });

  test('a가 zero-length이고 b 직선 밖이면 none을 반환한다 (aDegen-off 경로)', () => {
    expect(segmentSegmentDetail(segment(5, 1, 5, 1), segment(0, 0, 10, 0))).toEqual({ kind: 'none' });
  });

  test('normal segment가 zero-length segment 위에 있으면 point를 반환한다 (인자 순서 반전)', () => {
    expectPointDetail(segmentSegmentDetail(segment(5, 0, 5, 0), segment(0, 0, 10, 0)), {
      point: { x: 5, y: 0 },
      tA: 0,
      tB: 0.5,
    });
  });

  test('같은 점인 두 zero-length segment는 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(3, 4, 3, 4), segment(3, 4, 3, 4)), {
      point: { x: 3, y: 4 },
      tA: 0,
      tB: 0,
    });
  });

  test('다른 점인 두 zero-length segment는 none을 반환한다', () => {
    expect(segmentSegmentDetail(segment(3, 4, 3, 4), segment(5, 6, 5, 6))).toEqual({ kind: 'none' });
  });

  test('epsilon 경계 안쪽 두 zero-length point는 boolean과 같게 point다', () => {
    // 거리 ≈ 9.9999e-10 < epsilon 1e-9. 정규화 차분이 정밀도를 잃으면 false none이 됐다.
    const a = {
      a: { x: 771.7703618109226, y: -466.37072833254933 },
      b: { x: 771.7703618109226, y: -466.37072833254933 },
    };
    const b = {
      a: { x: 771.7703618099226, y: -466.37072833254933 },
      b: { x: 771.7703618099226, y: -466.37072833254933 },
    };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(segmentSegmentDetail(a, b).kind).toBe('point');
  });

  test('overflow 길이 normal segment 위의 zero-length segment는 point를 반환한다', () => {
    const result = segmentSegmentDetail(segment(0, 0, 1e308, 0), segment(1, 0, 1, 0));

    expectPointDetail(result, { point: { x: 1, y: 0 }, tB: 0 });
    // tA는 1/1e308 = 1e-308. toBeCloseTo 절대 임계로는 0과 구분되지 않아 상대비로 검증한다.
    if (result.kind !== 'point') return;
    expect(result.tA).toBeGreaterThan(0);
    expect(result.tA / 1e-308).toBeCloseTo(1, 6);
  });

  test('overflow 길이 normal segment가 zero-length segment 뒤에 와도 point를 반환한다', () => {
    const result = segmentSegmentDetail(segment(1, 0, 1, 0), segment(0, 0, 1e308, 0));

    expectPointDetail(result, { point: { x: 1, y: 0 }, tA: 0 });
    // tB는 1/1e308 = 1e-308. 상대비로 검증한다.
    if (result.kind !== 'point') return;
    expect(result.tB).toBeGreaterThan(0);
    expect(result.tB / 1e-308).toBeCloseTo(1, 6);
  });

  test('endpoint 차이가 overflow되는 normal segment 위의 zero-length segment는 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(-1e308, 0, 1e308, 0), segment(0, 0, 0, 0)), {
      point: { x: 0, y: 0 },
      tA: 0.5,
      tB: 0,
    });
  });

  test('epsilon 제곱 overflow는 먼 zero-length point를 false positive로 만들지 않는다', () => {
    expect(segmentSegmentDetail(segment(0, 0, 1e308, 0), segment(1, 1e201, 1, 1e201), 1e200)).toEqual({
      kind: 'none',
    });
  });

  test('zero-length point의 parameter가 endpoint로 붕괴해도 endpoint 좌표가 다르면 none이다', () => {
    const a = { a: { x: 0, y: 5.33815744176588e32 }, b: { x: 0, y: 5.33815744176588e32 } };
    const b = {
      a: { x: -8.511049291252587e210, y: 3.0619683507104956 },
      b: { x: 5.876815338934399, y: 5.33815744176588e32 },
    };

    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
    expect(segmentSegmentDetail(b, a)).toEqual({ kind: 'none' });
  });
});
