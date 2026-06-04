import type { RectLike, XYWritable } from '../types';
import { perimeterPointsInto } from './perimeter-points-into';

/**
 * rect perimeter 위 point 배열을 새 배열로 반환한다.
 *
 * options 분기:
 * - `{ count }`: `count`개 point를 `t = i / count`로 sampling.
 *   `count === 4`이면 네 corner를 반환한다.
 *   `count`는 positive integer여야 한다. 위반 시 `RangeError`.
 * - `{ step }`: perimeter 위 절대 거리 간격으로 sampling.
 *   `dist = 0, step, 2*step, ...` (dist < perimeter 조건). `t = dist / perimeter`.
 *   `step`은 finite positive number여야 한다. 위반 시 `RangeError`.
 *
 * `wrap` 옵션은 `perimeterPointInto`에 그대로 위임한다. 기본값: `true`.
 *
 * empty rect (`width <= 0 || height <= 0`):
 * - perimeter가 0이므로 빈 배열을 반환한다.
 * - invalid count/step은 empty rect에서도 `RangeError`를 던진다.
 *
 * @param rect 기준 rect
 * @param options `{ count, wrap? }` 또는 `{ step, wrap? }` 형태의 sampling 옵션
 */
export function perimeterPoints(
  rect: RectLike,
  options: { count: number; wrap?: boolean } | { step: number; wrap?: boolean }
): { x: number; y: number }[] {
  const out: XYWritable[] = [];
  perimeterPointsInto(out, rect, options);
  return out as { x: number; y: number }[];
}
