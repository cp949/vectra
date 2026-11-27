import { capsuleAxisDistanceXY, validateCapsuleRadius } from '../internal/capsule';
import type { Capsule, Point } from '../types/flat-shapes.internal';

/**
 * point가 capsule closed region 내부나 boundary 위에 있으면 true를 반환한다.
 *
 * point에서 axis segment까지의 거리가 radius 이하이면 포함이다. 포함 판정은 closed boundary
 * 기준이라 `거리 === radius`이면 true다. zero-axis capsule(두 끝점 좌표가 같음)은 시작점 `(x1, y1)`와 radius
 * `r`의 circle containment와 같다. `r < 0`와 non-finite radius는 `RangeError`다. endpoint
 * 좌표 non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule point 포함 여부를 판정할 capsule
 * @param point capsule 안에 포함되는지 확인할 point
 */
export function containsPoint(capsule: Capsule, point: Point): boolean {
  const r = validateCapsuleRadius(capsule.r);
  const { x1, y1, x2, y2 } = capsule;
  const px = point.x;
  const py = point.y;
  return capsuleAxisDistanceXY(x1, y1, x2, y2, px, py) <= r;
}
