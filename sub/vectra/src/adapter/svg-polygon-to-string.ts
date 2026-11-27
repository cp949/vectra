/**
 * 교차 배치한 좌표 배열을 SVG `<polygon>` points attribute 문자열로 직렬화한다.
 */

import type { Polygon } from '../types/flat-shapes.internal';
import { type AdapterStringifyOptions, formatNumber } from './adapter-format.internal';

/** SVG polygon 직렬화 옵션. AdapterStringifyOptions와 동일하다. */
export type SvgPolygonStringifyOptions = AdapterStringifyOptions;

/**
 * 교차 배치한 좌표 배열을 SVG `<polygon>` points attribute 형식의 문자열로 직렬화한다.
 *
 * - 좌표 개수가 홀수면 RangeError를 던진다.
 * - 빈 배열은 빈 문자열을 반환한다.
 * - NaN 또는 Infinity 좌표는 `""` (빈 문자열)로 치환되어 연속 공백이 포함된 문자열이 생성될 수 있다. 입력 유효성은 caller가 보장한다.
 * - options.precision 미지정 시 String(n) 기반 포맷을 사용한다.
 *
 * @param points - 직렬화할 `[x0, y0, x1, y1, ...]` 배열
 * @param options - 직렬화 옵션
 */
export function svgPolygonToString(points: Polygon, options?: SvgPolygonStringifyOptions): string {
  if (points.length % 2 !== 0) {
    throw new RangeError('polygon coordinates must have even length');
  }

  const precision = options?.precision;
  return points.map((coordinate) => formatNumber(coordinate, precision)).join(' ');
}
