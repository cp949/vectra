import type { PathCommand } from '../types/index';
import { parsePathDataLooseInto } from './parse-path-data-loose-into';

/**
 * SVG path data string을 loose mode로 parse해 새 PathCommand 배열로 반환한다.
 *
 * loose 모드는 unknown command letter 등 복구 불가 오류를 만나면 그 지점까지의 결과를
 * 반환한다 (partial success). 항상 정의된 배열을 반환하며 undefined를 반환하지 않는다.
 *
 * 대응 `parsePathDataLooseInto`는 out을 clear하지 않고 push만 추가한다. caller가 빈 배열을
 * 전달한다고 가정한다.
 *
 *
 * clamp/정규화/fallback 정책은 `parsePathDataLooseInto`와 동일하다.
 * @param data SVG path data string (예: "M 10 20 L 30 40 Z")
 */
export function parsePathDataLoose(data: string): PathCommand[] {
  const out: PathCommand[] = [];
  parsePathDataLooseInto(out, data);
  return out;
}
