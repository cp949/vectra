/**
 * constrainDragInto — drag 목적지를 constraint 규칙으로 보정해 out에 기록한다.
 */

import type { Point, PointWritable } from '../types/flat-shapes.internal';
import type { DragConstraintOptions } from './types';

/**
 * proposed drag 목적지 to를 constraint 규칙으로 보정해 out에 기록하고 out을 반환한다.
 *
 * `out === to` aliasing은 안전하다. to의 x/y를 모두 읽은 뒤 기록하므로
 * 중간 상태 오염이 발생하지 않는다.
 *
 * options 미지정 시 to를 그대로 기록한다.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 *
 * @param out 결과 좌표를 기록할 출력 { x, y }
 * @param from drag 시작 좌표 (axisLock='auto' 시 기준점)
 * @param to proposed drag 목적지 좌표
 * @param options axisLock, containIn, size 옵션
 */
export function constrainDragInto<Out extends PointWritable>(
  out: Out,
  from: Point,
  to: Point,
  options?: DragConstraintOptions
): Out {
  const fromX = from.x;
  const fromY = from.y;
  let toX = to.x;
  let toY = to.y;

  // --- axisLock 적용 ---
  const axisLock = options?.axisLock;
  if (axisLock === 'horizontal') {
    toY = fromY;
  } else if (axisLock === 'vertical') {
    toX = fromX;
  } else if (axisLock === 'auto') {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    // dx===dy===0이면 to를 그대로 유지
    if (dx !== 0 || dy !== 0) {
      if (dx > dy) {
        // 수평 이동 우세 → y 고정
        toY = fromY;
      } else {
        // 수직 이동 우세(dy >= dx) → x 고정
        toX = fromX;
      }
    }
  }

  // --- containIn 클램프 적용 ---
  const containIn = options?.containIn;
  if (containIn != null) {
    const { minX, minY, maxX, maxY } = containIn;

    const size = options?.size;
    const w = size != null ? size.width : 0;
    const h = size != null ? size.height : 0;

    // min 클램프: size 무관
    if (toX < minX) toX = minX;
    if (toY < minY) toY = minY;

    // max 클램프: size를 고려하면 to.x + w <= maxX → to.x <= maxX - w
    // w > (maxX - minX)이면 maxX - w < minX가 되어 min/max 충돌이 발생한다.
    // Math.max(minX, ...)로 floor를 잡아 결과가 항상 [minX, maxX] 안에 머물게 한다.
    const maxClampX = Math.max(minX, maxX - w);
    const maxClampY = Math.max(minY, maxY - h);
    if (toX > maxClampX) toX = maxClampX;
    if (toY > maxClampY) toY = maxClampY;
  }

  out.x = toX;
  out.y = toY;
  return out;
}
