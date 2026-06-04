import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input 벡터를 원점 기준으로 CCW 회전하여 out에 기록하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input 회전할 입력 벡터
 * @param angle CCW 회전각(라디안)
 */
export function rotateInto<Out extends XYWritable>(out: Out, input: XYInput, angle: number): Out {
  const x = readX(input);
  const y = readY(input);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return writeXY(out, x * cos - y * sin, x * sin + y * cos);
}
