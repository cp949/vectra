import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { assertFiniteNumbers } from './interpolation.internal';

/**
 * a와 b의 중점을 out에 기록하고 out을 반환한다.
 *
 * `lerpPointInto(out, a, b, 0.5)`와 동일한 결과다.
 * a, b의 x/y는 finite number여야 한다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 중점을 구할 첫 번째 좌표
 * @param b 중점을 구할 두 번째 좌표
 */
export function midpointInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  assertFiniteNumbers([ax, ay, bx, by]);
  // a/b 읽기 완료 후 out에 쓰므로 aliasing safe
  return writeXY(out, ax + (bx - ax) * 0.5, ay + (by - ay) * 0.5);
}
