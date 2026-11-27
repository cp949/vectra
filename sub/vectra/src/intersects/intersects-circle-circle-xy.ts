/**
 * 두 circle `(ax, ay, ar)`와 `(bx, by, br)`가 교차하거나 접하면 true를 반환한다.
 *
 * `intersectsCircleCircle`을 좌표 숫자로 받는 버전이다. 결과는 같은 입력의 `intersectsCircleCircle`과 같다.
 * 물체 쌍 수만 개를 매 프레임 거르는 hot path에서 circle 객체를 만들거나 읽는 비용을 없앤다.
 * - radius ≤ 0이면 false다.
 * - closed boundary다. 접점도 true다.
 *
 * 계산 본문을 internal helper로 빼지 않고 이 함수에 둔다.
 * - 번들하지 않은 ESM에서 `dist` chunk 경계를 넘는 호출 한 겹이 원 쌍 장면을 약 2배 느리게 했다.
 * - 대응 함수와 같은 식이다. 시험이 난수 입력에서 `Object.is`로 같음을 고정한다.
 *
 * @param ax 첫 circle 중심 x
 * @param ay 첫 circle 중심 y
 * @param ar 첫 circle 반지름
 * @param bx 둘째 circle 중심 x
 * @param by 둘째 circle 중심 y
 * @param br 둘째 circle 반지름
 */
export function intersectsCircleCircleXY(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number
): boolean {
  if (ar <= 0 || br <= 0) return false;
  const dx = bx - ax;
  const dy = by - ay;
  const rSum = ar + br;
  return dx * dx + dy * dy <= rSum * rSum;
}
