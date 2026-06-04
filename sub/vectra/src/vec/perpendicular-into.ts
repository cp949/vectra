import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input 벡터의 CCW 90도 수직 벡터 (-y, x)를 out에 기록하고 out을 반환한다.
 *
 * 영 벡터 입력에서는 throw하지 않고 (0, 0)을 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input CCW 90도 회전할 입력 벡터
 */
export function perpendicularInto<Out extends XYWritable>(out: Out, input: XYInput): Out {
  const x = readX(input);
  const y = readY(input);

  return writeXY(out, -y, x);
}
