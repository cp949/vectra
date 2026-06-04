import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input 벡터의 CW 수직 방향 단위 벡터 (y, -x) 방향을 normalize해서 out에 기록하고 out을 반환한다.
 *
 * zero vector 입력에서는 throw하지 않고 (0, 0)을 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * NaN / Infinity 입력은 JavaScript 산술 결과를 그대로 out에 기록한다.
 *
 * @param out 결과를 기록할 writable output
 * @param input CW normal을 구할 입력 벡터
 */
export function normalRightInto<Out extends XYWritable>(out: Out, input: XYInput): Out {
  const x = readX(input);
  const y = readY(input);
  const nx = y;
  const ny = -x;
  const len = Math.hypot(nx, ny);

  return len === 0 ? writeXY(out, 0, 0) : writeXY(out, nx / len, ny / len);
}
