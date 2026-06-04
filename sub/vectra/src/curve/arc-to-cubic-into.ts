import type { ArcToCubicOptions, CenterArcLike, CubicCurveWritable } from '../types';
import { ellipseDerivative, ellipsePoint, isDegenerateRadii } from './arc.internal';

/**
 * center form arc를 cubic Bezier curve 목록으로 근사해 out 배열에 기록하고 out을 반환한다.
 *
 * arc를 maxAngle(기본 π/2) 이하의 segment로 분할하고 각 segment를 cubic Bezier로 근사한다.
 * 각 segment 근사 공식: alpha = (4/3) * tan(Δθ/4)
 *   p1 = p0 + alpha * dP/dθ_at_start
 *   p2 = p3 - alpha * dP/dθ_at_end
 * zero-sweep arc(startAngle === endAngle) 또는 degenerate arc는 빈 배열을 반환한다.
 * out.length = 0 후 push하므로 기존 내용은 삭제된다.
 * options.maxAngle이 finite positive가 아니면 기본값 Math.PI / 2를 사용한다.
 *
 * @param out cubic Bezier curve 목록을 기록할 writable array
 * @param centerArc center form arc input
 * @param options 분할 옵션
 * @param options.maxAngle 분할 최대 각도 (radian). 기본값: Math.PI / 2
 * @returns out
 */
export function arcToCubicInto(
  out: CubicCurveWritable[],
  centerArc: CenterArcLike,
  options?: ArcToCubicOptions
): CubicCurveWritable[] {
  out.length = 0;

  const { cx, cy, rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) return out;
  if (startAngle === endAngle) return out;

  const optionMaxAngle = options?.maxAngle ?? Math.PI / 2;
  const maxAngle = Number.isFinite(optionMaxAngle) && optionMaxAngle > 0 ? optionMaxAngle : Math.PI / 2;
  const totalSweep = endAngle - startAngle;
  const absSweep = Math.abs(totalSweep);

  // 분할 수 계산
  const segCount = Math.max(1, Math.ceil(absSweep / maxAngle));
  const dTheta = totalSweep / segCount;

  const pt: [number, number] = [0, 0];
  const deriv: [number, number] = [0, 0];

  for (let i = 0; i < segCount; i++) {
    const theta0 = startAngle + i * dTheta;
    const theta1 = startAngle + (i + 1) * dTheta;
    const alpha = (4 / 3) * Math.tan(dTheta / 4);

    // segment 시작점 p0
    ellipsePoint(cx, cy, rx, ry, xRotation, theta0, pt);
    const s0x = pt[0];
    const s0y = pt[1];

    // segment 끝점 p3
    ellipsePoint(cx, cy, rx, ry, xRotation, theta1, pt);
    const s3x = pt[0];
    const s3y = pt[1];

    // 시작점에서 dP/dθ → 제어점 p1
    ellipseDerivative(rx, ry, xRotation, theta0, deriv);
    const s1x = s0x + alpha * deriv[0];
    const s1y = s0y + alpha * deriv[1];

    // 끝점에서 dP/dθ → 제어점 p2
    ellipseDerivative(rx, ry, xRotation, theta1, deriv);
    const s2x = s3x - alpha * deriv[0];
    const s2y = s3y - alpha * deriv[1];

    out.push({
      p0: { x: s0x, y: s0y },
      p1: { x: s1x, y: s1y },
      p2: { x: s2x, y: s2y },
      p3: { x: s3x, y: s3y },
    });
  }

  return out;
}
