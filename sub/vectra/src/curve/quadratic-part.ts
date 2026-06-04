import type { XYInput, XYObjectWritable } from '../types';
import { quadraticPartInto } from './quadratic-part-into';

/**
 * quadratic Bezier curve의 파라미터 구간 [fromT, toT]에 해당하는 sub-curve를 새 object로 반환한다.
 *
 * `quadraticPartInto`의 allocating companion. 결과는 plain object `{ p0, p1, p2 }`다.
 *
 *
 * clamp/정규화/fallback 정책은 `quadraticPartInto`와 동일하다.
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param fromT 구간 시작 파라미터
 * @param toT 구간 끝 파라미터
 */
export function quadraticPart(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  fromT: number,
  toT: number
): { p0: XYObjectWritable; p1: XYObjectWritable; p2: XYObjectWritable } {
  const out = { p0: { x: 0, y: 0 }, p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 } };
  return quadraticPartInto(out, p0, p1, p2, fromT, toT);
}
