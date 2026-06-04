import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * from에서 to 방향 단위 벡터를 out에 기록하고 out을 반환한다.
 *
 * from === to (같은 점) 또는 zero-length 차이 벡터에서는 throw하지 않고 (0, 0)을 기록한다.
 * from 또는 to가 out과 같은 object여도 안전하다.
 *
 * NaN / Infinity 입력은 JavaScript 산술 결과를 그대로 out에 기록한다.
 *
 * @param out 결과를 기록할 writable output
 * @param from 방향 벡터 시작점
 * @param to 방향 벡터 끝점
 */
export function directionToInto<Out extends XYWritable>(out: Out, from: XYInput, to: XYInput): Out {
  const dx = readX(to) - readX(from);
  const dy = readY(to) - readY(from);
  const len = Math.hypot(dx, dy);

  return len === 0 ? writeXY(out, 0, 0) : writeXY(out, dx / len, dy / len);
}
