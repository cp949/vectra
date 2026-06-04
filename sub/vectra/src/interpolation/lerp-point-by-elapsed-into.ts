import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { assertFiniteNumbers, assertPositiveDuration } from './interpolation.internal';

/**
 * raw 경과 시간 진행 비율로 보간한 좌표를 out에 기록하고 out을 반환한다.
 *
 * progress는 raw `elapsed / duration`이며 clamp하지 않는다.
 * 이름에 `clamped`가 없으므로 `elapsed < 0`과 `elapsed > duration` 모두 extrapolation을 허용한다.
 * a, b의 x/y와 elapsed는 finite number여야 한다.
 * `duration`은 finite number이고 `duration > 0`이어야 한다. 그렇지 않으면 RangeError.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a `elapsed === 0`일 때의 좌표
 * @param b `elapsed === duration`일 때의 좌표
 * @param elapsed 경과 시간
 * @param duration 전체 구간 길이. finite이고 `> 0`이어야 한다
 */
export function lerpPointByElapsedInto<Out extends XYWritable>(
  out: Out,
  a: XYInput,
  b: XYInput,
  elapsed: number,
  duration: number
): Out {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  assertFiniteNumbers([ax, ay, bx, by, elapsed]);
  assertPositiveDuration(duration);

  const t = elapsed / duration;

  // a/b 읽기 완료 후 out에 쓰므로 aliasing safe
  return writeXY(out, ax + (bx - ax) * t, ay + (by - ay) * t);
}
