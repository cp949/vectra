import type { PathCommand } from '../types/index';
import { parsePathDataInto } from './parse-path-data-into';

/**
 * SVG path data string을 parse해 새 PathCommand 배열로 반환한다. 실패하면 undefined를 반환한다.
 *
 * 대응 `parsePathDataInto`는 atomic이다. 전체 성공한 뒤에만 out을 clear하고 push하며,
 * 실패 시 out을 손대지 않는다.
 *
 *
 * clamp/정규화/fallback 정책은 `parsePathDataInto`와 동일하다.
 * @param data SVG path data string (예: "M 10 20 L 30 40 Z")
 */
export function parsePathData(data: string): PathCommand[] | undefined {
  const out: PathCommand[] = [];
  return parsePathDataInto(out, data) ? out : undefined;
}
