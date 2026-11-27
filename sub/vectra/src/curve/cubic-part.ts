import { createZeroCubicCurve } from '../internal/curve-shapes';
import type { CubicCurve, CubicCurveWritable } from '../types/flat-shapes.internal';
import { cubicPartInto } from './cubic-part-into';

/**
 * cubic Bezier curve의 파라미터 구간 [fromT, toT]에 해당하는 sub-curve를 새 object로 반환한다.
 *
 * `cubicPartInto`의 allocating companion. 결과는 plain object `{ curve }`다.
 *
 *
 * clamp/정규화/fallback 정책은 `cubicPartInto`와 동일하다.
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param fromT 구간 시작 파라미터
 * @param toT 구간 끝 파라미터
 */
export function cubicPart(curve: CubicCurve, fromT: number, toT: number): CubicCurveWritable {
  const out = createZeroCubicCurve();
  return cubicPartInto(out, curve, fromT, toT);
}
