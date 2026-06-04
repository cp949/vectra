import type { XYInput, XYObjectWritable } from '../types';
import { snapToGridInto } from './snap-to-grid-into';

/**
 * snapToGridInto의 allocating companion.
 * input의 각 성분을 grid vector 단위로 가장 가까운 배수에 맞춘 새 object를 반환한다.
 *
 * origin 0 기준으로 `x`, `y`를 독립 처리한다. 성분별 `Math.round(v / g) * g`이며, 동률은
 * Math.round 정책을 따른다(0.5는 양의 무한대 방향으로 올림).
 *
 * grid size 0, negative, non-finite(NaN, Infinity, -Infinity) 입력은 검증하지 않고 JS 산술 결과를
 * 그대로 반환한다. grid 성분이 0이면 해당 성분은 NaN이 된다. 결과 `-0`은 canonicalize하지 않는다.
 *
 * @param input snap할 입력 point
 * @param grid 성분별 grid 간격 vector
 */
export function snapToGrid(input: XYInput, grid: XYInput): XYObjectWritable {
  return snapToGridInto({ x: 0, y: 0 }, input, grid);
}
