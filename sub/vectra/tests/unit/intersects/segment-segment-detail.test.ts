/**
 * segmentSegmentDetail 기본 분기 단위 테스트.
 *
 * S10-RM-003: boolean intersectsSegmentSegment으로 손실되는 point/overlap/none 구분과
 * 각 분기의 좌표/parameter 값을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';
import { expectOverlapDetail, expectPointDetail, segment } from './_helpers/segment-segment-detail';

describe('segmentSegmentDetail — point 분기', () => {
  test('proper X자 교차는 교차점과 두 parameter를 가진 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(0, 0, 10, 10), segment(0, 10, 10, 0)), {
      point: { x: 5, y: 5 },
      tA: 0.5,
      tB: 0.5,
    });
  });

  test('T자 교차는 닿는 쪽 endpoint parameter를 1로 보존한 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(0, 0, 10, 0), segment(5, -5, 5, 0)), {
      point: { x: 5, y: 0 },
      tA: 0.5,
      tB: 1,
    });
  });

  test('shared endpoint는 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(0, 0, 5, 5), segment(5, 5, 10, 0)), {
      point: { x: 5, y: 5 },
      tA: 1,
      tB: 0,
    });
  });

  test('non-parallel segment가 시작점을 공유하면 point를 반환한다', () => {
    const a = segment(0, 0, 1, 0);
    const b = segment(0, 0, 0, 1);
    const result = segmentSegmentDetail(a, b);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expectPointDetail(result, { point: { x: 0, y: 0 }, tA: 0, tB: 0 });
  });

  test('collinear endpoint touch는 overlap이 아니라 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(0, 0, 5, 0), segment(5, 0, 10, 0)), {
      point: { x: 5, y: 0 },
      tA: 1,
      tB: 0,
    });
  });
});

describe('segmentSegmentDetail — overlap 분기', () => {
  test('collinear overlap은 a 기준 오름차순 start/end와 parameter interval을 반환한다', () => {
    expectOverlapDetail(segmentSegmentDetail(segment(0, 0, 10, 0), segment(5, 0, 15, 0)), {
      start: { x: 5, y: 0 },
      end: { x: 10, y: 0 },
      tA: [0.5, 1],
      tB: [0, 0.5],
    });
  });

  test('b가 반대 방향이어도 start/end는 a parameter 오름차순이다', () => {
    // b는 (15,0)->(5,0) 방향이므로 start(5,0)의 b parameter는 1, end(10,0)은 0.5
    expectOverlapDetail(segmentSegmentDetail(segment(0, 0, 10, 0), segment(15, 0, 5, 0)), {
      start: { x: 5, y: 0 },
      end: { x: 10, y: 0 },
      tA: [0.5, 1],
      tB: [1, 0.5],
    });
  });
});

describe('segmentSegmentDetail — none 분기', () => {
  test('평행 disjoint segment는 none을 반환한다', () => {
    expect(segmentSegmentDetail(segment(0, 0, 10, 0), segment(0, 1, 10, 1))).toEqual({ kind: 'none' });
  });

  test('collinear non-overlap segment는 none을 반환한다', () => {
    expect(segmentSegmentDetail(segment(0, 0, 5, 0), segment(6, 0, 10, 0))).toEqual({ kind: 'none' });
  });

  test('교차하지 않는 skew segment는 none을 반환한다', () => {
    expect(segmentSegmentDetail(segment(0, 0, 1, 0), segment(5, 5, 6, 6))).toEqual({ kind: 'none' });
  });
});
