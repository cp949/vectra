import type { PolygonWritable } from '../types/flat-shapes.internal';
import { parseSvgPolygonInto } from './parse-svg-polygon-into';

/**
 * SVG `<polygon>` points attribute 문자열을 파싱하여 새 배열로 반환한다.
 *
 * - 교차 배치한 `[x0, y0, x1, y1, ...]` 좌표 배열을 반환한다.
 * - buffer 재사용이 필요하면 {@link parseSvgPolygonInto}를 사용한다.
 * - 파싱 실패 시 Error를 throw한다.
 * - 빈 문자열은 정상 처리(빈 배열 반환).
 *
 * SVG grammar: 수를 공백과 콤마 혼합으로 구분한다.
 *   "10,20 30,40", "10 20 30 40", "10,20,30,40" 모두 유효.
 * closed/open 의미는 caller 책임이다.
 *
 * @param input - SVG `<polygon>` points attribute 문자열
 * @returns 파싱된 좌표 배열
 */
export function parseSvgPolygon(input: string): PolygonWritable {
  const out: PolygonWritable = [];
  parseSvgPolygonInto(out, input);
  return out;
}
