/**
 * 정삼각형의 높이(altitude)로 변 길이를 계산한다.
 *
 * 정삼각형 변 길이 공식: side = altitude * 2 / √3
 *
 * 음수, NaN, Infinity 입력은 JS 산술 결과를 그대로 반환한다.
 *
 * @param altitude 정삼각형의 높이
 */
export function equilateralSide(altitude: number): number {
  return (altitude * 2) / Math.sqrt(3);
}
