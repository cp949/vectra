import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * input에 scalar를 곱한 벡터를 새 object로 반환한다.
 *
 * @param input 배율을 적용할 입력 벡터
 * @param scalar 각 성분에 곱할 스칼라 값
 */
export function scale(input: Point, scalar: number): PointWritable {
  return { x: input.x * scalar, y: input.y * scalar };
}
