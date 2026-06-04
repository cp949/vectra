import type { PathCommand } from '../types/index';
import { parseTokensLoose, tokenize } from './svg-path-parser.internal';

/**
 * SVG path data string을 canonical absolute PathCommand[]로 parse한다.
 *
 * strict의 `parsePathDataInto`와 달리, 오류 발생 시 전체 실패 대신 해당 지점까지
 * 성공한 command를 `out`에 push하고 `true`를 반환한다 (partial success).
 *
 * - unknown command letter 등 복구 불가 오류 → 해당 지점까지의 결과 push 후 true.
 * - 0개 command 파싱 결과도 true (out.length=0).
 * - 호출 시 `out`을 clear하지 않는다. 호출자가 비워서 전달한다고 가정한다.
 *
 * boolean primary Into 예외 패턴을 따른다 (ADR 0006).
 * loose 모드는 항상 true를 반환한다.
 *
 * @param out parse 결과를 기록할 PathCommand 배열. 기존 내용을 clear하지 않고 push만 한다.
 * @param data SVG path data string (예: "M 10 20 L 30 40 Z")
 */
export function parsePathDataLooseInto<Out extends PathCommand[]>(out: Out, data: string): boolean {
  const tokens = tokenize(data);
  const commands = parseTokensLoose(tokens);

  for (const cmd of commands) {
    out.push(cmd);
  }

  return true;
}
