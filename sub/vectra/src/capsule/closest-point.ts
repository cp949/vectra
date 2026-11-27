import type { Capsule, Point, PointWritable } from '../types/flat-shapes.internal';
import { closestPointInto } from './closest-point-into';

/**
 * capsule closed region에서 point에 가장 가까운 점을 새 object로 반환한다.
 *
 * point가 capsule 내부나 boundary 위에 있으면 input point 좌표 자체를 반환한다. 외부 point는
 * axis segment 위 closest point에서 point 방향으로 radius만큼 나간 boundary point를 반환한다.
 * zero-axis capsule(두 끝점 좌표가 같음)은 시작점 `(x1, y1)`와 radius `r`의 circle region closest point와 같다.
 * `r < 0`와 non-finite radius는 `RangeError`다. endpoint 좌표 non-finite는 별도 검증하지
 * 않고 산술 결과를 따른다.
 *
 * @param capsule closest point를 계산할 capsule
 * @param point capsule region에 투영할 point
 */
export function closestPoint(capsule: Capsule, point: Point): PointWritable {
  return closestPointInto({ x: 0, y: 0 }, capsule, point);
}
