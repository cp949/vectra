import type { ClosestPointOptions } from '../types';

/**
 * Bezier closest-location 탐색의 raw numeric 결과.
 *
 * `t`는 `[0, 1]`로 clamp된 curve-local parameter, `x`/`y`는 curve를 `t`에서 평가한 좌표,
 * `distanceSquared`는 query까지 거리의 제곱이다.
 *
 * public leaf는 이 값을 `CurveLocationResult` 또는 writable point로 변환한다.
 */
export interface BezierClosestLocationCore {
  t: number;
  x: number;
  y: number;
  distanceSquared: number;
}

/**
 * 초기 sample 수가 유효하지 않으면 endpoint만 비교한다.
 *
 * 정수가 아니거나 `< 2`이거나 non-finite이면 sample 단계의 step 분모가 정수 step 가정에서
 * 벗어나거나 0 / NaN이 되어 Newton-Raphson seed가 무의미하다. 이때는 t=0, t=1만 비교한다.
 */
function isUsableSampleCount(sampleCount: number): boolean {
  return Number.isInteger(sampleCount) && sampleCount >= 2;
}

/**
 * Newton-Raphson 수렴 threshold가 유효한지 확인한다.
 *
 * NaN / ±Infinity / 음수이면 비교가 발동하지 않거나 즉시 종료되어 의미가 없다.
 * invalid이면 호출부에서 default(`1e-8`)로 fallback한다.
 */
function isUsableTolerance(tolerance: number): boolean {
  return Number.isFinite(tolerance) && tolerance >= 0;
}

/**
 * Newton-Raphson 최대 반복 횟수가 유효한지 확인한다.
 *
 * 정수가 아니거나 음수이거나 non-finite이면 루프 경계가 모호하거나
 * `Infinity`로 인해 hang을 일으킬 수 있다. invalid이면 호출부에서 default(`20`)로 fallback한다.
 */
function isUsableMaxIterations(maxIterations: number): boolean {
  return Number.isInteger(maxIterations) && maxIterations >= 0;
}

/**
 * quadratic Bezier 위에서 (qx, qy)에 가장 가까운 위치를 찾는다.
 *
 * 알고리즘:
 * - 초기 sample `sampleCount`개를 균등 분할로 만든다.
 * - 각 sample을 Newton-Raphson으로 정제하면서 t를 `[0, 1]`로 clamp한다.
 * - endpoint t=0, t=1도 함께 비교해 global minimum을 선택한다.
 *
 * `sampleCount`가 정수가 아니거나 2 미만이거나 non-finite이면 endpoint만 비교한다.
 * tie-break: 동일 `distanceSquared`에서 작은 `t`를 선택한다.
 */
export function findQuadraticClosestLocation(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  qx: number,
  qy: number,
  options?: ClosestPointOptions
): BezierClosestLocationCore {
  const rawTolerance = options?.tolerance ?? 1e-8;
  const tolerance = isUsableTolerance(rawTolerance) ? rawTolerance : 1e-8;
  const rawMaxIterations = options?.maxIterations ?? 20;
  const maxIterations = isUsableMaxIterations(rawMaxIterations) ? rawMaxIterations : 20;
  const sampleCount = options?.sampleCount ?? 11;

  // B(t) = (1-t)²p0 + 2(1-t)t·p1 + t²p2
  function bx(t: number): number {
    const mt = 1 - t;
    return mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x;
  }
  function by(t: number): number {
    const mt = 1 - t;
    return mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y;
  }
  // B'(t)
  function dx(t: number): number {
    return 2 * (1 - t) * (p1x - p0x) + 2 * t * (p2x - p1x);
  }
  function dy(t: number): number {
    return 2 * (1 - t) * (p1y - p0y) + 2 * t * (p2y - p1y);
  }
  // B''(t) — quadratic의 2차 도함수는 상수
  const d2x = 2 * (p2x - 2 * p1x + p0x);
  const d2y = 2 * (p2y - 2 * p1y + p0y);

  function squaredDist(t: number): number {
    const ex = bx(t) - qx;
    const ey = by(t) - qy;
    return ex * ex + ey * ey;
  }

  function refine(seed: number): number {
    let t = seed;
    for (let i = 0; i < maxIterations; i++) {
      const ex = bx(t) - qx;
      const ey = by(t) - qy;
      const d1x = dx(t);
      const d1y = dy(t);
      const f = ex * d1x + ey * d1y;
      const fp = d1x * d1x + d1y * d1y + ex * d2x + ey * d2y;
      if (fp === 0) break;
      const step = f / fp;
      t -= step;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      if (Math.abs(step) < tolerance) break;
    }
    return t;
  }

  let bestT = 0;
  let bestSq = squaredDist(0);

  // endpoint t=1
  const sq1 = squaredDist(1);
  if (sq1 < bestSq) {
    bestT = 1;
    bestSq = sq1;
  }

  if (isUsableSampleCount(sampleCount)) {
    const step = 1 / (sampleCount - 1);
    for (let i = 0; i < sampleCount; i++) {
      const tSeed = i * step;
      const tRef = refine(tSeed);
      const sq = squaredDist(tRef);
      if (sq < bestSq || (sq === bestSq && tRef < bestT)) {
        bestT = tRef;
        bestSq = sq;
      }
    }
  }

  return { t: bestT, x: bx(bestT), y: by(bestT), distanceSquared: bestSq };
}

