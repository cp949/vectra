import type { CircleLike } from '../types';
import { pointInCircleInto } from './point-in-circle-into';
import type { RandomSource } from './random';

/**
 * circle 내부의 무작위 점을 면적 균등 분포(area-uniform)로 새 object로 반환한다.
 *
 * `radius <= 0`이면 undefined를 반환한다.
 *
 * @param circle - 대상 circle. center와 radius를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInCircle(circle: CircleLike, rng?: RandomSource): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointInCircleInto(out, circle, rng) ? out : undefined;
}
