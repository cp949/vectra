/**
 * radian angle을 degree angle로 변환한다.
 *
 * @param radians degree로 변환할 radian 값
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}
