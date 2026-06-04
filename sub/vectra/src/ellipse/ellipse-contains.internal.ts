/**
 * ellipse 내부 또는 boundary 위 point 판정을 공유하는 numeric helper.
 *
 * `containsRect`, `containsCircle`에서 corner/sample point가 ellipse 안에 있는지
 * 확인할 때 사용한다. public `containsPoint` leaf를 import하지 않기 위한 internal 공유 helper다.
 *
 * 호출자는 `rx > 0`, `ry > 0`을 보장해야 한다. empty ellipse 분기는 각 leaf module에서 처리한다.
 */

/**
 * scalar 좌표 (cx, cy, rx, ry, px, py)로 closed boundary 포함 여부를 반환한다.
 *
 * 공식: `((px-cx)/rx)² + ((py-cy)/ry)² <= 1`. 경계 위 점(`= 1`)도 true.
 *
 * @param cx ellipse center x
 * @param cy ellipse center y
 * @param rx ellipse x축 반지름 (양수 보장 필요)
 * @param ry ellipse y축 반지름 (양수 보장 필요)
 * @param px 검사할 point x
 * @param py 검사할 point y
 */
export function pointInEllipseClosed(cx: number, cy: number, rx: number, ry: number, px: number, py: number): boolean {
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1;
}
