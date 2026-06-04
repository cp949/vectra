/**
 * degree angle을 radian angle로 변환한다.
 *
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param degrees radian으로 변환할 degree 값
 */
export function degToRad(degrees: number): number {
  if (!Number.isFinite(degrees)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  return (degrees * Math.PI) / 180;
}
