import type { BoundsLike } from '../types';
import { groupBoundsInto } from './group-bounds-into';

/**
 * bounds 배열의 union AABB를 plain BoundsLike object로 반환한다.
 *
 * 빈 입력이면 undefined를 반환한다. allocating companion.
 * inverted bounds(min > max)는 그대로 사용한다. caller가 사전 정규화한다고 가정한다.
 * NaN/Infinity 좌표는 silent propagation(IEEE-754 동작).
 *
 * @param bounds union을 계산할 bounds 입력 배열
 */
export function groupBounds(
  bounds: readonly BoundsLike[]
): { min: { x: number; y: number }; max: { x: number; y: number } } | undefined {
  const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  const ok = groupBoundsInto(out, bounds);
  return ok ? out : undefined;
}
