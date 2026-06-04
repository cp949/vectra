import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { assertFiniteNumbers } from './interpolation.internal';

/**
 * a와 b 사이의 선형 보간 좌표를 out에 기록하고 out을 반환한다.
 *
 * `t`를 `[0, 1]`로 clamp하지 않으며 extrapolation을 허용한다.
 * a, b의 x/y와 t는 finite number여야 한다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 보간 시작 좌표
 * @param b 보간 끝 좌표
 * @param t 보간 비율. clamp 없음, extrapolation 허용
 */
export function lerpPointInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, t: number): Out {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  assertFiniteNumbers([ax, ay, bx, by, t]);
  // a/b 읽기 완료 후 out에 쓰므로 aliasing safe
  return writeXY(out, ax + (bx - ax) * t, ay + (by - ay) * t);
}
