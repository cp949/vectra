import type { Matrix, Rect } from '../types/flat-shapes.internal';
import type { OrientedBoundsWritable } from '../types';

/**
 * rect의 네 corner를 matrix로 변환한 oriented outline을 out에 기록하고 out을 반환한다.
 *
 * `transformRectInto`와 달리 AABB로 감싸지 않고 변환된 네 corner 좌표를 그대로 기록한다. 회전 변환이
 * 있으면 corner가 회전된 평행사변형을 이룬다. corner 순서는 `rect.cornersInto`와 같다:
 * `topLeft`(x, y) → `topRight`(x+width, y) → `bottomRight`(x+width, y+height) → `bottomLeft`(x, y+height).
 *
 * empty/degenerate rect(`width <= 0 || height <= 0`)도 특별 처리 없이 네 corner를 변환한다. corner가
 * 겹치거나 한 점으로 축퇴할 수 있다. non-finite matrix/rect component는 검증하지 않고 산술 결과를 그대로
 * 기록한다 (caller 책임).
 *
 * nested corner storage가 input rect와 같은 object여도 안전하다(좌표를 모두 먼저 읽은 뒤 기록한다).
 *
 * @param out oriented outline corner를 기록할 객체
 * @param matrix rect corner에 적용할 matrix
 * @param rect 변환할 rect
 */
export function orientedTransformRectInto<Out extends OrientedBoundsWritable>(
  out: Out,
  matrix: Matrix,
  rect: Rect
): Out {
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  // aliasing 안전: rect 좌표를 모두 local로 먼저 읽는다
  const x = rect.x;
  const y = rect.y;
  const x2 = x + rect.width;
  const y2 = y + rect.height;

  out.topLeft.x = a * x + c * y + tx;
  out.topLeft.y = b * x + d * y + ty;
  out.topRight.x = a * x2 + c * y + tx;
  out.topRight.y = b * x2 + d * y + ty;
  out.bottomRight.x = a * x2 + c * y2 + tx;
  out.bottomRight.y = b * x2 + d * y2 + ty;
  out.bottomLeft.x = a * x + c * y2 + tx;
  out.bottomLeft.y = b * x + d * y2 + ty;
  return out;
}
