import { lerpPointInto } from '../interpolation/lerp-point-into';
import type { XYInput, XYWritable } from '../types';

/**
 * a와 b 사이의 선형 보간 벡터를 out에 기록하고 out을 반환한다.
 *
 * `interpolation.lerpPointInto`와 동일한 계산 및 정책을 사용하는 vec 도메인 alias다.
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * a, b의 x/y와 t는 finite number여야 한다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 보간 시작 벡터
 * @param b 보간 끝 벡터
 * @param t 보간 비율. clamp 없음, extrapolation 허용
 */
export function lerpInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, t: number): Out {
  return lerpPointInto(out, a, b, t);
}
