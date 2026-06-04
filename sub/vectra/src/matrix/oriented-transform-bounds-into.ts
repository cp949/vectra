import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, MatrixLike, OrientedBoundsWritable, XYWritable } from '../types';

/**
 * bounds의 네 corner를 matrix로 변환한 oriented outline을 out에 기록하고 out을 반환한다.
 *
 * `transformBoundsInto`와 달리 AABB로 감싸지 않고 변환된 네 corner 좌표를 그대로 기록한다. 회전 변환이
 * 있으면 corner가 회전된 평행사변형을 이룬다. corner 순서:
 * `topLeft`(minX, minY) → `topRight`(maxX, minY) → `bottomRight`(maxX, maxY) → `bottomLeft`(minX, maxY).
 *
 * empty sentinel bounds(`maxX < minX || maxY < minY`)는 네 corner를 한 점으로 축퇴 기록한다. finite
 * inverted bounds는 `min` corner를 변환하고, canonical/non-finite empty sentinel은 origin을 변환한다.
 * AABB sentinel(`Infinity`/`-Infinity`)을 oriented corner로 옮기지 않는다 — oriented output은 outline
 * 표현이므로 빈 bounds를 한 점으로 축퇴한 outline으로 본다.
 *
 * non-finite matrix/bounds component는 검증하지 않고 산술 결과를 그대로 기록한다 (caller 책임). nested
 * corner storage가 input bounds와 같은 object여도 안전하다(좌표를 모두 먼저 읽은 뒤 기록한다).
 *
 * @param out oriented outline corner를 기록할 writable output
 * @param matrix bounds corner에 적용할 matrix
 * @param bounds 변환할 bounds
 */
export function orientedTransformBoundsInto<Out extends OrientedBoundsWritable<XYWritable>>(
  out: Out,
  matrix: MatrixLike,
  bounds: BoundsLike
): Out {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  // aliasing 안전: bounds 좌표를 모두 local로 먼저 읽는다
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));

  // empty sentinel: finite inverted bounds는 min corner, canonical sentinel은 origin으로 축퇴한다
  if (maxX < minX || maxY < minY) {
    const useOrigin = !Number.isFinite(minX) || !Number.isFinite(minY);
    const emptyX = useOrigin ? 0 : minX;
    const emptyY = useOrigin ? 0 : minY;
    const px = a * emptyX + c * emptyY + tx;
    const py = b * emptyX + d * emptyY + ty;
    writeXY(out.topLeft, px, py);
    writeXY(out.topRight, px, py);
    writeXY(out.bottomRight, px, py);
    writeXY(out.bottomLeft, px, py);
    return out;
  }

  writeXY(out.topLeft, a * minX + c * minY + tx, b * minX + d * minY + ty);
  writeXY(out.topRight, a * maxX + c * minY + tx, b * maxX + d * minY + ty);
  writeXY(out.bottomRight, a * maxX + c * maxY + tx, b * maxX + d * maxY + ty);
  writeXY(out.bottomLeft, a * minX + c * maxY + tx, b * minX + d * maxY + ty);
  return out;
}
