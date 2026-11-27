import { hypot2 } from '../internal/numeric';

/**
 * segment `(ax, ay)→(bx, by)`와 point `(px, py)` 사이 최단 거리를 반환한다.
 *
 * `distanceToPoint`를 좌표 숫자로 받는 버전이다. 결과는 같은 입력의 `distanceToPoint`와 같다.
 * 매 프레임 수천 번 부르는 hot path에서 segment·point 객체를 만들거나 읽는 비용을 없앤다.
 * - 길이 0 segment는 끝점까지 거리다.
 *
 * 계산 본문을 internal helper로 빼지 않고 이 함수에 둔다.
 * - 번들하지 않은 ESM에서 `dist` chunk 경계를 넘는 호출 한 겹이 `distanceToPoint`를 약 20% 느리게 했다.
 * - 대응 함수와 같은 식이다. 시험이 난수 입력에서 `Object.is`로 같음을 고정한다.
 *
 * @param ax segment 시작점 x
 * @param ay segment 시작점 y
 * @param bx segment 끝점 x
 * @param by segment 끝점 y
 * @param px point x
 * @param py point y
 */
export function distanceToPointXY(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const qx = px - ax;
  const qy = py - ay;
  if (lenSq === 0) return hypot2(qx, qy);
  const t = Math.max(0, Math.min(1, (qx * dx + qy * dy) / lenSq));
  return hypot2(t * dx - qx, t * dy - qy);
}
