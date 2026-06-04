/**
 * constrainDrawingBounds — drawing bounds를 새 plain bounds object로 반환한다.
 */

import type { XYInput } from '../types';
import { constrainDrawingBoundsInto } from './constrain-drawing-bounds-into';
import type { DrawingBoundsOptions } from './types';

/**
 * drag 시작점 origin과 현재 pointer에서 drawing bounds를 산출해 새 plain bounds object로 반환한다.
 *
 * allocating companion. 매 호출 새 nested `{ x, y }` corner를 가진 object를 반환한다.
 * 결과는 항상 normalized bounds(`min.x <= max.x`, `min.y <= max.y`)다.
 * `fromCenter` 기본값 false: origin은 corner, pointer는 opposite corner.
 * `fromCenter` true: origin은 center, pointer는 half-extent 방향을 정한다.
 * `aspectLocked` 기본값 false: true면 size를 `max(abs(dx), abs(dy))`로 맞춰 square로 보정하고
 * pointer 방향 sign을 유지한다. `Math.sign(0) === 0`이므로 해당 축 delta가 0이면 그 축은 origin으로 collapse한다.
 * `shape`는 call-site 의미 태그일 뿐 산식에 영향을 주지 않는다.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 *
 * @param origin drag 시작 좌표. fromCenter=false면 corner, true면 center
 * @param pointer 현재 pointer 좌표. opposite corner 또는 half-extent 방향
 * @param options shape, aspectLocked, fromCenter 옵션
 */
export function constrainDrawingBounds(
  origin: XYInput,
  pointer: XYInput,
  options?: DrawingBoundsOptions
): { min: { x: number; y: number }; max: { x: number; y: number } } {
  return constrainDrawingBoundsInto({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }, origin, pointer, options);
}
