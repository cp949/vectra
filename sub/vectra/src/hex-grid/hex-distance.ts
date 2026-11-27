import { toHexCubeChecked, validateHexComputedSafeInteger } from '../internal/hex-grid';
import type { HexCube } from '../types/flat-shapes.internal';

/**
 * 두 hex coordinate 사이의 grid distance(이동해야 하는 hex 개수)를 반환한다.
 *
 * 두 입력은 cube 좌표다. `q + r + s === 0`을 검증한다. distance는 cube 성분 차의
 * `max(abs(dq), abs(dr), abs(ds))`로 계산한다. `hexDistance(a, a)`는 `0`이다.
 *
 * coordinate 성분이 safe integer가 아니거나(`NaN`, `Infinity`, non-integer float, unsafe integer)
 * cube invariant를 위반하면 `RangeError`다. 계산된 distance가 safe integer 범위를 벗어나면
 * `RangeError`다. 반환값은 signed zero 없는 non-negative safe integer다.
 *
 * @param a 첫 hex coordinate. cube
 * @param b 둘째 hex coordinate. cube
 */
export function hexDistance(a: HexCube, b: HexCube): number {
  const [aq, ar, as] = toHexCubeChecked(a);
  const [bq, br, bs] = toHexCubeChecked(b);

  const distance = Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
  validateHexComputedSafeInteger(distance, 'distance');

  return distance;
}
