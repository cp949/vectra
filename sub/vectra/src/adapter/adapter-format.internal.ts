/**
 * adapter domain 공유 숫자 포맷 helper.
 * svg-path domain helper에 의존하지 않는 adapter-local formatter다.
 */

import type { XYInput } from '../types/index';

/**
 * precision이 유효한 정수인지 확인한다.
 * 유효 조건: undefined가 아니고, 정수이며, 0 이상이어야 한다.
 */
function isValidPrecision(precision: number | undefined): precision is number {
  return precision !== undefined && Number.isInteger(precision) && precision >= 0;
}

/**
 * 소수점 표기에서 trailing zero를 제거한다.
 * 소수점이 없으면 원문을 그대로 반환한다.
 * "1.500" → "1.5", "2.000" → "2"
 */
function stripTrailingZeros(s: string): string {
  if (!s.includes('.')) return s;
  let result = s.replace(/0+$/, '');
  if (result.endsWith('.')) result = result.slice(0, -1);
  return result;
}

/**
 * 숫자를 문자열로 변환한다.
 * precision이 유효한 정수이면 toFixed 적용 후 trailing zero를 제거한다.
 * precision 미지정 또는 유효하지 않으면 String(n) 기반 출력을 반환한다.
 * 유한하지 않은 숫자(NaN, Infinity 등)는 빈 문자열을 반환한다.
 */
export function formatNumber(n: number, precision: number | undefined): string {
  if (!Number.isFinite(n)) return '';
  if (isValidPrecision(precision)) return stripTrailingZeros(n.toFixed(precision));
  return String(n);
}

/** 좌표 배열 직렬화 옵션 */
export interface AdapterStringifyOptions {
  /**
   * 소수점 이하 자릿수. 유효한 값: 0 이상의 정수.
   * 미지정 또는 유효하지 않으면 String(n) 기반 formatting을 사용한다.
   */
  precision?: number;
}

/**
 * XYInput 배열을 공백 구분 "x y x y ..." 문자열로 직렬화한다.
 *
 * - 빈 배열은 빈 문자열을 반환한다.
 * - NaN 또는 Infinity 좌표는 `""` (빈 문자열)로 치환되어 연속 공백이 포함된 문자열이 생성될 수 있다.
 *   입력 데이터의 유효성은 caller가 보장한다.
 *
 * pointsToString의 공유 kernel이다.
 */
export function formatPointList(points: readonly XYInput[], options?: AdapterStringifyOptions): string {
  if (points.length === 0) return '';

  const precision = options?.precision;
  const parts: string[] = [];

  for (const pt of points) {
    const x = Array.isArray(pt) ? (pt as readonly [number, number])[0] : (pt as { x: number }).x;
    const y = Array.isArray(pt) ? (pt as readonly [number, number])[1] : (pt as { y: number }).y;
    parts.push(formatNumber(x, precision));
    parts.push(formatNumber(y, precision));
  }

  return parts.join(' ');
}
