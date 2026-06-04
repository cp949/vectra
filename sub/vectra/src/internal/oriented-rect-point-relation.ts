import type { OrientedRectQueryFrame } from './oriented-rect-query';

/**
 * point가 oriented-rect query frame의 closed boundary 안에 있는지 판정한다.
 *
 * `containsPoint` leaf와 `intersects` owner facade가 같은 point relation 정책을 공유하도록
 * frame-level 계산을 이 helper에 둔다. point를 frame local-space로 변환한 뒤
 * `abs(localX) <= hw && abs(localY) <= hh`로 판정한다. inverse axis는
 * `localX = dx*cos + dy*sin`, `localY = -dx*sin + dy*cos`다. edge와 corner 위 point를 포함하는
 * closed boundary다.
 *
 * `width <= 0 || height <= 0`인 empty frame은 항상 false다. frame center나 point 좌표가
 * non-finite이면 local 좌표가 `NaN`/무한대가 되어 boundary 비교가 false가 되고 결과가 false로
 * 수렴한다.
 *
 * @param frame point containment를 검사할 query frame
 * @param px 검사할 point의 x 좌표
 * @param py 검사할 point의 y 좌표
 */
export function orientedRectFrameContainsPoint(frame: OrientedRectQueryFrame, px: number, py: number): boolean {
  if (frame.width <= 0 || frame.height <= 0) return false;

  const dx = px - frame.cx;
  const dy = py - frame.cy;
  const localX = dx * frame.cos + dy * frame.sin;
  const localY = -dx * frame.sin + dy * frame.cos;

  return Math.abs(localX) <= frame.hw && Math.abs(localY) <= frame.hh;
}
