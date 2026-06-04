import type { CircleWritable, XYInput } from '../types';
import { createCircle } from './create-circle';
import { fromThreePointsInto } from './from-three-points-into';

/**
 * 세 점을 지나는 circumscribed circle을 새 plain object로 반환한다.
 *
 * collinear, duplicate, non-finite 입력이면 undefined를 반환한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `fromThreePointsInto`와 동일하다.
 * @param a 첫 번째 점
 * @param b 두 번째 점
 * @param c 세 번째 점
 */
export function fromThreePoints(a: XYInput, b: XYInput, c: XYInput): CircleWritable | undefined {
  const out = createCircle();
  return fromThreePointsInto(out, a, b, c) ? out : undefined;
}
