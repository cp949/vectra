/**
 * SVG `points` attribute 문자열을 파싱하여 XYObjectWritable 배열에 기록한다.
 */

import type { XYObjectWritable } from '../types/index';
import { parseSvgPointsKernel } from './svg-points-parse.internal';

/**
 * SVG `points` attribute 문자열을 파싱하여 out 배열에 기록한다.
 *
 * - out은 호출 전 내용을 보존하지 않는다 (out.length = 0 후 push).
 * - 파싱 실패 시 Error를 throw한다.
 * - 빈 문자열은 정상 처리(out.length = 0).
 *
 * SVG grammar: 수를 공백과 콤마 혼합으로 구분한다.
 *   "10,20 30,40", "10 20 30 40", "10,20,30,40" 모두 유효.
 *
 * @param out - 결과를 기록할 XYObjectWritable 배열
 * @param input - SVG `points` attribute 문자열
 * @returns out (편의 반환)
 */
export function parseSvgPointsInto(out: XYObjectWritable[], input: string): XYObjectWritable[] {
  out.length = 0;
  parseSvgPointsKernel(out, input);
  return out;
}
