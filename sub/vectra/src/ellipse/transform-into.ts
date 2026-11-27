import type { Ellipse, EllipseWritable, Matrix } from '../types/flat-shapes.internal';

/**
 * axis-aligned ellipse로 정확히 표현 가능한 matrix만 적용해 out에 기록하고 out을 반환한다.
 *
 * 지원 matrix는 두 가지뿐이다:
 * - translate + axis-aligned scale: `b === 0 && c === 0`. `rx *= a`, `ry *= d`.
 * - 90도 축 swap / reflection: `a === 0 && d === 0`. `결과 rx = 입력 ry * c`, `결과 ry = 입력 rx * b`.
 *
 * 위 두 형태가 아니면 회전/전단 결과가 rotated ellipse이므로 `Ellipse`로 표현 불가하여
 * `false`를 반환하고 `out`을 수정하지 않는다. exact zero 비교만 사용한다 (tolerance 없음).
 * 음수 scale/reflection으로 음수 radius가 되는 경우는 caller 책임이다. `Math.abs`를 적용하지 않는다.
 * non-finite matrix component가 exact zero guard를 통과한 경우 산술 결과로 전파한다.
 * 성공 시 center는 full matrix transform(`a*cx + c*cy + tx`, `b*cx + d*cy + ty`)을 적용한다.
 * 입력과 출력이 같은 객체여도 안전하다.
 *
 * @param out 결과를 기록할 타원 객체
 * @param ellipse transform할 ellipse
 * @param matrix 적용할 2D affine matrix
 */
export function transformInto<Out extends EllipseWritable>(out: Out, ellipse: Ellipse, matrix: Matrix): Out | false {
  const { a, b, c, d } = matrix;

  const axisAligned = b === 0 && c === 0;
  const axisSwap = !axisAligned && a === 0 && d === 0;
  if (!axisAligned && !axisSwap) return false;

  const { tx, ty } = matrix;
  // aliasing 안전: out에 기록하기 전에 모든 입력을 local로 읽는다
  const { cx, cy, rx, ry } = ellipse;

  const newCx = a * cx + c * cy + tx;
  const newCy = b * cx + d * cy + ty;
  out.cx = newCx;
  out.cy = newCy;
  if (axisAligned) {
    out.rx = rx * a;
    out.ry = ry * d;
  } else {
    out.rx = ry * c;
    out.ry = rx * b;
  }
  return out;
}
