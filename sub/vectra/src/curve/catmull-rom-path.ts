import type { CatmullRomOptions, PathCommand, XYInput } from '../types';
import { catmullRomPathInto } from './catmull-rom-path-into';

/**
 * Catmull-Rom 곡선을 cubic Bezier PathCommand[]로 변환한 새 배열을 반환한다.
 *
 * n < 2이면 빈 배열을 반환한다.
 * 성능 최적화가 필요하면 `catmullRomPathInto`를 사용한다.
 *
 * @param points 곡선이 통과할 보간 점 배열
 * @param options alpha(0=uniform, 0.5=centripetal, 1=chordal), closed 옵션
 * @returns 새로 만든 PathCommand 배열
 */
export function catmullRomPath(points: readonly XYInput[], options?: CatmullRomOptions): PathCommand[] {
  return catmullRomPathInto([], points, options);
}
