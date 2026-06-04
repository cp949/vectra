/**
 * fitting domain이 공유하는 2D PCA / point validation core helper.
 *
 * centered 2x2 covariance scatter matrix의 closed-form symmetric eigen 분해로 principal axis pair와
 * centroid를 계산한다. `principalDirections*`와 `fitLineToPoints*`가 같은 helper를 호출해 public leaf
 * 상호 import를 피한다.
 */

import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';
import type { FitOptions } from './types';

/** rank/degenerate 판정의 default tolerance. */
export const DEFAULT_FIT_EPSILON = 1e-9;

/**
 * `FitOptions.epsilon`을 검증하고 미지정 시 default(`DEFAULT_FIT_EPSILON`)를 반환한다.
 *
 * `epsilon`이 NaN, Infinity, 음수이면 `RangeError`. 다른 input 검증보다 먼저 호출한다.
 *
 * @param options fitting 옵션. `undefined`이면 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
export function resolveFitEpsilon(options: FitOptions | undefined, name: string): number {
  const epsilon = options?.epsilon;
  if (epsilon === undefined) {
    return DEFAULT_FIT_EPSILON;
  }
  if (!Number.isFinite(epsilon) || epsilon < 0) {
    throw new RangeError(`${name}.epsilon must be a finite number >= 0, got ${String(epsilon)}`);
  }
  return epsilon;
}

/**
 * point collection의 모든 좌표가 finite한지 검증하면서 좌표를 fresh 배열로 materialize한다.
 *
 * non-finite 좌표는 `RangeError`. caller가 모든 point를 미리 읽어두므로 이후 `out` 기록이 input과
 * aliasing되어도 안전하다.
 *
 * @param points 검증할 point collection
 * @param name error message에 사용할 인자 이름
 */
export function materializeFinitePoints(
  points: readonly XYInput[],
  name: string
): { readonly xs: number[]; readonly ys: number[] } {
  const count = points.length;
  const xs = new Array<number>(count);
  const ys = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    const x = readX(points[i]);
    const y = readY(points[i]);
    if (!Number.isFinite(x)) {
      throw new RangeError(`${name}[${i}].x must be a finite number, got ${String(x)}`);
    }
    if (!Number.isFinite(y)) {
      throw new RangeError(`${name}[${i}].y must be a finite number, got ${String(y)}`);
    }
    xs[i] = x;
    ys[i] = y;
  }
  return { xs, ys };
}

/** `computePrincipalAxes`의 결과. centroid와 두 unit-length principal axis를 담는다. */
export interface PrincipalAxes {
  /** point cloud centroid x. `-0`은 `0`으로 canonicalize. */
  readonly centroidX: number;

  /** point cloud centroid y. `-0`은 `0`으로 canonicalize. */
  readonly centroidY: number;

  /** 큰 variance axis x. */
  readonly primaryX: number;

  /** 큰 variance axis y. */
  readonly primaryY: number;

  /** secondary axis x. */
  readonly secondaryX: number;

  /** secondary axis y. */
  readonly secondaryY: number;
}

/**
 * `(x, y)` axis의 sign을 첫 strict non-zero component가 양수가 되도록 뒤집고 `-0`을 `0`으로
 * canonicalize해 `out` 길이 2 tuple에 기록한다.
 *
 * @param out `[x, y]`를 기록할 길이 2 배열
 * @param x axis x component
 * @param y axis y component
 */
function canonicalizeAxisSign(out: [number, number], x: number, y: number): void {
  let sign = 1;
  if (x !== 0) {
    sign = x < 0 ? -1 : 1;
  } else if (y !== 0) {
    sign = y < 0 ? -1 : 1;
  }
  const rx = sign * x;
  const ry = sign * y;
  out[0] = rx === 0 ? 0 : rx;
  out[1] = ry === 0 ? 0 : ry;
}

/**
 * finite point collection의 centroid와 2D principal axis pair를 계산한다.
 *
 * centered 2x2 covariance scatter matrix `[[sxx, sxy], [sxy, syy]]`(population, `/ count`)를 만들고
 * symmetric 2x2 closed-form eigen으로 큰 eigenvalue axis를 `primary`, 직교 axis를 `secondary`로
 * 반환한다. 두 축 모두 unit length이고 첫 strict non-zero component가 양수가 되도록 canonicalize한다.
 *
 * point 수가 2 미만이거나 total variance(`sxx + syy`)가 `<= epsilon`이면 degenerate로 보고
 * `undefined`를 반환한다. eigenvector normalization이 non-finite이면 `undefined`.
 *
 * @param xs materialize된 finite x 좌표
 * @param ys materialize된 finite y 좌표
 * @param epsilon degenerate(total variance) 판정 tolerance
 */
export function computePrincipalAxes(
  xs: readonly number[],
  ys: readonly number[],
  epsilon: number
): PrincipalAxes | undefined {
  const count = xs.length;
  if (count < 2) {
    return undefined;
  }

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < count; i++) {
    sumX += xs[i];
    sumY += ys[i];
  }
  const meanX = sumX / count;
  const meanY = sumY / count;

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < count; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  sxx /= count;
  syy /= count;
  sxy /= count;

  if (!Number.isFinite(sxx) || !Number.isFinite(syy) || !Number.isFinite(sxy)) {
    return undefined;
  }

  // total variance가 epsilon 이하이면 모든 point가 사실상 한 점 → principal direction 없음.
  if (sxx + syy <= epsilon) {
    return undefined;
  }

  // symmetric 2x2 closed-form eigen. s = sqrt((sxx - syy)^2 + (2 sxy)^2), λ1 = (sxx + syy + s) / 2.
  const s = Math.hypot(sxx - syy, 2 * sxy);
  const lambda1 = (sxx + syy + s) / 2;

  let primaryX: number;
  let primaryY: number;
  if (sxy !== 0) {
    // 큰 eigenvalue λ1의 eigenvector: (λ1 - syy, sxy).
    primaryX = lambda1 - syy;
    primaryY = sxy;
  } else {
    // off-diagonal이 0이면 축 정렬. 큰 variance 축을 primary로 선택한다.
    if (sxx >= syy) {
      primaryX = 1;
      primaryY = 0;
    } else {
      primaryX = 0;
      primaryY = 1;
    }
  }

  const length = Math.hypot(primaryX, primaryY);
  if (!Number.isFinite(length) || length === 0) {
    return undefined;
  }
  const ux = primaryX / length;
  const uy = primaryY / length;
  if (!Number.isFinite(ux) || !Number.isFinite(uy)) {
    return undefined;
  }

  const primary: [number, number] = [0, 0];
  const secondary: [number, number] = [0, 0];
  canonicalizeAxisSign(primary, ux, uy);
  // secondary는 primary에 직교한 unit vector. canonicalize 전 raw perpendicular를 넣는다.
  canonicalizeAxisSign(secondary, -uy, ux);

  return {
    centroidX: meanX === 0 ? 0 : meanX,
    centroidY: meanY === 0 ? 0 : meanY,
    primaryX: primary[0],
    primaryY: primary[1],
    secondaryX: secondary[0],
    secondaryY: secondary[1],
  };
}
