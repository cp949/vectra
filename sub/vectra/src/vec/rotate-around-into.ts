import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input 벡터를 center 기준으로 CCW 회전하여 out에 기록하고 out을 반환한다.
 *
 * input 또는 center가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input 회전할 입력 벡터
 * @param center 회전 기준점
 * @param angle CCW 회전각(라디안)
 */
export function rotateAroundInto<Out extends XYWritable>(
  out: Out,
  input: XYInput,
  center: XYInput,
  angle: number
): Out {
  // 모든 입력을 먼저 읽어 output aliasing을 방지한다.
  const ix = readX(input);
  const iy = readY(input);
  const cx = readX(center);
  const cy = readY(center);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const dx = ix - cx;
  const dy = iy - cy;

  return writeXY(out, cx + dx * cos - dy * sin, cy + dx * sin + dy * cos);
}
