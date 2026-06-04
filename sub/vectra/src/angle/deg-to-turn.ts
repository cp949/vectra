/**
 * degree를 turn으로 변환한다. 1 turn = 360°.
 *
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param degrees turn으로 변환할 degree 값
 */
export function degToTurn(degrees: number): number {
  if (!Number.isFinite(degrees)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  return degrees / 360;
}
