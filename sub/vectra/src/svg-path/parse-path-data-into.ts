import type { PathCommand } from '../types/index';
import { parseTokens, tokenize } from './svg-path-parser.internal';

/**
 * SVG path data string을 canonical absolute PathCommand[]로 parse한다.
 *
 * 성공: out.length = 0 후 absolute command를 순서대로 push하고 true 반환.
 * 실패: out을 수정하지 않고 false 반환.
 *
 * boolean primary Into 예외 패턴을 따른다 (ADR 0006).
 * 성공/실패 여부가 주 반환값이므로 generic Out을 반환하지 않고 boolean을 반환한다.
 *
 * @param out parse 결과를 기록할 PathCommand 배열. 성공 시 clear 후 push. data 문자열의 내용과 reference를 공유하지 않는다.
 * @param data SVG path data string (예: "M 10 20 L 30 40 Z")
 */
export function parsePathDataInto<Out extends PathCommand[]>(out: Out, data: string): boolean {
  const tokens = tokenize(data);
  const commands = parseTokens(tokens);

  if (commands === null) {
    return false;
  }

  // atomic 동작: 전체 성공 후에만 out을 수정한다
  out.length = 0;
  for (const cmd of commands) {
    out.push(cmd);
  }

  return true;
}
