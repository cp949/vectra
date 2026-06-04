import type { XYObjectWritable } from '../types/index';
import { parseSvgPointsInto } from './parse-svg-points-into';

/**
 * SVG `points` attribute 문자열을 파싱하여 새 배열로 반환한다.
 *
 * - 새 `{ x, y }` object 배열을 할당하여 반환한다.
 * - buffer 재사용이 필요하면 {@link parseSvgPointsInto}를 사용한다.
 * - 파싱 실패 시 Error를 throw한다.
 * - 빈 문자열은 정상 처리(빈 배열 반환).
 *
 * SVG grammar: 수를 공백과 콤마 혼합으로 구분한다.
 *   "10,20 30,40", "10 20 30 40", "10,20,30,40" 모두 유효.
 *
 * @param input - SVG `points` attribute 문자열
 * @returns 파싱된 `{ x, y }` 배열
 */
export function parseSvgPoints(input: string): { x: number; y: number }[] {
  const out: XYObjectWritable[] = [];
  parseSvgPointsInto(out, input);
  return out;
}
