import type { CenterArcLike, LengthOptions } from '../types';
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
    const theta = halfLen * GL5_NODES[i] + mid;
    sum += GL5_WEIGHTS[i] * speedAtTheta(rx, ry, theta);
  }
  return halfLen * sum;
}

/**
 * center form arc의 t=0부터 t까지의 arc length를 반환한다.
 *
 * t를 [0, 1]로 clamp한다. t <= 0이면 0을 반환한다.
 * degenerate arc(rx <= 0 또는 ry <= 0) 또는 zero-sweep arc는 0을 반환한다.
 * 구간 적분은 Gauss-Legendre 5점 적분을 사용한다.
 *
 * @param centerArc center form arc input
 * @param t 파라미터 (clamp됨)
 * @param options 적분 옵션
 * @param options.segments θ 구간 분할 수. 기본값: 12
 */
export function arcLengthAtT(centerArc: CenterArcLike, t: number, options?: LengthOptions): number {
  if (t <= 0) return 0;

  const { rx, ry, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) return 0;
  if (startAngle === endAngle) return 0;

  const tClamped = t >= 1 ? 1 : t;
  const thetaEnd = startAngle + (endAngle - startAngle) * tClamped;

  const segments = options?.segments ?? 12;
  const step = (thetaEnd - startAngle) / segments;
  let total = 0;

  for (let i = 0; i < segments; i++) {
    const a = startAngle + i * step;
    const b = startAngle + (i + 1) * step;
    total += integrateSegment(rx, ry, a, b);
  }

  return Math.abs(total);
}
