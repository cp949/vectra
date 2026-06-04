import { readX, readY } from '../internal/xy';
import type { TAtLengthOptions, XYInput } from '../types';

const GL5_NODES = [0, 0.5384693101, -0.5384693101, 0.9061798459, -0.9061798459] as const;
const GL5_WEIGHTS = [0.5688888889, 0.4786286705, 0.4786286705, 0.2369268851, 0.2369268851] as const;

function integrateSegment(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  a: number,
  b: number
): number {
  const halfLen = (b - a) * 0.5;
  const mid = (a + b) * 0.5;
  let sum = 0;
  for (let i = 0; i < GL5_NODES.length; i++) {
    const t = halfLen * GL5_NODES[i] + mid;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    const twoMtT = 2 * mt * t;
    const dx = 3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x));
    const dy = 3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y));
    sum += GL5_WEIGHTS[i] * Math.hypot(dx, dy);
  }
  return halfLen * sum;
}

function lengthAtT(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  t: number,
  segments: number
): number {
  if (t <= 0) return 0;
  const tClamped = t >= 1 ? 1 : t;
  const step = tClamped / segments;
  let total = 0;
  for (let i = 0; i < segments; i++) {
    total += integrateSegment(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, i * step, (i + 1) * step);
  }
  return total;
}

/**
 * cubic Bezier curve에서 arc length distance에 해당하는 파라미터 t를 반환한다.
 *
 * distance를 [0, totalLength]로 clamp한다. 반환 t는 항상 [0, 1]이다.
 * zero-length curve는 distance와 무관하게 0을 반환한다.
 * 이진 탐색으로 수렴하며, 수렴하지 않으면 마지막 추정값을 반환한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param distance 목표 arc length
 * @param options 탐색 옵션
 * @param options.segments 적분 구간 분할 수. 기본값: 12
 * @param options.tolerance 이진 탐색 수렴 threshold. 기본값: 1e-8
 * @param options.maxIterations 이진 탐색 최대 반복 횟수. 기본값: 64
 */
export function cubicTAtLength(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  distance: number,
  options?: TAtLengthOptions
): number {
  const tolerance = options?.tolerance ?? 1e-8;
  const maxIterations = options?.maxIterations ?? 64;
  const segments = options?.segments ?? 12;

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  const totalLength = lengthAtT(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, 1, segments);

  if (totalLength === 0) return 0;
  if (distance <= 0) return 0;
  if (distance >= totalLength) return 1;

  let lo = 0;
  let hi = 1;

  for (let i = 0; i < maxIterations; i++) {
    if (hi - lo <= tolerance) break;
    const mid = (lo + hi) * 0.5;
    if (lengthAtT(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, mid, segments) < distance) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) * 0.5;
}
