import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * vector에서 basis 방향 성분을 제거한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `vector - dot(vector, basis) / lengthSq(basis) * basis`. basis는 임의 길이다.
 * `lengthSq(basis) === 0`이면 vector를 그대로 out에 복사한다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param out 결과를 기록할 writable output
 * @param vector 분리할 벡터
 * @param basis 제거할 방향 벡터 (임의 길이)
 */
export function rejectFromInto<Out extends XYWritable>(out: Out, vector: XYInput, basis: XYInput): Out {
  const vx = readX(vector);
  const vy = readY(vector);
  const bx = readX(basis);
  const by = readY(basis);
  const lsq = bx * bx + by * by;
  if (lsq === 0) return writeXY(out, vx, vy);
  const scale = (vx * bx + vy * by) / lsq;
  return writeXY(out, vx - scale * bx, vy - scale * by);
}
