import type { CircleWritable, XYInput } from '../types';
import { fitCircleToPointsInto } from './fit-circle-to-points-into';
import type { FitOptions } from './types';

/**
 * point collection에 algebraic least-squares circle을 fitting해 새 plain object로 반환한다.
 *
 * 방정식 `x^2 + y^2 + d*x + e*y + f = 0`을 centroid 기준 frame에서 풀고 center를 원래 좌표계로
 * 되돌린다. `radius`는 frame 이동에 불변이다. 세 점이면 exact circle, 네 점 이상이면
 * overdetermined least-squares fit이다.
 *
 * 최소 sample count는 3이다. point 수가 3 미만이거나, collinear/rank-deficient(duplicate-heavy 포함)로
 * normal matrix가 singular하거나, radius squared가 `epsilon` 이하이거나, 결과가 non-finite이면
 * `undefined`를 반환한다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * singular/degenerate 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * @param points circle을 fitting할 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 미지정 시 `epsilon`은 `1e-9`
 */
export function fitCircleToPoints(points: readonly XYInput[], options?: FitOptions): CircleWritable | undefined {
  const out = { center: { x: 0, y: 0 }, radius: 0 };
  return fitCircleToPointsInto(out, points, options) === false ? undefined : out;
}
