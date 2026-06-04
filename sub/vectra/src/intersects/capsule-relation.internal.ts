/**
 * capsule relation owner가 공유하는 raw-coordinate distance kernel.
 *
 * capsule × segment, capsule × capsule relation은 axis segment를 segment로 환원해 두 segment
 * 사이 최단 거리 제곱으로 판정한다. 공유 계산을 public leaf가 아니라 이 intersects-local internal
 * helper로 둔다.
 */

/**
 * 두 segment 사이 최단 거리 제곱을 반환한다.
 *
 * Ericson의 closest-point-between-segments를 따른다. parameter `s`, `t`를 `[0, 1]`로 clamp해
 * 두 segment 위 closest point pair를 구하고 그 거리 제곱을 반환한다. 교차/접촉하는 두 segment는
 * `0`을 반환한다(endpoint-only 거리로 환원하지 않는다). zero-length segment는 점으로 환원해
 * point-vs-segment 거리로 판정하고, 양쪽 모두 zero-length이면 두 점 사이 거리다. validation
 * 없음. 호출자가 유효한 좌표를 보장한다.
 *
 * @param ax 첫 segment 시작점 x
 * @param ay 첫 segment 시작점 y
 * @param bx 첫 segment 끝점 x
 * @param by 첫 segment 끝점 y
 * @param cx 둘째 segment 시작점 x
 * @param cy 둘째 segment 시작점 y
 * @param dx 둘째 segment 끝점 x
 * @param dy 둘째 segment 끝점 y
 */
export function segmentSegmentDistanceSqXY(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number
): number {
  const d1x = bx - ax;
  const d1y = by - ay;
  const d2x = dx - cx;
  const d2y = dy - cy;
  const rx = ax - cx;
  const ry = ay - cy;
  const a = d1x * d1x + d1y * d1y;
  const e = d2x * d2x + d2y * d2y;
  const f = d2x * rx + d2y * ry;
  let s: number;
  let t: number;
  if (a === 0 && e === 0) {
    // 두 segment 모두 점
    s = 0;
    t = 0;
  } else if (a === 0) {
    // 첫 segment가 점
    s = 0;
    t = Math.max(0, Math.min(1, f / e));
  } else {
    const c = d1x * rx + d1y * ry;
    if (e === 0) {
      // 둘째 segment가 점
      t = 0;
      s = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = d1x * d2x + d1y * d2y;
      const denom = a * e - b * b;
      // 평행(denom === 0)이면 s를 0으로 두고 t로 환원한다.
      s = denom !== 0 ? Math.max(0, Math.min(1, (b * f - c * e) / denom)) : 0;
      t = (b * s + f) / e;
      // t를 [0,1] 밖에서 clamp한 뒤 그에 맞는 s를 다시 구한다.
      if (t < 0) {
        t = 0;
        s = Math.max(0, Math.min(1, -c / a));
      } else if (t > 1) {
        t = 1;
        s = Math.max(0, Math.min(1, (b - c) / a));
      }
    }
  }
  const c1x = ax + d1x * s;
  const c1y = ay + d1y * s;
  const c2x = cx + d2x * t;
  const c2y = cy + d2y * t;
  const gx = c1x - c2x;
  const gy = c1y - c2y;
  return gx * gx + gy * gy;
}
