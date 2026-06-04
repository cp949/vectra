import { assertFiniteNumbers } from '../math/range.internal';
import { rawSweepCcw, rawSweepCw } from './sweep.internal';

/**
 * from에서 to까지 지정 방향의 sweep 크기를 반환한다.
 *
 * `direction`이 `'ccw'`이면 CCW sweep, `'cw'`이면 CW sweep을 `[0, 2π)` 범위로 반환한다.
 * invalid direction은 RangeError를 던진다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param from 시작 angle (radian)
 * @param to 끝 angle (radian)
 * @param direction 방향. `'ccw'` (counter-clockwise) 또는 `'cw'` (clockwise)
 */
export function sweepAngle(from: number, to: number, direction: 'ccw' | 'cw'): number {
  assertFiniteNumbers([from, to]);

  if (direction !== 'ccw' && direction !== 'cw') {
    throw new RangeError('direction must be "ccw" or "cw"');
  }

  return direction === 'ccw' ? rawSweepCcw(from, to) : rawSweepCw(from, to);
}
