import {
  capsuleAxisDistanceXY,
  readCapsuleA,
  readCapsuleB,
  readCapsuleRadius,
  validateCapsuleRadius,
} from '../internal/capsule';
import { readX, readY } from '../internal/xy';
import type { CapsuleLike, XYInput } from '../types';

/**
 * point와 capsule closed region 사이 unsigned 최단 거리를 반환한다.
 *
 * `Math.max(0, axisDistance - radius)`다. 내부와 boundary point는 `0`이다. zero-axis
 * capsule(`a === b`)은 center `a`와 radius `r`의 circle distance와 같다. signed distance는
 * `sdf.sdfCapsule` owner다. `radius < 0`와 non-finite radius는 `RangeError`다. endpoint 좌표
 * non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule 거리를 측정할 capsule
 * @param point capsule까지의 거리를 측정할 point
 */
export function distanceToPoint(capsule: CapsuleLike, point: XYInput): number {
  const r = validateCapsuleRadius(readCapsuleRadius(capsule));
  const ax = readX(readCapsuleA(capsule));
  const ay = readY(readCapsuleA(capsule));
  const bx = readX(readCapsuleB(capsule));
  const by = readY(readCapsuleB(capsule));
  const px = readX(point);
  const py = readY(point);
  const axisDistance = capsuleAxisDistanceXY(ax, ay, bx, by, px, py);
  return Math.max(0, axisDistance - r);
}
