/**
 * resizeHandlesInto — bounds의 8개 resize handle 좌표를 out 배열에 기록한다.
 */

import { writeXY } from '../internal/xy';
import type { BoundsLike, XYWritable } from '../types';
import { RESIZE_HANDLE_ORDER, readBoundsCoords, resizeHandleX, resizeHandleY } from './handle-position.internal';
import type { HandlePoint } from './types';

/**
 * bounds의 8개 resize handle 좌표를 out 배열에 기록한다.
 *
 * ordering: 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w' (clockwise from top-left).
 * 호출 시 항상 `out.length = 0`으로 초기화한 뒤 push한다.
 * unrotated AABB 기준 좌표만 산출한다. rotation 합성은 caller 책임.
 * width/height = 0인 degenerate bounds에서도 8개를 기록한다(좌표는 동일점).
 * NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 기록한다.
 *
 * @param out handle 좌표를 push할 caller-provided writable 배열
 * @param bounds 대상 unrotated AABB
 * @param factory caller가 공급하는 Point 인스턴스 생성 함수
 * @returns 기록된 handle 수 (항상 8)
 */
export function resizeHandlesInto<Point extends XYWritable>(
  out: HandlePoint<Point>[],
  bounds: BoundsLike,
  factory: () => Point
): number {
  out.length = 0;

  const { minX, minY, maxX, maxY, midX, midY } = readBoundsCoords(bounds);

  for (const id of RESIZE_HANDLE_ORDER) {
    const point = factory();
    writeXY(point, resizeHandleX(id, minX, maxX, midX), resizeHandleY(id, minY, maxY, midY));
    out.push({ id, point });
  }

  return out.length;
}
