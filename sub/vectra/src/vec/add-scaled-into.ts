import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * a에 b * scalar를 더한 벡터를 out에 기록하고 out을 반환한다.
 *
 * b를 먼저 scalar로 곱한 뒤 a에 더한다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 기준 벡터
 * @param b scalar를 곱할 벡터
 * @param scalar b에 곱할 스칼라값
 */
export function addScaledInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, scalar: number): Out {
  // aliasing에 안전하도록 a와 b의 성분을 모두 먼저 읽는다
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  return writeXY(out, ax + bx * scalar, ay + by * scalar);
}
