import type { CircleWritable, TriangleLike, XYObjectWritable } from '../types';
import { excirclesInto } from './excircles-into';

/**
 * triangle의 방접원(excircle) 3개를 새 배열로 반환한다.
 *
 * 성공 시 index 0은 A-opposite, index 1은 B-opposite, index 2는 C-opposite excircle이다.
 * degenerate triangle(collinear, non-finite vertex, 또는 반둘레 분모가 0인 경우)이면
 * 빈 배열을 반환한다.
 *
 * @param triangle 방접원을 계산할 triangle
 */
export function excircles(triangle: TriangleLike): CircleWritable<XYObjectWritable>[] {
  return excirclesInto([], triangle);
}
