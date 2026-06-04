import { directionInto } from './direction-into';
import type { RandomSource } from './random';

/**
 * angle-uniform 방향 벡터를 새 object로 반환한다.
 *
 * @param length - 벡터 길이. 생략하면 1을 사용한다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function direction(length?: number, rng?: RandomSource): { x: number; y: number } {
  const out = { x: 0, y: 0 };
  directionInto(out, length, rng);
  return out;
}
