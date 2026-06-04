/**
 * XYInput 배열을 SVG `<polyline>` points attribute 문자열로 직렬화한다.
 */

import type { XYInput } from '../types/index';
import { type AdapterStringifyOptions, formatPointList } from './adapter-format.internal';

/** SVG polyline 직렬화 옵션. AdapterStringifyOptions와 동일하다. */
export type SvgPolylineStringifyOptions = AdapterStringifyOptions;

/**
 * XYInput 배열을 SVG `<polyline>` points attribute 형식의 문자열로 직렬화한다.
 *
 * - 빈 배열은 빈 문자열을 반환한다.
 * - NaN 또는 Infinity 좌표는 `""` (빈 문자열)로 치환되어 연속 공백이 포함된 문자열이 생성될 수 있다. 입력 유효성은 caller가 보장한다.
 * - options.precision 미지정 시 String(n) 기반 포맷을 사용한다.
 *
 * @param points - 직렬화할 점 배열
 * @param options - 직렬화 옵션
 */
export function svgPolylineToString(points: readonly XYInput[], options?: SvgPolylineStringifyOptions): string {
  return formatPointList(points, options);
}
