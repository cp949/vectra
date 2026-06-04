/**
 * radian angle을 degree angle로 변환한다.
 *
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param radians degree로 변환할 radian 값
 */
export function radToDeg(radians: number): number {
  if (!Number.isFinite(radians)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  return (radians * 180) / Math.PI;
}
