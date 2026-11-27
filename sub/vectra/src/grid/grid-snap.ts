import type { GridSpec, Point, PointWritable } from '../types/flat-shapes.internal';
import { gridSnapInto } from './grid-snap-into';

/**
 * world point를 nearest grid point로 snap한 결과를 새 plain `{ x, y }` object로 반환한다.
 *
 * 산식은 `x = originX + round((point.x - originX) / cellWidth) * cellWidth`, y도 동일하다.
 * 정확히 halfway인 점은 `Math.round` 정책을 따른다(0.5는 양의 무한대 방향으로 올림).
 * `cellWidth`와 `cellHeight`가 positive finite number가 아니면(`0`, 음수, `NaN`, `Infinity`,
 * `-Infinity`) `RangeError`다. point 또는 origin 성분이 non-finite이면 `RangeError`다.
 * 계산된 snap coordinate가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param point snap할 world 좌표
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridSnap(point: Point, spec: GridSpec): PointWritable {
  return gridSnapInto({ x: 0, y: 0 }, point, spec);
}
