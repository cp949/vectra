import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike } from '../types';

const ANGLE_EPSILON = 1e-12;
const TWO_PI = Math.PI * 2;

/**
 * 두 원의 외부(inner=false) 또는 내부(inner=true) 접선 각도를 out에 기록한다.
 *
 * outer tangent(기본): 두 원이 분리됐을 때 외부 접선 각도 2개를 push한다.
 * inner tangent: 두 원이 겹치지 않을 때 내부 접선 각도 2개를 push한다.
 * 접선이 존재하지 않거나 두 원이 동일 중심이거나 `r1 <= 0` 또는 `r2 <= 0`이면 out.length = 0을 설정하고 빈 out을 반환한다.
 * 동일한 각도가 epsilon 범위에서 중복되면 한 개만 push되어 결과 길이가 1이 될 수 있다.
 *
 * @param out 각도를 기록할 배열. 기존 내용은 제거된다.
 * @param circleA 첫 번째 원
 * @param circleB 두 번째 원
 * @param inner true이면 inner tangent, false이면 outer tangent (기본값 false)
 */
export function tangentAnglesInto(out: number[], circleA: CircleLike, circleB: CircleLike, inner = false): number[] {
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

  // center간의 각도
  const angle = Math.atan2(dy, dx);

  if (!inner) {
    // outer tangent: r1과 r2의 차이 사용
    const rDiff = r1 - r2;
    if (Math.abs(rDiff) > dist) {
      // 한 원이 다른 원 내부에 완전 포함
      return out;
    }
    const beta = Math.acos(Math.max(-1, Math.min(1, rDiff / dist)));
    pushUniqueAngle(out, angle + beta);
    pushUniqueAngle(out, angle - beta);
  } else {
    // inner tangent: r1과 r2의 합 사용
    const rSum = r1 + r2;
    if (rSum > dist) {
      // 두 원이 겹침
      return out;
    }
    const beta = Math.acos(Math.max(-1, Math.min(1, rSum / dist)));
    pushUniqueAngle(out, angle + beta);
    pushUniqueAngle(out, angle - beta);
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
