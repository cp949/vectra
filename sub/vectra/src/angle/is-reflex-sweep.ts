import { assertFiniteNumbers } from '../math/range.internal';
import { rawSweepCcw, rawSweepCw } from './sweep.internal';

/**
 * from에서 to까지 지정 방향의 sweep이 reflex(π 초과)인지 판정한다.
 *
 * sweep이 `Math.PI`를 초과하면 true를 반환한다.
 * 정확히 `Math.PI`인 반원 sweep은 reflex가 아니다.
 * `from === to`와 full-turn equivalent는 sweep `0`으로 보고 false를 반환한다.
 * invalid direction은 RangeError를 던진다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param from 시작 angle (radian)
 * @param to 끝 angle (radian)
 * @param direction 방향. `'ccw'` 또는 `'cw'`. 기본값 `'ccw'`
 */
export function isReflexSweep(from: number, to: number, direction: 'ccw' | 'cw' = 'ccw'): boolean {
  assertFiniteNumbers([from, to]);

  if (direction !== 'ccw' && direction !== 'cw') {
    throw new RangeError('direction must be "ccw" or "cw"');
  }

  return (direction === 'ccw' ? rawSweepCcw(from, to) : rawSweepCw(from, to)) > Math.PI;
}
