import type { CircleWritable, Ellipse } from '../types/flat-shapes.internal';

/**
 * `rx === ry`인 ellipse만 circle로 변환해 out에 기록하고 out을 반환한다.
 *
 * 두 radius가 정확히 일치할 때만 성공한다 (`===` 비교, epsilon 없음). 한 ULP라도 다르면 실패.
 * 성공 시 중심 좌표 `cx`, `cy`와 반지름 `r = rx`로 기록하고 `out`을 반환한다.
 * `rx === ry`가 `0` 또는 같은 음수여도 structural circle로 기록한다.
 * NaN radii는 `NaN === NaN`이 false이므로 실패한다.
 * 실패 시 `out`을 수정하지 않고 `false`를 반환한다.
 * 입력과 출력이 같은 객체여도 안전하다.
 *
 * @param out 결과를 기록할 원 객체
 * @param ellipse circle로 변환할 ellipse
 */
export function toCircleInto<Out extends CircleWritable>(out: Out, ellipse: Ellipse): Out | false {
  const { rx, ry } = ellipse;
  if (rx !== ry) return false;
  const { cx, cy } = ellipse;
  out.cx = cx;
  out.cy = cy;
  out.r = rx;
  return out;
}
