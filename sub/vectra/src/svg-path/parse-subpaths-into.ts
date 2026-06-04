import { splitSubpathsInto } from '../path/split-subpaths-into';
import type { PathCommand } from '../types/index';
import { parsePathDataInto } from './parse-path-data-into';

/**
 * SVG path data string을 parse해 subpath 단위로 분리한 결과를 out에 기록한다.
 *
 * 성공: out.length = 0 후 각 subpath 배열을 push하고 true 반환.
 * 실패: out을 수정하지 않고 false 반환.
 *
 * 내부적으로 parsePathDataInto로 strict parse 후 splitSubpathsInto로 분리한다.
 * subpath 분리는 MoveCommand 기준이며 path.splitSubpathsInto 정책과 동일하다.
 * strict parse 단계에서 Move 없이 시작하는 data는 실패하므로, parse 성공 후에는
 * 항상 MoveCommand로 시작하는 sequence만 splitSubpathsInto에 전달된다.
 *
 * @param out subpath 배열을 기록할 mutable PathCommand[][] 배열. 성공 시 clear 후 push. parse 실패 시 수정하지 않는다.
 * @param data SVG path data string (예: "M 10 20 L 30 40 Z")
 */
export function parseSubpathsInto<Out extends PathCommand[][]>(out: Out, data: string): boolean {
  const tmp: PathCommand[] = [];

  if (!parsePathDataInto(tmp, data)) {
    return false;
  }

  const subpathsOut: PathCommand[][] = [];
  splitSubpathsInto(subpathsOut, tmp);

  out.length = 0;
  for (const subpath of subpathsOut) {
    out.push(subpath as Out[number]);
  }

  return true;
}
