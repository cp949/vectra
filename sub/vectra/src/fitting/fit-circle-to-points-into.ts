import { writeXY } from '../internal/xy';
import type { CircleWritable, XYInput, XYWritable } from '../types';
import { fitCircleAlgebraic } from './circle-fit.internal';
import { materializeFinitePoints, resolveFitEpsilon } from './pca2.internal';
import type { FitOptions } from './types';

/**
 * point collection에 algebraic least-squares circle을 fitting해 `out`에 기록하고 성공 여부를 반환한다.
 *
 * 방정식 `x^2 + y^2 + d*x + e*y + f = 0`을 centroid 기준 frame에서 풀고 center를 원래 좌표계로
 * 되돌린다. `out.radius`는 frame 이동에 불변이다. 세 점이면 exact circle, 네 점 이상이면
 * overdetermined least-squares fit이다.
 *
 * 최소 sample count는 3이다. point 수가 3 미만이거나, collinear/rank-deficient(duplicate-heavy 포함)로
 * normal matrix가 singular하거나, radius squared가 `epsilon` 이하이거나, 결과가 non-finite이면 `false`를
 * 반환하고 `out`을 수정하지 않는다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * singular/degenerate 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * `out.center`가 input point와 같은 object여도 alias-safe하다(모든 point 좌표를 먼저 읽은 뒤에만 `out`을
 * 쓴다).
 *
 * @param out circle을 기록할 writable output
 * @param points circle을 fitting할 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 미지정 시 `epsilon`은 `1e-9`
 */
export function fitCircleToPointsInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  points: readonly XYInput[],
  options?: FitOptions
): Out | false {
  const epsilon = resolveFitEpsilon(options, 'options');
  const { xs, ys } = materializeFinitePoints(points, 'points');
  if (xs.length < 3) {
    return false;
  }
  const fit = fitCircleAlgebraic(xs, ys, epsilon);
  if (fit === undefined) {
    return false;
  }
  writeXY(out.center, fit.centerX, fit.centerY);
  out.radius = fit.radius;
  return out;
}
