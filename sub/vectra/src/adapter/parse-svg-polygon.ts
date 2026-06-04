import type { XYObjectWritable } from '../types/index';
import { parseSvgPolygonInto } from './parse-svg-polygon-into';

/**
 * SVG `<polygon>` points attribute 문자열을 파싱하여 새 배열로 반환한다.
 *
 * - 새 `{ x, y }` object 배열을 할당하여 반환한다.
 * - buffer 재사용이 필요하면 {@link parseSvgPolygonInto}를 사용한다.
 * - 파싱 실패 시 Error를 throw한다.
 * - 빈 문자열은 정상 처리(빈 배열 반환).
 *
 * SVG grammar: 수를 공백과 콤마 혼합으로 구분한다.
 *   "10,20 30,40", "10 20 30 40", "10,20,30,40" 모두 유효.
 * closed/open 의미는 caller 책임이다.
 *
 * @param input - SVG `<polygon>` points attribute 문자열
 * @returns 파싱된 `{ x, y }` 배열
 */
export function parseSvgPolygon(input: string): { x: number; y: number }[] {
  const out: XYObjectWritable[] = [];
  parseSvgPolygonInto(out, input);
  return out;
}
