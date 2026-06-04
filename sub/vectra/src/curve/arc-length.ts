import type { CenterArcLike, LengthOptions } from '../types';
import { isDegenerateRadii } from './arc.internal';

/**
 * 5점 Gauss-Legendre 적분 node와 weight.
 * 구간 [-1, 1] 기준이다.
 */
const GL5_NODES = [0, 0.5384693101, -0.5384693101, 0.9061798459, -0.9061798459] as const;
const GL5_WEIGHTS = [0.5688888889, 0.4786286705, 0.4786286705, 0.2369268851, 0.2369268851] as const;

/**
 * rotated ellipse 위 θ에서의 |dP/dθ|를 반환한다.
 *
 * dP/dθ = (-cosφ·rx·sinθ - sinφ·ry·cosθ, -sinφ·rx·sinθ + cosφ·ry·cosθ)
 * 두 성분의 sum-of-squares를 정리하면 회전 항이 사라져 다음과 같이 단순해진다:
 *   |dP/dθ|² = rx²·sin²θ + ry²·cos²θ
 *
 * 회전 xRotation은 path의 위치만 바꾸고 호 길이는 바꾸지 않으므로 이 식만으로 충분하다.
 */
function speedAtTheta(rx: number, ry: number, theta: number): number {
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  return Math.hypot(rx * sinTheta, ry * cosTheta);
}

/**
 * [a, b] 구간에서 |dP/dθ|를 Gauss-Legendre 5점 적분으로 적산한다.
 */
function integrateSegment(rx: number, ry: number, a: number, b: number): number {
  const halfLen = (b - a) * 0.5;
  const mid = (a + b) * 0.5;
  let sum = 0;
  for (let i = 0; i < GL5_NODES.length; i++) {
    const theta = halfLen * GL5_NODES[i] + mid;
    sum += GL5_WEIGHTS[i] * speedAtTheta(rx, ry, theta);
  }
  return halfLen * sum;
}

/**
 * center form arc의 arc length를 Gauss-Legendre 수치 적분으로 계산하고 반환한다.
 *
 * θ 구간 [startAngle, endAngle]을 segments로 분할해 각 구간에서 5점 GL 적분을 수행한다.
 * degenerate(rx <= 0 또는 ry <= 0) 또는 zero-sweep arc는 0을 반환한다.
 *
 * @param centerArc center form arc input
 * @param options 적분 옵션
 * @param options.segments θ 구간 분할 수. 기본값: 12
 * @returns arc length
 */
export function arcLength(centerArc: CenterArcLike, options?: LengthOptions): number {
  const { rx, ry, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    return 0;
  }
  if (startAngle === endAngle) {
    return 0;
  }

  const segments = options?.segments ?? 12;
  const step = (endAngle - startAngle) / segments;
  let total = 0;

  for (let i = 0; i < segments; i++) {
    const a = startAngle + i * step;
    const b = startAngle + (i + 1) * step;
    total += integrateSegment(rx, ry, a, b);
  }

  // GL 적분의 부호는 (endAngle - startAngle)의 부호를 따른다. 길이는 양수가 정의이다.
  return Math.abs(total);
}
