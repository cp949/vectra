import { readX, readY } from '../internal/xy';
import type { LengthOptions, XYInput } from '../types';

/**
 * 5점 Gauss-Legendre 적분 node와 weight.
 * 구간 [-1, 1] 기준이다.
 */
const GL5_NODES = [0, 0.5384693101, -0.5384693101, 0.9061798459, -0.9061798459] as const;
const GL5_WEIGHTS = [0.5688888889, 0.4786286705, 0.4786286705, 0.2369268851, 0.2369268851] as const;

/**
 * quadratic Bezier curve의 한 구간에서 arc length를 Gauss-Legendre 5점 적분으로 계산한다.
 *
 * @param p0x 시작점 x
 * @param p0y 시작점 y
 * @param p1x 제어점 x
 * @param p1y 제어점 y
 * @param p2x 끝점 x
 * @param p2y 끝점 y
 * @param a 구간 시작 t
 * @param b 구간 끝 t
 */
function integrateSegment(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  a: number,
  b: number
): number {
  // 구간 [a, b]를 [-1, 1]로 변환: t = (b-a)/2 * u + (a+b)/2
  const halfLen = (b - a) * 0.5;
  const mid = (a + b) * 0.5;

  let sum = 0;

  for (let i = 0; i < GL5_NODES.length; i++) {
    const t = halfLen * GL5_NODES[i] + mid;
    const twoMt = 2 * (1 - t);
    const twoT = 2 * t;

    // B'(t) = 2(1-t)(p1-p0) + 2t(p2-p1)
    const dx = twoMt * (p1x - p0x) + twoT * (p2x - p1x);
    const dy = twoMt * (p1y - p0y) + twoT * (p2y - p1y);

    sum += GL5_WEIGHTS[i] * Math.hypot(dx, dy);
  }

  return halfLen * sum;
}

/**
 * quadratic Bezier curve의 arc length를 Gauss-Legendre 수치 적분으로 계산하고 반환한다.
 *
 * t ∈ [0, 1] 구간을 segments로 분할하여 각 구간에서 5점 GL 적분을 수행한다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param options 적분 옵션
 * @param options.segments 구간 분할 수. 기본값: 12
 */
export function quadraticLength(p0: XYInput, p1: XYInput, p2: XYInput, options?: LengthOptions): number {
  const segments = options?.segments ?? 12;

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  const step = 1 / segments;
  let total = 0;

  for (let i = 0; i < segments; i++) {
    const a = i * step;
    const b = (i + 1) * step;
    total += integrateSegment(p0x, p0y, p1x, p1y, p2x, p2y, a, b);
  }

  return total;
}
