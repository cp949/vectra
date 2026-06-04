import type { CenterArcLike, TAtLengthOptions } from '../types';
import { isDegenerateRadii } from './arc.internal';

const GL5_NODES = [0, 0.5384693101, -0.5384693101, 0.9061798459, -0.9061798459] as const;
const GL5_WEIGHTS = [0.5688888889, 0.4786286705, 0.4786286705, 0.2369268851, 0.2369268851] as const;

function speedAtTheta(rx: number, ry: number, theta: number): number {
  return Math.hypot(rx * Math.sin(theta), ry * Math.cos(theta));
}

function integrateSegment(rx: number, ry: number, a: number, b: number): number {
  const halfLen = (b - a) * 0.5;
  const mid = (a + b) * 0.5;
  let sum = 0;
  for (let i = 0; i < GL5_NODES.length; i++) {
    sum += GL5_WEIGHTS[i] * speedAtTheta(rx, ry, halfLen * GL5_NODES[i] + mid);
  }
  return halfLen * sum;
}

function arcLengthAtTImpl(centerArc: CenterArcLike, t: number, segments: number): number {
  if (t <= 0) return 0;
  const { rx, ry, startAngle, endAngle } = centerArc;
  if (isDegenerateRadii(rx, ry)) return 0;
  if (startAngle === endAngle) return 0;
  const tClamped = t >= 1 ? 1 : t;
  const thetaEnd = startAngle + (endAngle - startAngle) * tClamped;
  const step = (thetaEnd - startAngle) / segments;
  let total = 0;
  for (let i = 0; i < segments; i++) {
    total += integrateSegment(rx, ry, startAngle + i * step, startAngle + (i + 1) * step);
  }
  return Math.abs(total);
}

/**
 * center form arc에서 arc length distance에 해당하는 파라미터 t를 반환한다.
 *
 * distance를 [0, totalLength]로 clamp한다. 반환 t는 항상 [0, 1]이다.
 * degenerate arc 또는 zero-sweep arc는 항상 0을 반환한다.
 * 이진 탐색으로 수렴하며, 수렴하지 않으면 마지막 추정값을 반환한다.
 *
 * @param centerArc center form arc input
 * @param distance 목표 arc length
 * @param options 탐색 옵션
 * @param options.segments θ 구간 분할 수. 기본값: 12
 * @param options.tolerance 이진 탐색 수렴 threshold. 기본값: 1e-8
 * @param options.maxIterations 이진 탐색 최대 반복 횟수. 기본값: 64
 */
export function arcTAtLength(centerArc: CenterArcLike, distance: number, options?: TAtLengthOptions): number {
  const tolerance = options?.tolerance ?? 1e-8;
  const maxIterations = options?.maxIterations ?? 64;
  const segments = options?.segments ?? 12;

  const totalLength = arcLengthAtTImpl(centerArc, 1, segments);

  if (totalLength === 0) return 0;
  if (distance <= 0) return 0;
  if (distance >= totalLength) return 1;

  let lo = 0;
  let hi = 1;

  for (let i = 0; i < maxIterations; i++) {
    if (hi - lo <= tolerance) break;
    const mid = (lo + hi) * 0.5;
    if (arcLengthAtTImpl(centerArc, mid, segments) < distance) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) * 0.5;
}
