import type { Point } from '../types/flat-shapes.internal';

/**
 * x, y 모두 유한한 값이면 true를 반환한다.
 *
 * 전역 `isFinite`와 이름이 같으나 내부에서 `Number.isFinite`를 사용해 NaN-safe한 동작을 보장한다.
 *
 * @param input 유한성을 검사할 벡터
 */
// public API name mirrors Number.isFinite semantics for vectors.
export function isFinite(input: Point): boolean {
  return Number.isFinite(input.x) && Number.isFinite(input.y);
}
