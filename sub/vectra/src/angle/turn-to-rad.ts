/**
 * turn을 radian으로 변환한다. 1 turn = 2π rad.
 *
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param turns radian으로 변환할 turn 값
 */
export function turnToRad(turns: number): number {
  if (!Number.isFinite(turns)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  return turns * (2 * Math.PI);
}
