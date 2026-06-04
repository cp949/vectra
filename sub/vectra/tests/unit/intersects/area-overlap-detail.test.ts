/**
 * area overlap detail consumer helper 단위 테스트.
 *
 * S11-RM-025: rect/bounds/circle area overlap 분류를
 * none/touch/overlap/contains 분기, touch point 개수와 좌표, tuple 입력으로 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { boundsBoundsAreaOverlapDetail } from '../../../src/intersects/bounds-bounds-area-overlap-detail';
import { circleCircleAreaOverlapDetail } from '../../../src/intersects/circle-circle-area-overlap-detail';
import { rectRectAreaOverlapDetail } from '../../../src/intersects/rect-rect-area-overlap-detail';
import type { AreaOverlapDetail, BoundsLike, CircleLike, RectLike } from '../../../src/types';

const rect = (x: number, y: number, width: number, height: number): RectLike => ({ x, y, width, height });
const bounds = (minX: number, minY: number, maxX: number, maxY: number): BoundsLike => ({
  min: { x: minX, y: minY },
  max: { x: maxX, y: maxY },
});
const circle = (cx: number, cy: number, radius: number): CircleLike => ({ center: { x: cx, y: cy }, radius });

/** detail의 touch point 좌표 배열 (touch가 아니면 빈 배열) */
function touchPoints(detail: AreaOverlapDetail): Array<[number, number]> {
  return detail.kind === 'touch' ? detail.points.map((pt) => [pt.x, pt.y]) : [];
}

describe('rectRectAreaOverlapDetail', () => {
  test('분리된 rect는 none이다', () => {
    expect(rectRectAreaOverlapDetail(rect(0, 0, 4, 4), rect(10, 10, 4, 4))).toEqual({ kind: 'none' });
  });

  test('empty rect(width <= 0)는 none이다', () => {
    expect(rectRectAreaOverlapDetail(rect(0, 0, 0, 4), rect(0, 0, 4, 4))).toEqual({ kind: 'none' });
    expect(rectRectAreaOverlapDetail(rect(0, 0, 4, 4), rect(0, 0, 4, -1))).toEqual({ kind: 'none' });
  });

  test('corner touch는 touch point 1개다', () => {
    const detail = rectRectAreaOverlapDetail(rect(0, 0, 4, 4), rect(4, 4, 4, 4));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([[4, 4]]);
  });

  test('세로 edge touch는 touch point 2개다', () => {
    const detail = rectRectAreaOverlapDetail(rect(0, 0, 4, 4), rect(4, 0, 4, 4));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([
      [4, 0],
      [4, 4],
    ]);
  });

  test('큰 좌표의 edge touch도 finite touch point를 반환한다', () => {
    const x = 1e308;
    const width = 1e292;
    const touchX = x + width;
    const detail = rectRectAreaOverlapDetail(rect(x, 0, width, 4), rect(touchX, 0, width, 4));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([
      [touchX, 0],
      [touchX, 4],
    ]);
  });

  test('가로 edge touch는 touch point 2개다', () => {
    const detail = rectRectAreaOverlapDetail(rect(0, 0, 4, 4), rect(0, 4, 4, 4));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([
      [0, 4],
      [4, 4],
    ]);
  });

  test('non-finite 좌표/크기는 none이다', () => {
    expect(rectRectAreaOverlapDetail(rect(Number.NaN, 0, 4, 4), rect(0, 0, 4, 4))).toEqual({ kind: 'none' });
    expect(rectRectAreaOverlapDetail(rect(0, 0, Number.POSITIVE_INFINITY, 4), rect(0, 0, 4, 4))).toEqual({
      kind: 'none',
    });
  });

  test('derived max boundary가 overflow하면 none이다', () => {
    expect(rectRectAreaOverlapDetail(rect(Number.MAX_VALUE, 0, Number.MAX_VALUE, 4), rect(0, 0, 4, 4))).toEqual({
      kind: 'none',
    });
  });

  test('derived max boundary overflow가 touch/contains를 만들지 않는다', () => {
    expect(rectRectAreaOverlapDetail(rect(1e308, 0, 1e308, 4), rect(1e308, 0, 4, 4))).toEqual({
      kind: 'none',
    });
  });

  test('부분 면적 중첩은 overlap이다', () => {
    expect(rectRectAreaOverlapDetail(rect(0, 0, 4, 4), rect(2, 2, 4, 4))).toEqual({ kind: 'overlap' });
  });

  test('한쪽이 다른 쪽을 포함하면 contains다', () => {
    expect(rectRectAreaOverlapDetail(rect(0, 0, 10, 10), rect(2, 2, 4, 4))).toEqual({ kind: 'contains' });
  });

  test('완전히 같은 rect는 contains다', () => {
    expect(rectRectAreaOverlapDetail(rect(0, 0, 4, 4), rect(0, 0, 4, 4))).toEqual({ kind: 'contains' });
  });

  test('tuple rect 입력을 지원한다', () => {
    expect(rectRectAreaOverlapDetail([0, 0, 4, 4], [2, 2, 4, 4])).toEqual({ kind: 'overlap' });
  });
});

