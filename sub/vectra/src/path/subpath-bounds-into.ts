import type { BoundsWritable, PathCommand, PathMeasurementOptions, XYWritable } from '../types/index';
import { boundsInto } from './bounds-into';
import { splitSubpathsInto } from './split-subpaths-into';

/**
 * commands의 `index`번째 subpath bounding box를 out에 기록하고 out을 반환한다.
 *
 * 내부적으로 `splitSubpathsInto`로 subpath를 분리한 뒤 해당 subpath에 `boundsInto`와
 * 동일한 알고리즘을 적용한다.
 *
 * 다음 경우 모두 sentinel bounds `{ min:(Infinity,Infinity), max:(-Infinity,-Infinity) }`를
 * `out`에 기록한 뒤 `out`을 반환한다.
 *
 * - empty path
 * - `index < 0`
 * - `index >= subpathCount`
 * - non-integer / NaN / Infinity index
 * - drawing segment(line/quadratic/cubic/arc/close)가 하나도 없는 subpath
 *
 * caller 책임: sentinel(`min.x === Infinity` 그리고 `max.x === -Infinity` 동시 성립)과
 * input-derived non-finite 결과(input 자체에 `Infinity` 좌표가 포함된 경우)의 구분은
 * caller가 검사한다.
 *
 * non-finite numeric 입력은 validation 없이 그대로 흘러 NaN/Infinity bound가 될 수 있다.
 *
 * @param out bounds를 기록할 writable output
 * @param commands subpath를 읽을 path command sequence
 * @param index bounds를 계산할 subpath의 0-based index
 * @param options adaptive subdivision option (exact bounds 사용이므로 미활용)
 */
export function subpathBoundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(
  out: Out,
  commands: readonly PathCommand[],
  index: number,
  options?: PathMeasurementOptions
): Out {
  if (!Number.isInteger(index) || index < 0) {
    return boundsInto(out, [], options);
  }

  const subpaths: PathCommand[][] = [];
  splitSubpathsInto(subpaths, commands);

  if (index >= subpaths.length) {
    return boundsInto(out, [], options);
  }

  return boundsInto(out, subpaths[index], options);
}
