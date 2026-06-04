/**
 * canonical PathCommand[] → absolute SVG path data string 직렬화.
 *
 * domain barrel(./index)을 import하지 않는다.
 */

import type { PathCommand, SvgPathStringifyOptions } from '../types/index';
import { formatArcPrefix, formatNumber } from './svg-path-format.internal';

/**
 * 단일 PathCommand를 SVG path segment 문자열로 변환한다.
 *
 * @param cmd 변환할 PathCommand
 * @param precision formatNumber에 전달할 소수점 자릿수
 * @returns command 문자열 (예: "M 10 20", "Z")
 */
function serializeCommand(cmd: PathCommand, precision: number | undefined): string {
  const f = (n: number): string => formatNumber(n, precision);

  switch (cmd.kind) {
    case 'move':
      return `M ${f(cmd.x)} ${f(cmd.y)}`;

    case 'line':
      return `L ${f(cmd.x)} ${f(cmd.y)}`;

    case 'quadratic':
      return `Q ${f(cmd.x1)} ${f(cmd.y1)} ${f(cmd.x)} ${f(cmd.y)}`;

    case 'cubic':
      return `C ${f(cmd.x1)} ${f(cmd.y1)} ${f(cmd.x2)} ${f(cmd.y2)} ${f(cmd.x)} ${f(cmd.y)}`;

    case 'arc':
      return `A ${formatArcPrefix(cmd, precision)} ${f(cmd.x)} ${f(cmd.y)}`;

    case 'close':
      return 'Z';
  }
}

/**
 * canonical absolute PathCommand[] 배열을 SVG path data string으로 직렬화한다.
 *
 * - 출력은 M/L/Q/C/A/Z 절대 command만 포함하며 H/V/S/T는 포함하지 않는다.
 * - ArcCommand.xRotation(radian)은 degree로 변환하여 출력한다.
 * - largeArc/sweep boolean은 "1"/"0"으로 출력한다.
 * - NaN 또는 Infinity field는 빈 문자열로 출력한다.
 * - command 사이는 single space로 구분한다.
 *
 * @param commands 직렬화할 PathCommand 배열
 * @param options 포맷팅 옵션 (precision: 소수점 자릿수)
 * @returns SVG path data string (빈 배열이면 "")
 */
export function pathDataToString(commands: readonly PathCommand[], options?: SvgPathStringifyOptions): string {
  if (commands.length === 0) return '';

  const precision = options?.precision;

  return commands.map((cmd) => serializeCommand(cmd, precision)).join(' ');
}
