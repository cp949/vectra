import type { MatrixWritable, Point } from '../types/flat-shapes.internal';

/**
 * 세 source 점을 세 target 점으로 보내는 2D affine matrix를 out에 기록하고 성공 여부를 반환한다.
 *
 * `from[i]`를 `to[i]`로 보내는 affine transform은 6 자유도가 6개 식으로 유일하게 결정된다.
 * source 삼각형이 degenerate(세 점이 collinear, 즉 source edge determinant가 정확히 `0`)이면 유일한
 * affine transform이 없으므로 `false`를 반환하고 `out`을 **수정하지 않는다**.
 *
 * 성공 시 `out`에 component를 기록하고 `true`를 반환한다.
 *
 * non-finite 점 좌표는 검증하지 않는다. source determinant가 `0`이 아니면 산술 결과(NaN/Infinity 포함)를
 * 그대로 기록하고 `true`를 반환한다 (caller 책임). degenerate 판정만 exact `=== 0` check이다.
 *
 * `out`과 입력 점은 서로 다른 shape이므로 aliasing 의미가 없다. 그래도 좌표를 모두 local로 먼저 읽은 뒤
 * `out`에 기록한다.
 *
 * @param out affine matrix를 기록할 객체
 * @param from source 점 3개
 * @param to from과 같은 index로 대응하는 target 점 3개
 */
export function fromPointsInto(
  out: MatrixWritable,
  from: readonly [Point, Point, Point],
  to: readonly [Point, Point, Point]
): boolean {
  const f0x = from[0].x;
  const f0y = from[0].y;
  const u1x = from[1].x - f0x;
  const u1y = from[1].y - f0y;
  const u2x = from[2].x - f0x;
  const u2y = from[2].y - f0y;

  const det = u1x * u2y - u2x * u1y;
  if (det === 0) {
    return false;
  }

  const t0x = to[0].x;
  const t0y = to[0].y;
  const v1x = to[1].x - t0x;
  const v1y = to[1].y - t0y;
  const v2x = to[2].x - t0x;
  const v2y = to[2].y - t0y;

  // linear part = [v1 v2] * [u1 u2]^-1
  const a = (v1x * u2y - v2x * u1y) / det;
  const c = (-v1x * u2x + v2x * u1x) / det;
  const b = (v1y * u2y - v2y * u1y) / det;
  const d = (-v1y * u2x + v2y * u1x) / det;

  out.a = a;
  out.b = b;
  out.c = c;
  out.d = d;
  out.tx = t0x - (a * f0x + c * f0y);
  out.ty = t0y - (b * f0x + d * f0y);
  return true;
}
