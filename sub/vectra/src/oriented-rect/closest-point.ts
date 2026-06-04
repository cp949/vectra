import type { OrientedRectLike, XYInput, XYObjectWritable } from '../types';
import { closestPointInto } from './closest-point-into';

/**
 * oriented rect 내부 또는 boundary에서 point와 가장 가까운 점을 새 plain object로 반환한다.
 *
 * point를 rect local-space로 변환한 뒤 local 좌표를 `[-width/2, width/2]`, `[-height/2, height/2]`에
 * clamp하고 다시 world-space로 되돌린 `{ x, y }`를 반환한다. 내부 또는 boundary point는 input
 * point 좌표를 그대로 반환한다.
 *
 * `size.x <= 0 || size.y <= 0`인 empty oriented rect는 undefined를 반환한다. size 두 성분이나
 * angle이 non-finite이면 `RangeError`다. center 또는 point 좌표 non-finite는 검증하지 않고 산술
 * 결과를 그대로 반환한다(`NaN`/무한대 가능). finite 입력 보장은 호출자 책임이다. 매 호출마다 새
 * `{ x, y }` object를 생성하므로 input과 alias되지 않은 결과를 받는다.
 *
 * @param rect closest point를 탐색할 oriented rect
 * @param point closest point를 탐색할 기준 point
 */
export function closestPoint(rect: OrientedRectLike, point: XYInput): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return closestPointInto(out, rect, point) ? out : undefined;
}
