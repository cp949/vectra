/**
 * SVG points attribute 파싱 공유 kernel.
 * parseSvgPointsInto, parsePointArrayInto, SVG polygon/polyline parser가 재사용한다.
 *
 * SVG spec grammar:
 *   [comma-wsp]? [coordinate-pair] [comma-wsp [coordinate-pair]]*
 *   coordinate-pair: 두 수를 comma-wsp 또는 공백으로 구분
 *   수: 정수, 소수, 음수, 지수 표기 모두 허용 (-3.5e2)
 */

import type { XYObjectWritable } from '../types/index';

/**
 * SVG points attribute 문자열을 파싱하여 out 배열에 기록한다.
 * 호출 전 out.length = 0으로 초기화해야 한다.
 *
 * 파싱 실패 조건:
 * - 홀수 개 숫자 토큰 → Error
 * - NaN으로 파싱되는 토큰(non-numeric token) → Error
 *
 * 빈 문자열 또는 공백만 있는 입력은 빈 배열로 처리한다(정상).
 */
export function parseSvgPointsKernel(out: XYObjectWritable[], input: string): void {
  const tokens = input
    .trim()
    .split(/[\s,]+/)
    .filter((t) => t.length > 0);

  if (tokens.length === 0) return;

  // 홀수 개 토큰은 malformed
  if (tokens.length % 2 !== 0) {
    throw new Error(`SVG points 문자열의 숫자 토큰 개수가 홀수입니다(${tokens.length}개). 쌍으로 이루어져야 합니다.`);
  }

  for (let i = 0; i < tokens.length; i += 2) {
    const x = Number(tokens[i]);
    const y = Number(tokens[i + 1]);

    if (Number.isNaN(x)) {
      throw new Error(`SVG points 파싱 실패: "${tokens[i]}"를 숫자로 변환할 수 없습니다.`);
    }
    if (Number.isNaN(y)) {
      throw new Error(`SVG points 파싱 실패: "${tokens[i + 1]}"를 숫자로 변환할 수 없습니다.`);
    }

    out.push({ x, y });
  }
}
