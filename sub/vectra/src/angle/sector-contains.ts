import { assertFiniteNumbers } from '../math/range.internal';
import { rawSweepCcw, rawSweepCw } from './sweep.internal';

/**
 * angle이 start에서 end로 가는 sector 호 안에 포함되면 true를 반환한다.
 *
 * `direction`이 `'ccw'`이면 counter-clockwise, `'cw'`이면 clockwise sector containment이다.
 * start와 end 경계는 inclusive이다. wrap-around를 지원한다.
 * `direction`은 angle scalar 방향이며 screen 좌표계(y-down) 의미를 전제하지 않는다.
 *
 * 주의: `start`와 `end`가 같거나 full-turn equivalent이면 sweep이 0이 되어 start 위치만 포함된다.
 * "전체 원" sector는 이 함수로 표현할 수 없다.
 *
 * invalid direction은 RangeError를 던진다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle 검사할 angle (radian)
 * @param start sector 호의 시작 angle (radian)
 * @param end sector 호의 끝 angle (radian)
 * @param direction sector 방향. `'ccw'` (counter-clockwise) 또는 `'cw'` (clockwise). 기본값 `'ccw'`
 */
export function sectorContains(angle: number, start: number, end: number, direction: 'ccw' | 'cw' = 'ccw'): boolean {
  assertFiniteNumbers([angle, start, end]);

  if (direction !== 'ccw' && direction !== 'cw') {
    throw new RangeError('direction must be "ccw" or "cw"');
  }

  // start 기준 angle/end의 sweep을 같은 방향으로 [0, 2π) 정규화해 포함 여부를 비교한다.
  const sweep = direction === 'ccw' ? rawSweepCcw : rawSweepCw;

  return sweep(start, angle) <= sweep(start, end);
}
