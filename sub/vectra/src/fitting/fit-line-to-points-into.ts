import { writeXY } from '../internal/xy';
import type { InfiniteLineWritable, XYInput, XYWritable } from '../types';
import { computePrincipalAxes, materializeFinitePoints, resolveFitEpsilon } from './pca2.internal';
import type { FitOptions } from './types';

/**
 * point collection에 total-least-squares line을 fitting해 `out`에 기록하고 성공 여부를 반환한다.
 *
 * OLS slope fit이 아니라 PCA primary axis 기반 geometry line fit이다. `out.origin`은 point centroid,
 * `out.direction`은 unit-length principal primary axis다. vertical/horizontal line을 slope/intercept
 * 없이 자연스럽게 표현한다.
 *
 * 최소 sample count는 2다. point 수가 2 미만이거나 total variance가 `epsilon` 이하(모든 point가 사실상
 * 한 점)이면 `false`를 반환하고 `out`을 수정하지 않는다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * degenerate 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * `out.origin`/`out.direction`이 input point와 같은 object여도 alias-safe하다(모든 point 좌표를 먼저
 * 읽은 뒤에만 `out`을 쓴다).
 *
 * @param out fitting line을 기록할 writable infinite-line output
 * @param points line을 fitting할 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 미지정 시 `epsilon`은 `1e-9`
 */
export function fitLineToPointsInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
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
  writeXY(out.origin, axes.centroidX, axes.centroidY);
  writeXY(out.direction, axes.primaryX, axes.primaryY);
  return out;
}
