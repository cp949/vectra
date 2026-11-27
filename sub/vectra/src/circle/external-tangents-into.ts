import type { Circle, SegmentWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

const ANGLE_EPSILON = 1e-12;
const TWO_PI = Math.PI * 2;

/**
 * 두 원의 external tangent segment들을 out에 기록하고 out을 반환한다.
 *
 * out은 호출 시작 시 비운다. 각 선분의 시작점은 첫 번째 원의 접점이고 끝점은 두 번째 원의 접점이다.
 * 둘 중 하나라도 empty circle(radius <= 0)이면 빈 out을 반환한다.
 * 중심이 같으면 빈 out을 반환한다.
 * 한 원이 다른 원 내부에 있어 external tangent가 없으면 빈 out을 반환한다.
 * 내접 collapse case에서는 같은 segment를 중복 push하지 않는다.
 * non-finite 좌표와 radius는 caller 책임이다.
 *
 * @param out tangent segment를 기록할 배열. 기존 내용은 제거된다.
 * @param circleA 첫 번째 원
 * @param circleB 두 번째 원
 */
export function externalTangentsInto(out: SegmentWritable[], circleA: Circle, circleB: Circle): SegmentWritable[] {
  out.length = 0;

  const cx1 = circleA.cx;
  const cy1 = circleA.cy;
  const r1 = circleA.r;

  const cx2 = circleB.cx;
  const cy2 = circleB.cy;
  const r2 = circleB.r;

  if (r1 <= 0 || r2 <= 0) return out;

  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const dist = hypot2(dx, dy);
  if (dist === 0) return out;

  const rDiff = r1 - r2;

  // 한 원이 다른 원 내부에 완전 포함
  if (Math.abs(rDiff) > dist) return out;

  const angle = Math.atan2(dy, dx);
  const beta = Math.acos(Math.max(-1, Math.min(1, rDiff / dist)));

  const angles: number[] = [];
  pushUniqueAngle(angles, angle + beta);
  pushUniqueAngle(angles, angle - beta);

  for (const α of angles) {
    const cosA = Math.cos(α);
    const sinA = Math.sin(α);
    out.push({
      x1: cx1 + r1 * cosA,
      y1: cy1 + r1 * sinA,
      x2: cx2 + r2 * cosA,
      y2: cy2 + r2 * sinA,
    });
  }

  return out;
}

function pushUniqueAngle(out: number[], angle: number): void {
  for (const existing of out) {
    const delta = Math.abs(existing - angle) % TWO_PI;
    if (Math.min(delta, TWO_PI - delta) <= ANGLE_EPSILON) return;
  }
  out.push(angle);
}
