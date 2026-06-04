import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * vector를 unit normal에 대해 반사한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `vector - 2 * dot(vector, normal) * normal`. normal은 unit vector 전제 (정규화 없음).
 *
 * @param out 결과를 기록할 writable output
 * @param vector 반사할 벡터
 * @param normal 반사 기준 법선 벡터 (unit vector 전제)
 */
export function reflectAcrossNormalInto<Out extends XYWritable>(out: Out, vector: XYInput, normal: XYInput): Out {
  const vx = readX(vector);
  const vy = readY(vector);
  const nx = readX(normal);
  const ny = readY(normal);

  const dot2 = 2 * (vx * nx + vy * ny);

  return writeXY(out, vx - dot2 * nx, vy - dot2 * ny);
}
