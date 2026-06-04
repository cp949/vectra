import type { BoundsLike } from '../types';
import { pointInBoundsInto } from './point-in-bounds-into';
import type { RandomSource } from './random';

/**
 * bounds 내부의 무작위 점을 새 object로 반환한다.
 *
 * `max.x < min.x` 또는 `max.y < min.y`이면 undefined를 반환한다.
 *
 * @param bounds - 대상 bounds. min/max corner를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInBounds(bounds: BoundsLike, rng?: RandomSource): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointInBoundsInto(out, bounds, rng) ? out : undefined;
}
