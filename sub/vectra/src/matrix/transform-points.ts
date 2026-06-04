import type { MatrixLike, XYInput, XYObjectWritable } from '../types';
import { transformPointsInto } from './transform-points-into';

/**
 * points 각 원소에 matrix를 적용한 결과를 새 plain point array로 반환한다.
 *
 * 결과 array 길이는 `points.length`다. 빈 input은 빈 array를 반환한다. 각 원소는 새
 * `{ x, y }` plain object다.
 *
 * matrix component나 point component에 NaN/Infinity가 있으면 검증하지 않고 JS 산술 결과를
 * 그대로 반환한다 (caller 책임).
 *
 * @param matrix point에 적용할 matrix
 * @param points 변환할 point input array
 */
export function transformPoints(matrix: MatrixLike, points: readonly XYInput[]): XYObjectWritable[] {
  const out: XYObjectWritable[] = new Array(points.length);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = { x: 0, y: 0 };
  }
  return transformPointsInto(out, matrix, points);
}
