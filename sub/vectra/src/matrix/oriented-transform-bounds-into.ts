import type { Bounds, Matrix } from '../types/flat-shapes.internal';
import type { OrientedBoundsWritable } from '../types';

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
 * @param out oriented outline corner를 기록할 객체
 * @param matrix bounds corner에 적용할 matrix
 * @param bounds 변환할 bounds
 */
export function orientedTransformBoundsInto<Out extends OrientedBoundsWritable>(
  out: Out,
  matrix: Matrix,
  bounds: Bounds
): Out {
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  // aliasing 안전: bounds 좌표를 모두 local로 먼저 읽는다
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  // empty sentinel: finite inverted bounds는 min corner, canonical sentinel은 origin으로 축퇴한다
  if (maxX < minX || maxY < minY) {
    const useOrigin = !Number.isFinite(minX) || !Number.isFinite(minY);
    const emptyX = useOrigin ? 0 : minX;
    const emptyY = useOrigin ? 0 : minY;
    const px = a * emptyX + c * emptyY + tx;
    const py = b * emptyX + d * emptyY + ty;
    out.topLeft.x = px;
    out.topLeft.y = py;
    out.topRight.x = px;
    out.topRight.y = py;
    out.bottomRight.x = px;
    out.bottomRight.y = py;
    out.bottomLeft.x = px;
    out.bottomLeft.y = py;
    return out;
  }

  out.topLeft.x = a * minX + c * minY + tx;
  out.topLeft.y = b * minX + d * minY + ty;
  out.topRight.x = a * maxX + c * minY + tx;
  out.topRight.y = b * maxX + d * minY + ty;
  out.bottomRight.x = a * maxX + c * maxY + tx;
  out.bottomRight.y = b * maxX + d * maxY + ty;
  out.bottomLeft.x = a * minX + c * maxY + tx;
  out.bottomLeft.y = b * minX + d * maxY + ty;
  return out;
}
