import type { TriangleLike, XYObjectWritable } from '../types';
import { excentersInto } from './excenters-into';

/**
 * triangle의 방심(excenter) 3개를 새 배열로 반환한다.
 *
 * 성공 시 index 0은 A-opposite, index 1은 B-opposite, index 2는 C-opposite excenter다.
 * degenerate triangle(collinear, non-finite vertex, 또는 반둘레 분모가 0인 경우)이면
 * 빈 배열을 반환한다.
 *
 * @param triangle 방심을 계산할 triangle
 */
export function excenters(triangle: TriangleLike): XYObjectWritable[] {
  return excentersInto([], triangle);
}
