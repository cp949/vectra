import { readCapsuleA, readCapsuleB, readCapsuleRadius, validateCapsuleRadius } from '../internal/capsule';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, CapsuleLike, XYWritable } from '../types';

/**
 * capsule closed region을 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * bounds는 두 endpoint extent를 radius만큼 확장한 사각형이다. zero-axis capsule(`a === b`)도
 * center `a`와 radius `r`의 circle region AABB를 기록한다. `radius < 0`와 non-finite radius는
 * `RangeError`다. endpoint 좌표 non-finite는 별도 검증하지 않고 산술 결과를 따른다. endpoint
 * 좌표와 radius를 먼저 읽으므로 input과 out이 같은 object여도 안전하다.
 *
 * @param out bounds를 기록할 writable output
 * @param capsule bounds로 변환할 capsule
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, capsule: CapsuleLike): Out {
  const r = validateCapsuleRadius(readCapsuleRadius(capsule));
  const ax = readX(readCapsuleA(capsule));
  const ay = readY(readCapsuleA(capsule));
  const bx = readX(readCapsuleB(capsule));
  const by = readY(readCapsuleB(capsule));

  writeXY(out.min, Math.min(ax, bx) - r, Math.min(ay, by) - r);
  writeXY(out.max, Math.max(ax, bx) + r, Math.max(ay, by) + r);
  return out;
}
