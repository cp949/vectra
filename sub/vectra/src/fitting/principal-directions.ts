import type { XYInput } from '../types';
import { principalDirectionsInto } from './principal-directions-into';
import type { FitOptions, PrincipalDirections } from './types';

/**
 * point collection의 2D principal axis pair를 새 plain object로 반환한다.
 *
 * `primary`는 큰 variance axis, `secondary`는 직교 axis이며 두 축 모두 unit length다. 각 축은 첫
 * strict non-zero component가 양수가 되도록 sign이 canonicalize된다.
 *
 * 최소 sample count는 2다. point 수가 2 미만이거나 total variance가 `epsilon` 이하이면 `undefined`를
 * 반환한다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * degenerate 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * @param points principal direction을 계산할 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 미지정 시 `epsilon`은 `1e-9`
 */
export function principalDirections(points: readonly XYInput[], options?: FitOptions): PrincipalDirections | undefined {
  const out = { primary: { x: 0, y: 0 }, secondary: { x: 0, y: 0 } };
  return principalDirectionsInto(out, points, options) === false ? undefined : out;
}
