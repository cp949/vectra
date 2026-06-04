/**
 * constrainDrag — drag 목적지를 constraint 규칙으로 보정한 plain { x, y }를 반환한다.
 */

import type { XYInput } from '../types';
import { constrainDragInto } from './constrain-drag-into';
import type { DragConstraintOptions } from './types';

/**
 * proposed drag 목적지 to를 constraint 규칙으로 보정해 plain { x, y }로 반환한다.
 *
 * allocating companion. options 미지정 시 to의 { x, y }를 그대로 반환한다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `constrainDragInto`와 동일하다.
 * @param from drag 시작 좌표 (axisLock='auto' 시 기준점)
 * @param to proposed drag 목적지 좌표
 * @param options axisLock, containIn, size 옵션
 */
export function constrainDrag(from: XYInput, to: XYInput, options?: DragConstraintOptions): { x: number; y: number } {
  return constrainDragInto({ x: 0, y: 0 }, from, to, options);
}
