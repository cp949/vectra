import type { MatrixWritable, XYInput } from '../types';
import { fromPointsInto } from './from-points-into';

/**
 * 세 source 점을 세 target 점으로 보내는 2D affine matrix를 새 plain object로 반환한다.
 *
 * `from[i]`를 `to[i]`로 보내는 affine transform을 산출한다. source 삼각형이 degenerate(세 점이
 * collinear, source edge determinant가 정확히 `0`)이면 `undefined`를 반환한다.
 * `fromPointsInto`의 allocating companion이다.
 *
 * non-finite 점 좌표는 검증하지 않는다. source determinant가 `0`이 아니면 산술 결과(NaN/Infinity 포함)를
 * 그대로 기록한다 (caller 책임).
 *
 * @param from source 점 3개
 * @param to from과 같은 index로 대응하는 target 점 3개
 */
export function fromPoints(
  from: readonly [XYInput, XYInput, XYInput],
  to: readonly [XYInput, XYInput, XYInput]
): MatrixWritable | undefined {
  const out: MatrixWritable = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
  return fromPointsInto(out, from, to) ? out : undefined;
}
