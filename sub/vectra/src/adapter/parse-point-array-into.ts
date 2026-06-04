/**
 * generic point-array 문자열을 파싱하여 XYObjectWritable 배열에 기록한다.
 */

import type { XYObjectWritable } from '../types/index';
import { parseSvgPointsKernel } from './svg-points-parse.internal';

/**
 * generic point-array 문자열을 파싱하여 out 배열에 기록한다.
 *
 * SVG points와 동일한 grammar를 사용한다(공백·콤마 혼합 허용).
 * 내부 구현은 svg-points-parse.internal kernel을 재사용한다.
 *
 * - out은 호출 전 내용을 보존하지 않는다 (out.length = 0 후 push).
 * - 파싱 실패 시 Error를 throw한다.
 * - 빈 문자열은 정상 처리(out.length = 0).
 *
 * @param out - 결과를 기록할 XYObjectWritable 배열
 * @param input - point-array 문자열
 * @returns out (편의 반환)
 */
export function parsePointArrayInto(out: XYObjectWritable[], input: string): XYObjectWritable[] {
  out.length = 0;
  parseSvgPointsKernel(out, input);
  return out;
}
