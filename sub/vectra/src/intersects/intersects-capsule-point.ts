import { capsuleAxisDistanceSqXY, validateCapsuleRadius } from '../internal/capsule';
import type { Capsule, Point } from '../types/flat-shapes.internal';

/**
 * point가 capsule closed region 안이나 boundary 위에 있으면 true를 반환한다.
 *
 * `intersects` owner가 제공하는 capsule × point relation이다. point에서 axis segment까지의
 * 거리가 radius 이하이면 true다. closed boundary 포함이라 `거리 === radius`이면 true다.
 * zero-axis capsule(`x1 === x2 && y1 === y2`)은 중심 (x1, y1), radius `r`의 circle region으로 판정한다.
 * `r === 0`이면 point가 axis segment 위에 있을 때만 true다. `r < 0`와 non-finite
 * radius는 `RangeError`다. endpoint/point 좌표 non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule point와의 교차를 판정할 capsule
 * @param point capsule과 교차하는지 판정할 point
 */
export function intersectsCapsulePoint(capsule: Capsule, point: Point): boolean {
  const r = validateCapsuleRadius(capsule.r);
  const ax = capsule.x1;
  const ay = capsule.y1;
  const bx = capsule.x2;
  const by = capsule.y2;
  const px = point.x;
  const py = point.y;
  // squared 비교로 sqrt 호출을 피한다. closed boundary 포함
  return capsuleAxisDistanceSqXY(ax, ay, bx, by, px, py) <= r * r;
}
