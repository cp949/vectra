import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike, XYInput, XYObjectWritable, XYWritable } from '../types';

/**
 * 외부 점에서 원까지의 접선점 2개를 out에 기록한다.
 *
 * externalPoint가 원 내부이면 out.length = 0을 설정하고 빈 out을 반환한다.
 * externalPoint가 원 경계 위이면 접선점 1개(externalPoint 자체와 동일)를 push한다.
 * externalPoint가 원 외부이면 접선점 2개를 push한다.
 * empty circle(radius <= 0)이면 out.length = 0을 설정하고 빈 out을 반환한다.
 *
 * @param out 접선점을 기록할 writable XY 배열. 기존 내용은 제거된다.
 * @param circle 대상 원
 * @param externalPoint 외부 점
 */
export function tangentPointsFromExternalInto<P extends XYWritable = XYObjectWritable>(
  out: P[],
  circle: CircleLike,
  externalPoint: XYInput
): P[] {
  out.length = 0;

  const r = readCircleRadius(circle);
  if (r <= 0) return out;

  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const px = readX(externalPoint);
  const py = readY(externalPoint);

  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy);
  const distSq = dx * dx + dy * dy;
  const rSq = r * r;

  if (distSq < rSq) {
    // 원 내부
    return out;
  }

  if (distSq === rSq) {
    // 경계 위 — 접선점 1개 (externalPoint 자체)
    const p = { x: px, y: py } as P;
    out.push(p);
    return out;
  }

  // 외부 — 접선점 2개
  // 중심에서 externalPoint 방향 단위 벡터 (C→E 방향)
  const ux = dx / dist;
  const uy = dy / dist;

  // 접선 각도: C에서 CE와 CT 사이의 각도 (직각삼각형, 직각은 T에서)
  // cos(angle) = r / dist, sin(angle) = sqrt(dist² - r²) / dist
  const cosA = r / dist;
  const sinA = Math.sqrt(distSq - rSq) / dist;

  // 두 접선점: center + r * rotate(±angle) of (C→E unit)
  // P1 = center + r * (ux*cosA - uy*sinA, ux*sinA + uy*cosA)
  const p1x = cx + r * (ux * cosA - uy * sinA);
  const p1y = cy + r * (ux * sinA + uy * cosA);

  // P2 = center + r * (ux*cosA + uy*sinA, -ux*sinA + uy*cosA)
  const p2x = cx + r * (ux * cosA + uy * sinA);
  const p2y = cy + r * (-ux * sinA + uy * cosA);

  const obj1 = { x: p1x, y: p1y } as P;
  const obj2 = { x: p2x, y: p2y } as P;
  out.push(obj1, obj2);

  return out;
}
