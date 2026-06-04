import type { RectLike } from '../types';
import { pointInRectInto } from './point-in-rect-into';
import type { RandomSource } from './random';

/**
 * rect 내부의 무작위 점을 새 object로 반환한다.
 *
 * `width <= 0` 또는 `height <= 0`이면 undefined를 반환한다.
 *
 * @param rect - 대상 rect
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInRect(rect: RectLike, rng?: RandomSource): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointInRectInto(out, rect, rng) ? out : undefined;
}
