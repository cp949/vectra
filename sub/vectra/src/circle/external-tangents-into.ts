import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike, SegmentWritable } from '../types';

const ANGLE_EPSILON = 1e-12;
const TWO_PI = Math.PI * 2;

/**
 * 두 원의 external tangent segment들을 out에 기록하고 out을 반환한다.
 *
 * out은 호출 시작 시 비운다. 각 segment의 a는 첫 번째 circle 위 tangent point, b는 두 번째 circle 위 tangent point다.
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
export function externalTangentsInto(
  out: SegmentWritable[],
  circleA: CircleLike,
  circleB: CircleLike
): SegmentWritable[] {
  out.length = 0;

  const cx1 = readX(readCircleCenter(circleA));
  const cy1 = readY(readCircleCenter(circleA));
  const r1 = readCircleRadius(circleA);

  const cx2 = readX(readCircleCenter(circleB));
  const cy2 = readY(readCircleCenter(circleB));
  const r2 = readCircleRadius(circleB);

  if (r1 <= 0 || r2 <= 0) return out;

  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const dist = Math.hypot(dx, dy);
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
      a: { x: cx1 + r1 * cosA, y: cy1 + r1 * sinA },
      b: { x: cx2 + r2 * cosA, y: cy2 + r2 * sinA },
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
