import type { GridSpecLike, XYInput, XYObjectWritable } from '../types';
import { gridSnapInto } from './grid-snap-into';

/**
 * world point를 nearest grid point로 snap한 결과를 새 plain `{ x, y }` object로 반환한다.
 *
 * 산식은 `x = origin.x + round((point.x - origin.x) / cellSize.x) * cellSize.x`, y도 동일하다.
 * origin은 생략하면 `(0, 0)`이다. 정확히 halfway인 점은 `Math.round` 정책을 따른다(0.5는 양의
 * 무한대 방향으로 올림). `cellSize` 성분이 positive finite number가 아니면(`0`, 음수, `NaN`,
 * `Infinity`, `-Infinity`) `RangeError`다. point 또는 origin 성분이 non-finite이면 `RangeError`다.
 * 계산된 snap coordinate가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param point snap할 world 좌표
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridSnap(point: XYInput, spec: GridSpecLike): XYObjectWritable {
  return gridSnapInto({ x: 0, y: 0 }, point, spec);
}
