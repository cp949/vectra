import { readX, readY } from '../internal/xy';
import type { CenterArcLike, ClosestPointOptions, XYInput, XYWritable } from '../types';
import { angleAtT, ellipseDerivative, ellipsePoint, isDegenerateRadii } from './arc.internal';
import { arcPointAtTInto } from './arc-point-at-t-into';

/**
 * center form arc 위에서 point에 가장 가까운 점을 out에 기록하고 out을 반환한다.
 *
 * Newton-Raphson 정제를 sampleCount 개의 초기 sample에 각각 적용한 뒤
 * 최소 squared distance를 가지는 t를 선택한다. 동일 거리에서는 작은 t를 선택한다.
 * 1회전을 초과하는 arc는 첫 1회전 구간에 seed를 배치한다.
 *
 * degenerate (rx<=0 || ry<=0) 또는 zero-sweep (startAngle===endAngle)이면
 * `arcPointAtTInto(out, centerArc, 0)`을 반환한다.
 *
 * @param out point를 기록할 writable output
 * @param centerArc center form arc input
 * @param point 투영 기준 점
 * @param options 수치 최적화 옵션 (tolerance, maxIterations, sampleCount)
 * @returns out
 */
export function arcClosestPointInto<Out extends XYWritable>(
  out: Out,
  centerArc: CenterArcLike,
  point: XYInput,
  options?: ClosestPointOptions
): Out {
  const { cx, cy, rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry) || startAngle === endAngle) {
    return arcPointAtTInto(out, centerArc, 0);
  }

  const tolerance =
    options?.tolerance !== undefined && Number.isFinite(options.tolerance) && options.tolerance > 0
      ? options.tolerance
      : 1e-8;
  const maxIterations =
    options?.maxIterations !== undefined && Number.isSafeInteger(options.maxIterations) && options.maxIterations >= 0
      ? options.maxIterations
      : 20;
  const sampleCount =
    options?.sampleCount !== undefined && Number.isSafeInteger(options.sampleCount) && options.sampleCount >= 2
      ? options.sampleCount
      : 11;

  const qx = readX(point);
  const qy = readY(point);
  const dAngle = endAngle - startAngle;

  const pxy: [number, number] = [0, 0];
  const d1xy: [number, number] = [0, 0];

  // t에서 query point까지 squared distance
  function squaredDist(t: number): number {
    const theta = angleAtT(startAngle, endAngle, t);
    ellipsePoint(cx, cy, rx, ry, xRotation, theta, pxy);
    const ex = pxy[0] - qx;
    const ey = pxy[1] - qy;
    return ex * ex + ey * ey;
  }

  // seed t에서 Newton-Raphson 정제를 수행해 최적 t를 반환한다.
  // f  = (P-Q)·dP/dθ
  // f' = |dP/dθ|² + (P-Q)·d²P/dθ²,  여기서 d²P/dθ² = -(P-center)
  function refine(seed: number): number {
    let t = seed;
    for (let i = 0; i < maxIterations; i++) {
      const theta = angleAtT(startAngle, endAngle, t);
      ellipsePoint(cx, cy, rx, ry, xRotation, theta, pxy);
      ellipseDerivative(rx, ry, xRotation, theta, d1xy);
      const ex = pxy[0] - qx;
      const ey = pxy[1] - qy;
      const d1x = d1xy[0];
      const d1y = d1xy[1];
      // d²P/dθ² = -(P - center)
      const d2x = cx - pxy[0];
      const d2y = cy - pxy[1];
      const f = ex * d1x + ey * d1y;
      const fp = d1x * d1x + d1y * d1y + ex * d2x + ey * d2y;
      if (fp === 0) break;
      const stepTheta = f / fp;
      const stepT = stepTheta / dAngle;
      t -= stepT;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      if (Math.abs(stepT) < tolerance) break;
    }
    return t;
  }

  const absDAngle = Math.abs(dAngle);
  const seedTMax = absDAngle > Math.PI * 2 ? (Math.PI * 2) / absDAngle : 1;

  // sampleCount 개 초기 sample. 1회전 초과 arc는 첫 full-turn만으로 같은 geometry set을 덮는다.
  // seed 자체와 refinement 결과 둘 다 비교해 더 나은 t를 선택한다.
  let bestT = 0;
  let bestSq = Number.POSITIVE_INFINITY;

  function updateBest(t: number): void {
    const sq = squaredDist(t);
    if (sq < bestSq || (sq === bestSq && t < bestT)) {
      bestT = t;
      bestSq = sq;
    }
  }

  for (let i = 0; i < sampleCount; i++) {
    const tSeed = (i / (sampleCount - 1)) * seedTMax;
    updateBest(tSeed);
    const tRef = refine(tSeed);
    updateBest(tRef);
  }

  return arcPointAtTInto(out, centerArc, bestT);
}
