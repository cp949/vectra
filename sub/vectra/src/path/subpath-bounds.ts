import type { BoundsWritable, PathCommand, PathMeasurementOptions } from '../types/index';
import { subpathBoundsInto } from './subpath-bounds-into';

/**
 * commands의 `index`번째 subpath bounding box를 새 plain bounds object로 반환한다.
 *
 * `subpathBoundsInto`의 allocating companion이다.
 *
 * 다음 경우 모두 sentinel bounds `{ min:(Infinity,Infinity), max:(-Infinity,-Infinity) }`를
 * 반환한다.
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
 * @param commands subpath를 읽을 path command sequence
 * @param index bounds를 계산할 subpath의 0-based index
 * @param options adaptive subdivision option (exact bounds 사용이므로 미활용)
 */
export function subpathBounds(
  commands: readonly PathCommand[],
  index: number,
  options?: PathMeasurementOptions
): BoundsWritable {
  return subpathBoundsInto({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }, commands, index, options);
}
