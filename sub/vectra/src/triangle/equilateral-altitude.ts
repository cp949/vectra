/**
 * 정삼각형의 변 길이로 높이(altitude)를 계산한다.
 *
 * 정삼각형 높이 공식: h = side * √3 / 2
 *
 * 음수, NaN, Infinity 입력은 JS 산술 결과를 그대로 반환한다.
 *
 * @param side 정삼각형의 변 길이
 */
export function equilateralAltitude(side: number): number {
  return (side * Math.sqrt(3)) / 2;
}
