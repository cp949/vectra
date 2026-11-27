import type { BoundsWritable, RotatedEllipse } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * rotated ellipse를 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * oriented bounds가 아니라 AABB다. 전체 ellipse의 closed-form half-extent(φ = rotation):
 *   Δx = sqrt(rx²·cos²φ + ry²·sin²φ)
 *   Δy = sqrt(rx²·sin²φ + ry²·cos²φ)
 *   (minX, minY) = (cx - Δx, cy - Δy), (maxX, maxY) = (cx + Δx, cy + Δy)
 * half-extent는 overflow·underflow를 피하는 Euclidean 길이로 계산해 finite 큰 radius overflow와 subnormal underflow를 줄인다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 sentinel empty bounds
 * (minX = minY = +Inf, maxX = maxY = -Inf)를 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param ellipse bounds로 변환할 rotated ellipse
 */
export function rotatedBoundsInto<Out extends BoundsWritable>(out: Out, ellipse: RotatedEllipse): Out {
  const { cx, cy, rx, ry } = ellipse;

  // empty ellipse: sentinel empty bounds
  if (rx <= 0 || ry <= 0) {
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  const phi = ellipse.rotation;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const rxCos = rx * cosPhi;
  const rxSin = rx * sinPhi;
  const ryCos = ry * cosPhi;
  const rySin = ry * sinPhi;
  const dx = hypot2(rxCos, rySin);
  const dy = hypot2(rxSin, ryCos);
  out.minX = cx - dx;
  out.minY = cy - dy;
  out.maxX = cx + dx;
  out.maxY = cy + dy;
  return out;
}
