import type { CatmullRomOptions, XYInput } from '../types';
import { catmullRomPointAtTInto } from './catmull-rom-point-at-t-into';

/**
 * Catmull-Rom 곡선 위의 t 위치 점을 새 object로 반환한다.
 *
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터
 * @param options alpha, closed 옵션
 * @returns {x, y} 좌표
 */
export function catmullRomPointAtT(
  points: readonly XYInput[],
  t: number,
  options?: CatmullRomOptions
): { x: number; y: number } {
  return catmullRomPointAtTInto({ x: 0, y: 0 }, points, t, options);
}
