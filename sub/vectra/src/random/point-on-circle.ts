import type { CircleLike } from '../types';
import { pointOnCircleInto } from './point-on-circle-into';
import type { RandomSource } from './random';

/**
 * circle 둘레(circumference) 위의 무작위 점을 새 object로 반환한다.
 *
 * `radius <= 0`이면 undefined를 반환한다.
 *
 * @param circle - 대상 circle. center와 radius를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointOnCircle(circle: CircleLike, rng?: RandomSource): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointOnCircleInto(out, circle, rng) ? out : undefined;
}
