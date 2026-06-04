/**
 * XYInput 배열을 공백 구분 `"x y x y ..."` 문자열로 직렬화한다.
 */

import type { XYInput } from '../types/index';
import { type AdapterStringifyOptions, formatPointList } from './adapter-format.internal';

/** pointsToString 옵션 */
export type PointsStringifyOptions = AdapterStringifyOptions;

/**
 * XYInput 배열을 공백 구분 `"x y x y ..."` grammar 문자열로 변환한다.
 *
 * 출력 형식: `"x y x y ..."` (공백 구분). SVG `points` attribute와 호환되는 grammar다.
 * 빈 배열은 빈 문자열을 반환한다.
 *
 * NaN 또는 Infinity 좌표는 `""` (빈 문자열)로 치환되어 연속 공백이 포함된 문자열이 생성될 수 있다.
 * 입력 데이터의 유효성은 caller가 보장한다.
 *
 * @param points - 직렬화할 좌표 배열 (XYInput: {x,y} 또는 [x,y] 튜플)
 * @param options - 포맷 옵션 (precision 등)
 * @returns `"x y x y ..."` grammar 문자열
 */
export function pointsToString(points: readonly XYInput[], options?: PointsStringifyOptions): string {
  return formatPointList(points, options);
}
