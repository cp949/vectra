import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineWritable, XYInput, XYWritable } from '../types';

/**
 * 두 point `a`, `b`를 지나는 supporting line을 `out`에 기록하고 `out`을 반환한다.
 *
 * `origin = a`, `direction = b - a`로 기록한다.
 * `a`와 `b`가 같으면 degenerate infinite-line(`direction = (0, 0)`)이 된다.
 *
 * non-finite point component는 검증하지 않는다. `b - a`의 산술 결과가 direction에 그대로 기록된다.
 *
 * `out.origin` 또는 `out.direction`이 `a`나 `b`와 같은 object여도 alias-safe하다
 * (좌표를 모두 먼저 읽은 뒤 기록한다).
 *
 * @param out infinite-line을 기록할 writable output
 * @param a 직선이 지나는 첫 point. `origin`으로 복사된다
 * @param b 직선이 지나는 둘째 point. `direction = b - a`로 사용된다
 */
export function fromPointsInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  a: XYInput,
  b: XYInput
): Out {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  writeXY(out.origin, ax, ay);
  writeXY(out.direction, bx - ax, by - ay);
  return out;
}
