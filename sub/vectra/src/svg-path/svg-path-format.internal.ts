/**
 * SVG path serializer 내부에서 사용하는 number formatting helper.
 *
 * 공개 API가 아니므로 domain barrel을 import하지 않는다.
 */

import type { ArcCommand } from '../types/index';

/** radian → degree 변환 상수. arc xRotation serialization에 사용. */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * precision이 유효한 정수(0 이상)인지 확인한다.
 *
 * @param precision 검사할 값
 * @returns 0 이상의 정수이면 true
 */
function isValidPrecision(precision: number | undefined): precision is number {
  return precision !== undefined && Number.isInteger(precision) && precision >= 0;
}

/**
 * `toFixed` 결과에서 trailing zero와 trailing decimal point를 제거한다.
 *
 * - "1.500" → "1.5"
 * - "2.000" → "2"
 * - "3.0"   → "3"
 *
 * @param s `toFixed()` 호출 결과 문자열
 * @returns trailing zero/decimal point 제거된 문자열
 */
function stripTrailingZeros(s: string): string {
  // 소수점이 없으면 그대로 반환
  if (!s.includes('.')) return s;
  // trailing zero 제거
  let result = s.replace(/0+$/, '');
  // trailing decimal point 제거
  if (result.endsWith('.')) {
    result = result.slice(0, -1);
  }
  return result;
}

/**
 * number를 문자열로 변환한다.
 *
 * - NaN 또는 Infinity이면 `""` (빈 문자열)을 반환한다.
 * - `precision`이 유효한 정수(0 이상)이면 `toFixed(precision)` 후 trailing zero를 제거한다.
 * - 그 외에는 `String(number)` 기반으로 출력한다.
 *
 * @param n 변환할 숫자
 * @param precision 소수점 자릿수 (유효한 정수여야 적용됨)
 * @returns 포맷팅된 문자열
 */
export function formatNumber(n: number, precision: number | undefined): string {
  // NaN 또는 Infinity는 빈 문자열로 처리
  if (!Number.isFinite(n)) return '';

  if (isValidPrecision(precision)) {
    return stripTrailingZeros(n.toFixed(precision));
  }

  return String(n);
}

/**
 * formatter를 주입받아 `ArcCommand`의 endpoint를 제외한 5개 필드(rx, ry, xRotation degree,
 * largeArc flag, sweep flag)를 공백으로 구분된 문자열로 변환한다.
 *
 * `formatArcPrefix`의 위임 대상이며, compact serializer처럼 다른 숫자 포맷 함수가 필요한
 * caller도 사용할 수 있다. `xRotation`은 radian에서 degree로 변환된 뒤 `f`가 적용되며,
 * flag는 항상 `"1"`/`"0"`으로 출력된다.
 *
 * @param cmd 변환할 arc command
 * @param f 숫자 포맷 함수. caller가 주입한다.
 * @returns `"{rx} {ry} {xRotDeg} {largeArcFlag} {sweepFlag}"` 형식 문자열
 */
export function formatArcPrefixWith(cmd: ArcCommand, f: (n: number) => string): string {
  const xRotDeg = cmd.xRotation * RAD_TO_DEG;
  const largeArcFlag = cmd.largeArc ? '1' : '0';
  const sweepFlag = cmd.sweep ? '1' : '0';
  return `${f(cmd.rx)} ${f(cmd.ry)} ${f(xRotDeg)} ${largeArcFlag} ${sweepFlag}`;
}

/**
 * `ArcCommand`의 SVG path data 표현 중 endpoint를 제외한 5개 필드(rx, ry, xRotation degree,
 * largeArc flag, sweep flag)를 공백으로 구분된 문자열로 변환한다.
 *
 * 절대 serializer(`pathDataToString`)와 상대 serializer(`pathDataToRelativeString`)가 공유한다.
 * endpoint(x, y) 좌표는 caller가 absolute/delta로 변환해 직접 출력하며, 이 helper는 endpoint를
 * 다루지 않는다. `xRotation`은 radian에서 degree로 변환된 뒤 precision이 적용되며, flag는 항상
 * `"1"`/`"0"`으로 출력된다.
 *
 * @param cmd 변환할 arc command
 * @param precision `formatNumber`에 전달할 소수점 자릿수
 * @returns `"{rx} {ry} {xRotDeg} {largeArcFlag} {sweepFlag}"` 형식 문자열
 */
export function formatArcPrefix(cmd: ArcCommand, precision: number | undefined): string {
  return formatArcPrefixWith(cmd, (n) => formatNumber(n, precision));
}
