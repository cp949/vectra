/**
 * circle × rect closest point helper 단위 테스트.
 *
 * S11-RM-026: circleRectClosestPoint(Into)의 outside clamp / inside boundary projection /
 * boundary center / tie / failure(empty·non-finite rect, negative·non-finite radius) /
 * companion allocation / tuple input을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { circleRectClosestPoint } from '../../../src/intersects/circle-rect-closest-point';
import { circleRectClosestPointInto } from '../../../src/intersects/circle-rect-closest-point-into';
import type { CircleLike, RectLike, XYObjectWritable } from '../../../src/types';

const circle = (cx: number, cy: number, radius: number): CircleLike => ({ center: { x: cx, y: cy }, radius });
const rect = (x: number, y: number, width: number, height: number): RectLike => ({ x, y, width, height });

/** Into로 closest point를 구해 `[ok, x, y]` 형태로 반환한다. */
function closest(c: CircleLike, r: RectLike): [boolean, number, number] {
  const out: XYObjectWritable = { x: 0, y: 0 };
  const ok = circleRectClosestPointInto(out, c, r);
  return [ok, out.x, out.y];
}

describe('circleRectClosestPoint outside center', () => {
  test('center가 rect 왼쪽 밖이면 left edge로 clamp한다', () => {
    expect(closest(circle(-5, 5, 1), rect(0, 0, 10, 10))).toEqual([true, 0, 5]);
  });

  test('center가 rect 위쪽 밖이면 top edge로 clamp한다', () => {
    expect(closest(circle(5, -5, 1), rect(0, 0, 10, 10))).toEqual([true, 5, 0]);
  });

  test('center가 대각선 밖이면 corner로 clamp한다', () => {
    expect(closest(circle(-5, -5, 1), rect(0, 0, 10, 10))).toEqual([true, 0, 0]);
    expect(closest(circle(15, 15, 1), rect(0, 0, 10, 10))).toEqual([true, 10, 10]);
  });
});

describe('circleRectClosestPoint inside center', () => {
  test('center가 내부면 가장 가까운 boundary point를 반환한다', () => {
    expect(closest(circle(2, 5, 1), rect(0, 0, 10, 10))).toEqual([true, 0, 5]);
    expect(closest(circle(8, 5, 1), rect(0, 0, 10, 10))).toEqual([true, 10, 5]);
    expect(closest(circle(5, 8, 1), rect(0, 0, 10, 10))).toEqual([true, 5, 10]);
  });

  test('exact center tie는 left edge로 deterministic하게 고정한다', () => {
    expect(closest(circle(5, 5, 1), rect(0, 0, 10, 10))).toEqual([true, 0, 5]);
  });

  test('left/right tie(세로로 긴 rect)는 left를 우선한다', () => {
    expect(closest(circle(5, 5, 1), rect(0, 0, 10, 20))).toEqual([true, 0, 5]);
  });
});

describe('circleRectClosestPoint boundary center', () => {
  test('center가 boundary 위면 그 boundary point를 반환한다', () => {
    expect(closest(circle(0, 5, 1), rect(0, 0, 10, 10))).toEqual([true, 0, 5]);
    expect(closest(circle(10, 3, 1), rect(0, 0, 10, 10))).toEqual([true, 10, 3]);
  });
});

describe('circleRectClosestPoint failure', () => {
  test('empty rect는 false + out 미수정이다', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(circleRectClosestPointInto(out, circle(5, 5, 1), rect(0, 0, 0, 10))).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
    expect(circleRectClosestPointInto(out, circle(5, 5, 1), rect(0, 0, 10, -1))).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('non-finite rect는 false + out 미수정이다', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(circleRectClosestPointInto(out, circle(5, 5, 1), rect(Number.NaN, 0, 10, 10))).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('negative/non-finite radius는 false + out 미수정이다', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(circleRectClosestPointInto(out, circle(5, 5, -1), rect(0, 0, 10, 10))).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
    expect(circleRectClosestPointInto(out, circle(5, 5, Number.NaN), rect(0, 0, 10, 10))).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('radius 0은 valid input이다', () => {
    expect(closest(circle(-5, 5, 0), rect(0, 0, 10, 10))).toEqual([true, 0, 5]);
  });
});

describe('circleRectClosestPoint companion / input', () => {
  test('성공 시 새 point object, 실패 시 undefined를 반환한다', () => {
    const point = circleRectClosestPoint(circle(-5, 5, 1), rect(0, 0, 10, 10));
    expect(point).toEqual({ x: 0, y: 5 });
    expect(circleRectClosestPoint(circle(5, 5, 1), rect(0, 0, 0, 10))).toBeUndefined();
  });

  test('tuple circle/rect input을 지원한다', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const ok = circleRectClosestPointInto(out, [[-5, 5], 1], [0, 0, 10, 10]);
    expect(ok).toBe(true);
    expect(out).toEqual({ x: 0, y: 5 });
  });
});
