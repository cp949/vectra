import type { CardinalOptions } from '../types';
import type { Point } from '../types/flat-shapes.internal';
import { cardinalPointAtTInto } from './cardinal-point-at-t-into';

/**
 * Cardinal spline 곡선 위의 t 위치 점을 새 object로 반환한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `cardinalPointAtTInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `cardinalPointAtTInto`와 동일하다.
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터
 * @param options tension과 closed 옵션
 * @returns {x, y} 좌표
 */
export function cardinalPointAtT(
  points: readonly Point[],
  t: number,
  options?: Required<CardinalOptions>
): { x: number; y: number } {
  return cardinalPointAtTInto({ x: 0, y: 0 }, points, t, options);
}
