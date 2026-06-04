/**
 * turn을 degree로 변환한다. 1 turn = 360°.
 *
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param turns degree로 변환할 turn 값
 */
export function turnToDeg(turns: number): number {
  if (!Number.isFinite(turns)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  return turns * 360;
}
