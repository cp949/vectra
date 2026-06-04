import { midpointInto as midpointIntoImpl } from '../interpolation/midpoint-into';
import type { XYInput, XYWritable } from '../types';

/**
 * a와 b의 중점 벡터를 out에 기록하고 out을 반환한다.
 *
 * `interpolation.midpointInto`와 동일한 계산 및 정책을 사용하는 vec 도메인 alias다.
 * a, b의 x/y는 finite number여야 한다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 중점을 구할 첫 번째 벡터
 * @param b 중점을 구할 두 번째 벡터
 */
export function midpointInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  return midpointIntoImpl(out, a, b);
}
