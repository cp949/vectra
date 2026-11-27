import type { InfiniteLineWritable } from '../types/flat-shapes.internal';

/**
 * implicit equation `a * x + b * y + c = 0`을 infinite-line으로 변환해 `out`에 기록하고 `out`을 반환한다.
 *
 * `{ dx: -b, dy: a }`로 기록한다.
 * 기준점은 division overflow를 줄이기 위해 큰 coefficient 축을 피해 선택한다.
 * - `Math.abs(a) >= Math.abs(b)`이면 `{ ox: -c / a, oy: 0 }`.
 * - 그 외에는 `{ ox: 0, oy: -c / b }`.
 *
 * `a === 0 && b === 0`은 equation이 직선을 정의하지 않는 degenerate fallback이다.
 * 이 경우 `{ ox: 0, oy: 0 }`, `{ dx: 0, dy: 0 }`을 기록한다.
 *
 * non-finite coefficient(`NaN | Infinity | -Infinity`)는 검증하지 않는다.
 * `Math.abs` 비교와 JS 산술 결과(예: `NaN` 비교는 false)를 그대로 따른다.
 *
 * @param out 결과를 기록할 무한 직선 객체
 * @param a implicit equation의 x coefficient
 * @param b implicit equation의 y coefficient
 * @param c implicit equation의 상수항
 */
export function fromCoefficientsInto<Out extends InfiniteLineWritable>(out: Out, a: number, b: number, c: number): Out {
  if (a === 0 && b === 0) {
    out.ox = 0;
    out.oy = 0;
    out.dx = 0;
    out.dy = 0;
    return out;
  }
  if (Math.abs(a) >= Math.abs(b)) {
    out.ox = -c / a;
    out.oy = 0;
  } else {
    out.ox = 0;
    out.oy = -c / b;
  }
  out.dx = -b;
  out.dy = a;
  return out;
}
