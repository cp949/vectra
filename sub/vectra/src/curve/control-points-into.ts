import type { ControlPointsOptions, CurveControlPointsWritable } from '../types';
import type { Point } from '../types/flat-shapes.internal';

/**
 * point list에서 index가 가리키는 current point의 4-point neighborhood를 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean-primary Into다. points.length === 0이면 false를 반환하고 out을 수정하지 않는다.
 * points.length > 0에서 index가 정수가 아니거나 [0, points.length) 밖이면 RangeError를 던진다.
 * options.closed === true이면 index lookup이 modulo wrapping을 사용한다.
 * open curve(closed 아님)에서는 edge를 clamp한다.
 *  - previous: points[index - 1]가 없으면 current
 *  - current: points[index]
 *  - next: points[index + 1]가 없으면 current
 *  - nextNext: points[index + 2]가 없으면 next
 * 마지막 점에서는 next === current, nextNext === next다. single point는 네 field 모두 같은 점이다.
 * 좌표는 검증 없이 복사하므로 NaN/Infinity/-Infinity/-0는 그대로 pass through한다.
 * out과 input nested point가 같은 object여도 안전하다. 기록 전에 네 좌표쌍을 local로 읽는다.
 *
 * @param out 4-point neighborhood를 기록할 객체. previous/current/next/nextNext field를 가진다.
 * @param points neighborhood를 읽을 point list. 읽기 전용.
 * @param index current point index. 정수이며 [0, points.length) 범위여야 한다.
 * @param options closed 여부. closed면 modulo wrapping, 아니면 open edge clamp.
 * @returns points.length === 0이면 false, 아니면 true
 */
export function controlPointsInto(
  out: CurveControlPointsWritable,
  points: readonly Point[],
  index: number,
  options?: Required<ControlPointsOptions>
): boolean {
  const n = points.length;
  if (n === 0) {
    return false;
  }

  if (!Number.isInteger(index) || index < 0 || index >= n) {
    throw new RangeError(`controlPointsInto: index must be an integer in [0, points.length), got ${index}`);
  }

  const closed = options !== undefined && options.closed === true;

  let previousIndex: number;
  let nextIndex: number;
  let nextNextIndex: number;
  if (closed) {
    previousIndex = (index - 1 + n) % n;
    nextIndex = (index + 1) % n;
    nextNextIndex = (index + 2) % n;
  } else {
    previousIndex = index - 1 >= 0 ? index - 1 : index;
    nextIndex = index + 1 < n ? index + 1 : index;
    nextNextIndex = index + 2 < n ? index + 2 : nextIndex;
  }

  // 기록 전에 네 점 좌표를 모두 읽어 input/output aliasing을 안전하게 만든다.
  const previousX = points[previousIndex].x;
  const previousY = points[previousIndex].y;
  const currentX = points[index].x;
  const currentY = points[index].y;
  const nextX = points[nextIndex].x;
  const nextY = points[nextIndex].y;
  const nextNextX = points[nextNextIndex].x;
  const nextNextY = points[nextNextIndex].y;

  out.previous.x = previousX;
  out.previous.y = previousY;
  out.current.x = currentX;
  out.current.y = currentY;
  out.next.x = nextX;
  out.next.y = nextY;
  out.nextNext.x = nextNextX;
  out.nextNext.y = nextNextY;

  return true;
}
