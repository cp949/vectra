import {
  capsuleAxisDistanceSqXY,
  readCapsuleA,
  readCapsuleB,
  readCapsuleRadius,
  validateCapsuleRadius,
} from '../internal/capsule';
import { readX, readY } from '../internal/xy';
import type { CapsuleLike, XYInput } from '../types';

/**
 * point가 capsule closed region 안이나 boundary 위에 있으면 true를 반환한다.
 *
 * `intersects` owner가 제공하는 capsule × point relation이다. point에서 axis segment까지의
 * 거리가 radius 이하이면 true다. closed boundary 포함이라 `거리 === radius`이면 true다.
 * zero-axis capsule(`a === b`)은 center `a`, radius `r`의 circle region으로 판정한다.
 * `radius === 0`이면 point가 axis segment 위에 있을 때만 true다. `radius < 0`와 non-finite
 * radius는 `RangeError`다. endpoint/point 좌표 non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule point와의 교차를 판정할 capsule
 * @param point capsule과 교차하는지 판정할 point
 */
export function intersectsCapsulePoint(capsule: CapsuleLike, point: XYInput): boolean {
  const r = validateCapsuleRadius(readCapsuleRadius(capsule));
  const ax = readX(readCapsuleA(capsule));
  const ay = readY(readCapsuleA(capsule));
  const bx = readX(readCapsuleB(capsule));
  const by = readY(readCapsuleB(capsule));
  const px = readX(point);
  const py = readY(point);
  // squared 비교로 sqrt 호출을 피한다. closed boundary 포함
  return capsuleAxisDistanceSqXY(ax, ay, bx, by, px, py) <= r * r;
}
