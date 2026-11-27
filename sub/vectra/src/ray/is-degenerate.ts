import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ray } from '../types/flat-shapes.internal';

/**
 * direction length가 `epsilon` 이하이면 `true`를 반환한다.
 *
 * 비교는 `directionLengthSq <= epsilon * epsilon`으로 수행한다.
 *
 * @param ray 검사할 ray
 * @param epsilon direction length 임계값 (기본값 `1e-9`)
 */
export function isDegenerate(ray: Ray, epsilon: number = DEFAULT_EPSILON): boolean {
  const { dx, dy } = ray;
  return dx * dx + dy * dy <= epsilon * epsilon;
}
