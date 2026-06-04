import type { TriangleLike } from '../types';
import { interiorAnglesInto } from './interior-angles-into';

/**
 * triangle의 세 내각(radian)을 새 배열로 반환한다.
 *
 * vertex A, B, C 순으로 내각을 담은 배열을 반환한다. 반환 배열 길이는 항상 3이다.
 * degenerate triangle도 raw 산식으로 계산한다(0 또는 π 포함 가능).
 * 영벡터 방향이 있는 vertex의 내각은 0으로 push한다.
 *
 * @param triangle 내각을 계산할 triangle
 */
export function interiorAngles(triangle: TriangleLike): number[] {
  return interiorAnglesInto([], triangle);
}