describe('boundsBoundsAreaOverlapDetail', () => {
  test('분리된 bounds는 none이다', () => {
    expect(boundsBoundsAreaOverlapDetail(bounds(0, 0, 4, 4), bounds(10, 10, 14, 14))).toEqual({ kind: 'none' });
  });

  test('inverted bounds(max < min)는 none이다', () => {
    expect(boundsBoundsAreaOverlapDetail(bounds(4, 4, 0, 0), bounds(0, 0, 4, 4))).toEqual({ kind: 'none' });
  });

  test('non-finite 좌표는 none이다', () => {
    expect(boundsBoundsAreaOverlapDetail(bounds(0, 0, Number.POSITIVE_INFINITY, 4), bounds(0, 0, 4, 4))).toEqual({
      kind: 'none',
    });
    expect(boundsBoundsAreaOverlapDetail(bounds(Number.NaN, 0, 4, 4), bounds(0, 0, 4, 4))).toEqual({ kind: 'none' });
  });

  test('derived width/height가 overflow하면 none이다', () => {
    expect(
      boundsBoundsAreaOverlapDetail(bounds(-Number.MAX_VALUE, 0, Number.MAX_VALUE, 4), bounds(0, 0, 4, 4))
    ).toEqual({
      kind: 'none',
    });
  });

  test('corner touch는 touch point 1개다', () => {
    const detail = boundsBoundsAreaOverlapDetail(bounds(0, 0, 4, 4), bounds(4, 4, 8, 8));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([[4, 4]]);
  });

  test('edge touch는 touch point 2개다', () => {
    const detail = boundsBoundsAreaOverlapDetail(bounds(0, 0, 4, 4), bounds(4, 0, 8, 4));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([
      [4, 0],
      [4, 4],
    ]);
  });

  test('부분 면적 중첩은 overlap이다', () => {
    expect(boundsBoundsAreaOverlapDetail(bounds(0, 0, 4, 4), bounds(2, 2, 6, 6))).toEqual({ kind: 'overlap' });
  });

  test('한쪽이 다른 쪽을 포함하면 contains다', () => {
    expect(boundsBoundsAreaOverlapDetail(bounds(0, 0, 10, 10), bounds(2, 2, 6, 6))).toEqual({ kind: 'contains' });
  });

  test('tuple bounds 입력을 지원한다', () => {
    expect(
      boundsBoundsAreaOverlapDetail(
        [
          [0, 0],
          [4, 4],
        ],
        [
          [2, 2],
          [6, 6],
        ]
      )
    ).toEqual({ kind: 'overlap' });
  });
});