/**
 * cubic Bezier 위에서 (qx, qy)에 가장 가까운 위치를 찾는다.
 *
 * 정책은 `findQuadraticClosestLocation`과 동일하다 (sample seed + Newton-Raphson + endpoint 비교,
 * `sampleCount`가 정수가 아니거나 2 미만이거나 non-finite이면 endpoint만 비교, tie-break는 작은 t).
 */
export function findCubicClosestLocation(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  qx: number,
  qy: number,
  options?: ClosestPointOptions
): BezierClosestLocationCore {
  const rawTolerance = options?.tolerance ?? 1e-8;
  const tolerance = isUsableTolerance(rawTolerance) ? rawTolerance : 1e-8;
  const rawMaxIterations = options?.maxIterations ?? 20;
  const maxIterations = isUsableMaxIterations(rawMaxIterations) ? rawMaxIterations : 20;
  const sampleCount = options?.sampleCount ?? 11;

  // B(t)
  function bx(t: number): number {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return mt2 * mt * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t2 * t * p3x;
  }
  function by(t: number): number {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return mt2 * mt * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t2 * t * p3y;
  }
  // B'(t)
  function d1x(t: number): number {
    const mt = 1 - t;
    return 3 * (mt * mt * (p1x - p0x) + 2 * mt * t * (p2x - p1x) + t * t * (p3x - p2x));
  }
  function d1y(t: number): number {
    const mt = 1 - t;
    return 3 * (mt * mt * (p1y - p0y) + 2 * mt * t * (p2y - p1y) + t * t * (p3y - p2y));
  }
  // B''(t)
  function d2x(t: number): number {
    return 6 * ((1 - t) * (p2x - 2 * p1x + p0x) + t * (p3x - 2 * p2x + p1x));
  }
  function d2y(t: number): number {
    return 6 * ((1 - t) * (p2y - 2 * p1y + p0y) + t * (p3y - 2 * p2y + p1y));
  }

  function squaredDist(t: number): number {
    const ex = bx(t) - qx;
    const ey = by(t) - qy;
    return ex * ex + ey * ey;
  }

  function refine(seed: number): number {
    let t = seed;
    for (let i = 0; i < maxIterations; i++) {
      const ex = bx(t) - qx;
      const ey = by(t) - qy;
      const vx = d1x(t);
      const vy = d1y(t);
      const f = ex * vx + ey * vy;
      const fp = vx * vx + vy * vy + ex * d2x(t) + ey * d2y(t);
      if (fp === 0) break;
      const step = f / fp;
      t -= step;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      if (Math.abs(step) < tolerance) break;
    }
    return t;
  }

  let bestT = 0;
  let bestSq = squaredDist(0);

  // endpoint t=1
  const sq1 = squaredDist(1);
  if (sq1 < bestSq) {
    bestT = 1;
    bestSq = sq1;
  }

  if (isUsableSampleCount(sampleCount)) {
    const step = 1 / (sampleCount - 1);
    for (let i = 0; i < sampleCount; i++) {
      const tSeed = i * step;
      const tRef = refine(tSeed);
      const sq = squaredDist(tRef);
      if (sq < bestSq || (sq === bestSq && tRef < bestT)) {
        bestT = tRef;
        bestSq = sq;
      }
    }
  }

  return { t: bestT, x: bx(bestT), y: by(bestT), distanceSquared: bestSq };
}
