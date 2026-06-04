/**
 * radian을 turn으로 변환한다. 1 turn = 2π rad.
 *
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param radians turn으로 변환할 radian 값
 */
export function radToTurn(radians: number): number {
  if (!Number.isFinite(radians)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  return radians / (2 * Math.PI);
}
