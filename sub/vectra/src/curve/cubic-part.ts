import type { XYInput, XYObjectWritable } from '../types';
import { cubicPartInto } from './cubic-part-into';

/**
 * cubic Bezier curve의 파라미터 구간 [fromT, toT]에 해당하는 sub-curve를 새 object로 반환한다.
 *
 * `cubicPartInto`의 allocating companion. 결과는 plain object `{ p0, p1, p2, p3 }`다.
 *
 *
 * clamp/정규화/fallback 정책은 `cubicPartInto`와 동일하다.
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param fromT 구간 시작 파라미터
 * @param toT 구간 끝 파라미터
 */
export function cubicPart(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  fromT: number,
  toT: number
): { p0: XYObjectWritable; p1: XYObjectWritable; p2: XYObjectWritable; p3: XYObjectWritable } {
  const out = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
  return cubicPartInto(out, p0, p1, p2, p3, fromT, toT);
}
