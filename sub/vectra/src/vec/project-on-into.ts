import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * vector를 unit direction에 투영한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `dot(vector, direction) * direction`. direction은 unit vector 전제 (정규화 없음).
 *
 * @param out 결과를 기록할 writable output
 * @param vector 투영할 벡터
 * @param direction 투영 방향 (unit vector 전제)
 */
export function projectOnInto<Out extends XYWritable>(out: Out, vector: XYInput, direction: XYInput): Out {
  const vx = readX(vector);
  const vy = readY(vector);
  const dx = readX(direction);
  const dy = readY(direction);

  const dot = vx * dx + vy * dy;

  return writeXY(out, dot * dx, dot * dy);
}
