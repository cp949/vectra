/**
 * natural cubic spline helper의 공유 internal.
 *
 * 좌표 읽기/검증, index parameter 기준 tridiagonal solve, cubic segment 생성을 모아둔다.
 * public natural spline leaf는 이 helper만 공유하고 서로를 직접 import하지 않는다.
 */
import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

// 입력 point의 x/y를 배열로 읽고 모두 finite인지 검증한다. non-finite면 RangeError.
function readFiniteAxes(points: readonly XYInput[]): { xs: number[]; ys: number[] } {
  const n = points.length;
  const xs = new Array<number>(n);
  const ys = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const x = readX(points[i]);
    const y = readY(points[i]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new RangeError('natural spline requires finite coordinates');
    }
    xs[i] = x;
    ys[i] = y;
  }
  return { xs, ys };
}

// natural cubic spline second derivative를 index parameter(h=1) tridiagonal solve로 구한다.
// 양 끝 second derivative는 0(natural). pivot이 0이거나 non-finite면 RangeError.
function solveNaturalSecondDerivatives(v: readonly number[]): number[] {
  const n = v.length;
  const m = new Array<number>(n).fill(0);
  if (n <= 2) return m;

  const k = n - 2; // interior 미지수 수
  const cp = new Array<number>(k); // forward sweep super-diagonal
  const dp = new Array<number>(k); // forward sweep rhs

  for (let idx = 0; idx < k; idx++) {
    const i = idx + 1;
    const rhs = 6 * (v[i + 1] - 2 * v[i] + v[i - 1]);
    const sub = idx === 0 ? 0 : 1;
    const sup = idx === k - 1 ? 0 : 1;
    const denom = 4 - sub * (idx === 0 ? 0 : cp[idx - 1]);
    if (denom === 0 || !Number.isFinite(denom)) {
      throw new RangeError('natural spline tridiagonal solve failed: non-invertible system');
    }
    cp[idx] = sup / denom;
    dp[idx] = (rhs - sub * (idx === 0 ? 0 : dp[idx - 1])) / denom;
  }

  m[n - 2] = dp[k - 1];
  for (let idx = k - 2; idx >= 0; idx--) {
    m[idx + 1] = dp[idx] - cp[idx] * m[idx + 2];
  }
  return m;
}

/**
 * natural cubic spline cubic Bezier segment를 flat number[]로 생성한다.
 *
 * x/y를 각각 index parameter 기준으로 natural spline 처리한다. x monotonic은 요구하지 않는다.
 * 좌표가 non-finite거나 tridiagonal solve가 실패하면 RangeError로 실패한다.
 * 호출자는 points.length >= 2를 보장한다. points.length === 2이면 line segment와 동일하다.
 *
 * @param points natural spline이 통과할 입력 point 배열
 * @returns cubic segment flat 배열과 segment 수
 */
export function naturalSplineCubicSegments(points: readonly XYInput[]): { segments: number[]; segCount: number } {
  const { xs, ys } = readFiniteAxes(points);
  const n = xs.length;
  const segCount = n - 1;
  const mx = solveNaturalSecondDerivatives(xs);
  const my = solveNaturalSecondDerivatives(ys);
  const segments = new Array<number>(segCount * 8);

  for (let i = 0; i < segCount; i++) {
    const o = i * 8;
    // h=1: D_i = ΔP - (2 M_i + M_{i+1})/6, D_{i+1} = ΔP + (M_i + 2 M_{i+1})/6
    const dxSeg = xs[i + 1] - xs[i];
    const dXi = dxSeg - (2 * mx[i] + mx[i + 1]) / 6;
    const dXi1 = dxSeg + (mx[i] + 2 * mx[i + 1]) / 6;
    const dySeg = ys[i + 1] - ys[i];
    const dYi = dySeg - (2 * my[i] + my[i + 1]) / 6;
    const dYi1 = dySeg + (my[i] + 2 * my[i + 1]) / 6;
    segments[o] = xs[i];
    segments[o + 1] = ys[i];
    segments[o + 2] = xs[i] + dXi / 3;
    segments[o + 3] = ys[i] + dYi / 3;
    segments[o + 4] = xs[i + 1] - dXi1 / 3;
    segments[o + 5] = ys[i + 1] - dYi1 / 3;
    segments[o + 6] = xs[i + 1];
    segments[o + 7] = ys[i + 1];
  }

  return { segments, segCount };
}
