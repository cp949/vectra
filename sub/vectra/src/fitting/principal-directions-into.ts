import { writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { computePrincipalAxes, materializeFinitePoints, resolveFitEpsilon } from './pca2.internal';
import type { FitOptions, PrincipalDirectionsWritable } from './types';

/**
 * point collection의 2D principal axis pair를 `out`에 기록하고 성공 여부를 반환한다.
 *
 * centered 2x2 covariance scatter matrix의 eigenvector pair를 계산한다. `out.primary`는 큰 variance
 * axis, `out.secondary`는 직교 axis이며 두 축 모두 unit length다. 각 축은 첫 strict non-zero
 * component가 양수가 되도록 sign이 canonicalize된다.
 *
 * 최소 sample count는 2다. point 수가 2 미만이거나 total variance가 `epsilon` 이하(모든 point가
 * 사실상 한 점)이면 `false`를 반환하고 `out`을 수정하지 않는다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * degenerate 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * `out.primary`/`out.secondary`가 input point와 같은 object여도 alias-safe하다(모든 point 좌표를 먼저
 * 읽은 뒤에만 `out`을 쓴다).
 *
 * @param out principal axis pair를 기록할 writable output
 * @param points principal direction을 계산할 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 미지정 시 `epsilon`은 `1e-9`
 */
export function principalDirectionsInto<Out extends PrincipalDirectionsWritable<XYWritable, XYWritable>>(
  out: Out,
  points: readonly XYInput[],
  options?: FitOptions
): Out | false {
  const epsilon = resolveFitEpsilon(options, 'options');
  const { xs, ys } = materializeFinitePoints(points, 'points');
  const axes = computePrincipalAxes(xs, ys, epsilon);
  if (axes === undefined) {
    return false;
  }
  writeXY(out.primary, axes.primaryX, axes.primaryY);
  writeXY(out.secondary, axes.secondaryX, axes.secondaryY);
  return out;
}
