import { capsuleAxisDistanceXY, readCapsuleA, readCapsuleB, readCapsuleRadius } from '../internal/capsule';
import type { CapsuleLike, XYInput } from '../types';
import { requireFiniteX, requireFiniteY, requireNonNegative } from './primitive.internal';

/**
 * capsule과 point 사이의 signed distance를 반환한다.
 *
 * `axisDistance - radius`다. interior는 음수, side/cap boundary는 0, exterior는 양수다.
 * zero-axis capsule(`a === b`)은 같은 center/radius circle과 같은 값을 반환한다.
 *
 * 모든 좌표와 radius는 finite여야 한다. non-finite capsule endpoint/point 좌표, `radius < 0`,
 * non-finite radius는 `RangeError`다.
 *
 * @param capsule signed distance를 측정할 capsule
 * @param point capsule까지의 signed distance를 측정할 point
 */
export function sdfCapsule(capsule: CapsuleLike, point: XYInput): number {
  const a = readCapsuleA(capsule);
  const b = readCapsuleB(capsule);
  const ax = requireFiniteX(a, 'capsule a');
  const ay = requireFiniteY(a, 'capsule a');
  const bx = requireFiniteX(b, 'capsule b');
  const by = requireFiniteY(b, 'capsule b');
  const radius = requireNonNegative(readCapsuleRadius(capsule), 'capsule radius');
  const px = requireFiniteX(point, 'point');
  const py = requireFiniteY(point, 'point');

  return capsuleAxisDistanceXY(ax, ay, bx, by, px, py) - radius;
}
