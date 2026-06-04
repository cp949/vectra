/**
 * precision 축소 전용 SVG path data string 생성.
 *
 * domain barrel(./index)을 import하지 않는다.
 */

import type { PathCommand, SvgPathStringifyOptions } from '../types/index';
import { pathDataToString } from './path-data-to-string';

/**
 * PathCommand[] 배열을 precision 옵션에 따라 최적화된 SVG path data string으로 직렬화한다.
 *
 * pathDataToString에 위임하며, precision을 지정하면 trailing zero와 trailing decimal point를 제거한다.
 * topology 변경(arc→line, collinear 제거), shorthand 출력(S/T/H/V), command 수 변경은 수행하지 않는다.
 *
 * @param commands 직렬화할 PathCommand 배열
 * @param options 포맷팅 옵션 (precision: 소수점 자릿수)
 * @returns SVG path data string (빈 배열이면 "")
 */
export function optimizePathDataString(commands: readonly PathCommand[], options?: SvgPathStringifyOptions): string {
  return pathDataToString(commands, options);
}
