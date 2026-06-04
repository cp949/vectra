import { readX, readY } from '../internal/xy';
import type { MatrixDecompositionWritable, MatrixWritable, XYWritable } from '../types';

/**
 * decomposition component를 합성한 matrix를 out에 기록하고 out을 반환한다. `decomposeInto`의 역연산이다.
 *
 * 합성식: `M = T(translation) · R(rotation) · S(scaling) · K(skewing.x)`. 단일 skewX
 * convention에서 `K = [[1, tan(skewing.x)], [0, 1]]`이다. 전개하면 다음과 같다.
 *
 * ```txt
 * cos = cos(rotation), sin = sin(rotation), kx = tan(skewing.x)
 * a = cos · scaling.x
 * b = sin · scaling.x
 * c = cos · scaling.x · kx − sin · scaling.y
 * d = sin · scaling.x · kx + cos · scaling.y
 * tx = translation.x
 * ty = translation.y
 * ```
 *
 * 단일 skewX convention이라 `skewing.y`는 합성식에 사용하지 않는다. caller는 `skewing.y`를 `0`으로
 * 둔다(`decomposeInto`도 항상 `0`을 기록한다). `0`이 아니어도 검증/사용 없이 무시한다.
 *
 * non-finite component는 검증하지 않는다. `Math.cos`/`Math.sin`/`Math.tan`과 JS 산술 결과를 그대로
 * 기록한다 (caller 책임).
 *
 * `out`이 `decomposition.translation`/`scaling`/`skewing` 중 하나와 같은 object인 비정상 aliasing이어도
 * 모든 component를 local 변수로 먼저 읽으므로(read-before-write) 안전하다.
 *
 * @param out 합성 결과를 기록할 writable output
 * @param decomposition 합성할 translation/rotation/scaling/skewing component
 */
export function matrixComposeInto<Out extends MatrixWritable>(
  out: Out,
  decomposition: MatrixDecompositionWritable<XYWritable, XYWritable, XYWritable>
): Out {
  const tx = readX(decomposition.translation);
  const ty = readY(decomposition.translation);
  const r = decomposition.rotation;
  const sx = readX(decomposition.scaling);
  const sy = readY(decomposition.scaling);
  const kx = Math.tan(readX(decomposition.skewing));

  const cos = Math.cos(r);
  const sin = Math.sin(r);

  out.a = cos * sx;
  out.b = sin * sx;
  out.c = cos * sx * kx - sin * sy;
  out.d = sin * sx * kx + cos * sy;
  out.tx = tx;
  out.ty = ty;
  return out;
}
