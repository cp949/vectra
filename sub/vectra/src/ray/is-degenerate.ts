import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { RayLike } from '../types';

/**
 * direction length가 `epsilon` 이하이면 `true`를 반환한다.
 *
 * 비교는 `directionLengthSq <= epsilon * epsilon`으로 수행한다.
 *
 * @param ray 검사할 ray
 * @param epsilon direction length 임계값 (기본값 `1e-9`)
 */
export function isDegenerate(ray: RayLike, epsilon: number = DEFAULT_EPSILON): boolean {
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  return dx * dx + dy * dy <= epsilon * epsilon;
}
