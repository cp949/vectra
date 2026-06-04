/**
 * canonical absolute PathCommand[] → compact SVG path data string 직렬화.
 *
 * domain barrel(./index)을 import하지 않는다.
 */

import type { PathCommand, SvgPathStringifyOptions } from '../types/index';
import { formatArcPrefixWith, formatNumber } from './svg-path-format.internal';

/**
 * formatNumber 결과에서 leading zero를 제거한다 (compact 출력용).
 *
 * - "0.5"  → ".5"
 * - "-0.25" → "-.25"
 * - 그 외는 그대로 반환한다.
 *
 * @param s formatNumber 호출 결과 문자열
 * @returns leading zero 제거된 문자열
 */
function stripLeadingZero(s: string): string {
  if (s.startsWith('0.')) return s.slice(1);
  if (s.startsWith('-0.')) return `-${s.slice(2)}`;
  return s;
}

/**
 * PathCommand를 compact SVG path letter와 payload로 변환한다.
 *
 * @param cmd 변환할 PathCommand
 * @param precision formatNumber에 전달할 소수점 자릿수
 * @returns command letter와 숫자 payload
 */
function commandParts(cmd: PathCommand, precision: number | undefined): { letter: string; payload: string } {
  const f = (n: number): string => stripLeadingZero(formatNumber(n, precision));

  switch (cmd.kind) {
    case 'move':
      return { letter: 'M', payload: `${f(cmd.x)} ${f(cmd.y)}` };

    case 'line':
      return { letter: 'L', payload: `${f(cmd.x)} ${f(cmd.y)}` };

    case 'quadratic':
      return { letter: 'Q', payload: `${f(cmd.x1)} ${f(cmd.y1)} ${f(cmd.x)} ${f(cmd.y)}` };

    case 'cubic':
      return { letter: 'C', payload: `${f(cmd.x1)} ${f(cmd.y1)} ${f(cmd.x2)} ${f(cmd.y2)} ${f(cmd.x)} ${f(cmd.y)}` };

    case 'arc':
      return { letter: 'A', payload: `${formatArcPrefixWith(cmd, f)} ${f(cmd.x)} ${f(cmd.y)}` };

    case 'close':
      return { letter: 'Z', payload: '' };
  }
}

/**
 * SVG grammar에서 앞 command와 같은 letter를 생략해도 같은 command 반복으로 해석되는지 반환한다.
 * `M`의 추가 좌표쌍은 implicit `L`이므로 생략 대상이 아니다.
 */
function canOmitRepeatedLetter(letter: string): boolean {
  return letter === 'L' || letter === 'Q' || letter === 'C' || letter === 'A';
}

/**
 * canonical absolute PathCommand[] 배열을 compact SVG path data string으로 직렬화한다.
 *
 * - 출력은 M/L/Q/C/A/Z 절대 command만 포함하며 H/V/S/T는 포함하지 않는다.
 * - command letter 뒤 첫 숫자는 공백 없이 붙인다 (`M10 20`).
 * - 같은 command 내부 숫자 사이는 항상 단일 공백 한 칸으로 분리한다. 음수 부호(`-`)나 소수점(`.`)으로
 *   시작하는 다음 토큰에서도 공백을 생략하지 않는다 (`L1.5 .25`, `L10 -5`).
 * - command 사이 letter는 직전 숫자와 구분되어 공백 없이 직접 붙는다 (`L30 40ZM20 20`).
 * - 같은 `L`/`Q`/`C`/`A` letter가 연속되면 두 번째 command부터 letter를 생략한다.
 *   `M`은 반복 좌표쌍이 implicit `L`로 해석되므로 생략하지 않는다.
 * - `ArcCommand.xRotation`(radian)은 degree로 변환하여 출력한다.
 * - `largeArc/sweep` boolean은 `"1"/"0"`으로 출력한다.
 * - `NaN` 또는 `Infinity` field는 `""` (빈 문자열)로 출력한다. caller가 upstream에서 검증해야 한다.
 * - input `commands`와 command object를 mutate하지 않는다.
 * - 동일 입력은 항상 동일 출력 (결정론).
 *
 * @param commands 직렬화할 PathCommand 배열
 * @param options 포맷팅 옵션 (precision: 소수점 자릿수)
 * @returns compact SVG path data string (빈 배열이면 `""`)
 */
export function pathDataToCompactString(commands: readonly PathCommand[], options?: SvgPathStringifyOptions): string {
  if (commands.length === 0) return '';

  const precision = options?.precision;
  const chunks: string[] = [];
  let previousLetter: string | undefined;

  for (const command of commands) {
    const { letter, payload } = commandParts(command, precision);
    const omitLetter = previousLetter === letter && canOmitRepeatedLetter(letter);

    chunks.push(omitLetter ? ` ${payload}` : `${letter}${payload}`);
    previousLetter = letter;
  }

  return chunks.join('');
}
