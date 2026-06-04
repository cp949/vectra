import type { InfiniteLineWritable, XYInput } from '../types';
import { createInfiniteLine } from './create-infinite-line';
import { fromPointsInto } from './from-points-into';

/**
 * 두 point `a`, `b`를 지나는 supporting line을 새 plain object로 반환한다.
 *
 * `origin = a`, `direction = b - a`로 기록한다.
 * `a`와 `b`가 같으면 degenerate infinite-line(`direction = (0, 0)`)이 된다.
 *
 * non-finite point component는 검증하지 않는다. `b - a`의 산술 결과가 direction에 그대로 기록된다.
 *
 * @param a 직선이 지나는 첫 point. `origin`으로 복사된다
 * @param b 직선이 지나는 둘째 point. `direction = b - a`로 사용된다
 */
export function fromPoints(a: XYInput, b: XYInput): InfiniteLineWritable {
  return fromPointsInto(createInfiniteLine(), a, b);
}
