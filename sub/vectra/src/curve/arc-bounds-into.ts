import { writeXY } from '../internal/xy';
import type { BoundsWritable, CenterArcLike } from '../types';
import { ellipsePoint, isDegenerateRadii } from './arc.internal';

/**
 * angle θ가 [start, end] 또는 [end, start] sweep 범위 안에 있는지 검사한다.
 *
 * sweep 방향(start→end)의 정·부 무관하게 두 endpoint 사이에 θ가 들어있는지를
 * 2π 모듈로로 판정한다. inclusive 검사이다.
 */
function angleInSweep(theta: number, start: number, end: number): boolean {
  const TAU = 2 * Math.PI;
  const sweep = end - start;
  // 정규화: sweep ∈ [-2π, 2π]
  if (sweep >= 0) {
    // 정방향: start → start + sweep
    // (theta - start) mod 2π <= sweep ?
    let diff = (theta - start) % TAU;
    if (diff < 0) diff += TAU;
    // 1e-12: extrema 각도가 경계에 정확히 있을 때 float64 rounding으로 sweep을 아주
    // 미세하게 초과할 수 있다. absolute epsilon을 더해 포용적 inclusive 판정을 유지한다.
    return diff <= sweep + 1e-12;
  }
  // 역방향: start → start + sweep (sweep < 0)
  // (start - theta) mod 2π <= -sweep ?
  let diff = (start - theta) % TAU;
  if (diff < 0) diff += TAU;
  // 1e-12: 정방향과 동일한 이유 — float64 rounding 보정을 위한 inclusive tolerance.
  return diff <= -sweep + 1e-12;
}

/**
 * center form arc의 axis-aligned bounding box를 out에 기록하고 out을 반환한다.
 *
 * endpoint(t=0, t=1)와 rotated ellipse의 axis-extremum(θ ∈ [start,end] sweep 안에 있을 때)을
 * 모두 후보로 두고 min/max를 계산한다.
 *
 * x 방향 extremum:
 *   dx/dθ = -cosφ·rx·sinθ - sinφ·ry·cosθ = 0
 *   ⇒ tanθ = -ry·sinφ / (rx·cosφ)
 * y 방향 extremum:
 *   dy/dθ = -sinφ·rx·sinθ + cosφ·ry·cosθ = 0
 *   ⇒ tanθ = (ry·cosφ) / (rx·sinφ)
 *
 * 각 방정식은 (θ, θ + π) 두 해를 제공한다.
 * degenerate(rx==0 또는 ry==0) arc는 (cx, cy)에 위치한 점 bounds를 반환한다.
 *
 * @param out bounds를 기록할 BoundsWritable output
 * @param centerArc center form arc input
 * @returns out
 */
export function arcBoundsInto<Out extends BoundsWritable>(out: Out, centerArc: CenterArcLike): Out {
  const { cx, cy, rx, ry, xRotation, startAngle, endAngle } = centerArc;

  let minX: number;
  let minY: number;
  let maxX: number;
  let maxY: number;

  if (isDegenerateRadii(rx, ry)) {
    minX = maxX = cx;
    minY = maxY = cy;
  } else {
    // endpoint들로 초기화
    const p0: [number, number] = [0, 0];
    const p1: [number, number] = [0, 0];
    ellipsePoint(cx, cy, rx, ry, xRotation, startAngle, p0);
    ellipsePoint(cx, cy, rx, ry, xRotation, endAngle, p1);

    minX = Math.min(p0[0], p1[0]);
    maxX = Math.max(p0[0], p1[0]);
    minY = Math.min(p0[1], p1[1]);
    maxY = Math.max(p0[1], p1[1]);

    const cosPhi = Math.cos(xRotation);
    const sinPhi = Math.sin(xRotation);

    // x extremum: tanθ = -ry·sinφ / (rx·cosφ)
    const thetaX0 = Math.atan2(-ry * sinPhi, rx * cosPhi);
    const xCandidates = [thetaX0, thetaX0 + Math.PI];
    for (const theta of xCandidates) {
      if (angleInSweep(theta, startAngle, endAngle)) {
        const pt: [number, number] = [0, 0];
        ellipsePoint(cx, cy, rx, ry, xRotation, theta, pt);
        if (pt[0] < minX) minX = pt[0];
        if (pt[0] > maxX) maxX = pt[0];
      }
    }

    // y extremum: tanθ = ry·cosφ / (rx·sinφ)
    const thetaY0 = Math.atan2(ry * cosPhi, rx * sinPhi);
    const yCandidates = [thetaY0, thetaY0 + Math.PI];
    for (const theta of yCandidates) {
      if (angleInSweep(theta, startAngle, endAngle)) {
        const pt: [number, number] = [0, 0];
        ellipsePoint(cx, cy, rx, ry, xRotation, theta, pt);
        if (pt[1] < minY) minY = pt[1];
        if (pt[1] > maxY) maxY = pt[1];
      }
    }
  }

  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);

  return out;
}
