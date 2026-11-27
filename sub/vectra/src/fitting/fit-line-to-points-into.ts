import type { InfiniteLineWritable, Point } from '../types/flat-shapes.internal';
import { computePrincipalAxes, materializeFinitePoints, resolveFitEpsilon } from './pca2.internal';
import type { FitOptions } from './types';

/**
 * point collection에 total-least-squares line을 fitting해 `out`에 기록하고 성공 여부를 반환한다.
 *
 * OLS slope fit이 아니라 PCA primary axis 기반 geometry line fit이다. `out.ox`, `out.oy`는 point centroid,
 * `out.dx`, `out.dy`는 unit-length principal primary axis다. vertical/horizontal line을 slope/intercept
 * 없이 자연스럽게 표현한다.
 *
 * 최소 sample count는 2다. point 수가 2 미만이거나 total variance가 `epsilon` 이하(모든 point가 사실상
 * 한 점)이면 `false`를 반환하고 `out`을 수정하지 않는다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * degenerate 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * 모든 점 좌표를 읽은 뒤에 out에 기록한다.
 *
 * @param out fitting line을 기록할 writable infinite-line output
 * @param points line을 fitting할 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 옵션을 생략하면 `epsilon`은 `1e-9`
 */
export function fitLineToPointsInto<Out extends InfiniteLineWritable>(
  out: Out,
  points: readonly Point[],
  options?: FitOptions
): Out | false {
  const epsilon = resolveFitEpsilon(options, 'options');
  const { xs, ys } = materializeFinitePoints(points, 'points');
  const axes = computePrincipalAxes(xs, ys, epsilon);
  if (axes === undefined) {
    return false;
  }
  out.ox = axes.centroidX;
  out.oy = axes.centroidY;
  out.dx = axes.primaryX;
  out.dy = axes.primaryY;
  return out;
}
