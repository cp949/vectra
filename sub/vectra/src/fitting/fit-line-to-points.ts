import type { InfiniteLineWritable, Point } from '../types/flat-shapes.internal';
import { fitLineToPointsInto } from './fit-line-to-points-into';
import type { FitOptions } from './types';

/**
 * point collection에 total-least-squares line을 fitting해 새 plain object로 반환한다.
 *
 * OLS slope fit이 아니라 PCA primary axis 기반 geometry line fit이다. `ox`, `oy`는 point centroid,
 * `dx`, `dy`는 unit-length principal primary axis다. vertical/horizontal line을 slope/intercept 없이
 * 자연스럽게 표현한다.
 *
 * 최소 sample count는 2다. point 수가 2 미만이거나 total variance가 `epsilon` 이하이면 `undefined`를
 * 반환한다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * degenerate 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * @param points line을 fitting할 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 옵션을 생략하면 `epsilon`은 `1e-9`
 */
export function fitLineToPoints(points: readonly Point[], options?: FitOptions): InfiniteLineWritable | undefined {
  const out = { ox: 0, oy: 0, dx: 0, dy: 0 };
  return fitLineToPointsInto(out, points, options) === false ? undefined : out;
}
