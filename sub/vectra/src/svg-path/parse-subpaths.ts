import type { PathCommand } from '../types/index';
import { parseSubpathsInto } from './parse-subpaths-into';

/**
 * SVG path data string을 parse해 subpath 단위로 분리한 새 PathCommand[][] 배열을 반환한다.
 * parse 실패 시 undefined를 반환한다.
 *
 * 대응 `parseSubpathsInto`는 atomic이다. 전체 성공한 뒤에만 out을 clear하고 push하며,
 * 실패 시 out을 손대지 않는다.
 *
 * @param data SVG path data string (예: "M 10 20 L 30 40 Z M 50 60 L 70 80")
 */
export function parseSubpaths(data: string): PathCommand[][] | undefined {
  const out: PathCommand[][] = [];
  return parseSubpathsInto(out, data) ? out : undefined;
}