describe('circleCircleAreaOverlapDetail', () => {
  test('분리된 circle은 none이다', () => {
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 1), circle(10, 0, 1))).toEqual({ kind: 'none' });
  });

  test('empty circle(radius <= 0)은 none이다', () => {
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 0), circle(0, 0, 4))).toEqual({ kind: 'none' });
    expect(circleCircleAreaOverlapDetail(circle(0, 0, -3), circle(0, 0, 4))).toEqual({ kind: 'none' });
  });

  test('non-finite center/radius는 none이다', () => {
    expect(circleCircleAreaOverlapDetail(circle(Number.NaN, 0, 1), circle(0, 0, 1))).toEqual({ kind: 'none' });
    expect(circleCircleAreaOverlapDetail(circle(0, Number.NaN, 1), circle(0, 0, 1))).toEqual({ kind: 'none' });
    expect(circleCircleAreaOverlapDetail(circle(0, 0, Number.POSITIVE_INFINITY), circle(0, 0, 1))).toEqual({
      kind: 'none',
    });
    expect(circleCircleAreaOverlapDetail(circle(0, 0, Number.NEGATIVE_INFINITY), circle(0, 0, 1))).toEqual({
      kind: 'none',
    });
    expect(circleCircleAreaOverlapDetail(circle(0, 0, Number.NaN), circle(0, 0, 1))).toEqual({ kind: 'none' });
    // 두 번째 circle의 non-finite center/radius도 none이다.
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 1), circle(Number.POSITIVE_INFINITY, 0, 1))).toEqual({
      kind: 'none',
    });
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 1), circle(0, 0, Number.NaN))).toEqual({ kind: 'none' });
  });

  test('external tangent는 touch point 1개다', () => {
    const detail = circleCircleAreaOverlapDetail(circle(0, 0, 2), circle(5, 0, 3));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([[2, 0]]);
  });

  test('finite extreme external tangent는 overflow 없이 touch다', () => {
    const detail = circleCircleAreaOverlapDetail(
      circle(-Number.MAX_VALUE, 0, Number.MAX_VALUE),
      circle(Number.MAX_VALUE, 0, Number.MAX_VALUE)
    );
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([[0, 0]]);
  });

  test('internal tangent(ra >= rb)는 touch point 1개다', () => {
    const detail = circleCircleAreaOverlapDetail(circle(0, 0, 4), circle(1, 0, 3));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([[4, 0]]);
  });

  test('internal tangent(ra < rb)는 a 중심 반대편 tangent point 1개다', () => {
    // 작은 disk a가 큰 disk b 안에 들어가 한 점으로 닿음. tangent는 a 중심에서 b 반대 방향.
    const detail = circleCircleAreaOverlapDetail(circle(0, 0, 2), circle(3, 0, 5));
    expect(detail.kind).toBe('touch');
    expect(touchPoints(detail)).toEqual([[-2, 0]]);
  });

  test('proper lens는 overlap이다', () => {
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 3), circle(4, 0, 3))).toEqual({ kind: 'overlap' });
  });

  test('한쪽이 다른 쪽을 포함하면 contains다', () => {
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 5), circle(1, 0, 2))).toEqual({ kind: 'contains' });
  });

  test('동심 반지름 다른 disk는 contains다', () => {
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 5), circle(0, 0, 2))).toEqual({ kind: 'contains' });
  });

  test('완전히 같은 disk는 contains다', () => {
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 3), circle(0, 0, 3))).toEqual({ kind: 'contains' });
  });

  test('epsilon보다 작은 coincident disk도 contains다', () => {
    expect(circleCircleAreaOverlapDetail(circle(0, 0, 1e-12), circle(0, 0, 1e-12))).toEqual({ kind: 'contains' });
  });

  test('tuple shorthand circle 입력을 지원한다', () => {
    expect(circleCircleAreaOverlapDetail([[0, 0], 3], [[4, 0], 3])).toEqual({ kind: 'overlap' });
  });
});
