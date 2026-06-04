import type { InfiniteLineWritable } from '../types';
import { createInfiniteLine } from './create-infinite-line';
import { fromCoefficientsInto } from './from-coefficients-into';

/**
 * implicit equation `a * x + b * y + c = 0`을 infinite-line으로 변환해 새 plain object로 반환한다.
 *
 * `direction = { x: -b, y: a }`로 기록한다.
 * 기준점은 division overflow를 줄이기 위해 큰 coefficient 축을 피해 선택한다.
 * - `Math.abs(a) >= Math.abs(b)`이면 `origin = { x: -c / a, y: 0 }`.
 * - 그 외(`Math.abs(b) > Math.abs(a)`)이면 `origin = { x: 0, y: -c / b }`.
 *
 * `a === 0 && b === 0`은 equation이 직선을 정의하지 않는 degenerate fallback이다.
 * 이 경우 `origin = { x: 0, y: 0 }`, `direction = { x: 0, y: 0 }`을 기록한다.
 *
 * non-finite coefficient(`NaN | Infinity | -Infinity`)는 검증하지 않는다.
 * `Math.abs` 비교와 JS 산술 결과(예: `NaN` 비교는 false)를 그대로 따른다.
 *
 * @param a implicit equation의 x coefficient
 * @param b implicit equation의 y coefficient
 * @param c implicit equation의 상수항
 */
export function fromCoefficients(a: number, b: number, c: number): InfiniteLineWritable {
  return fromCoefficientsInto(createInfiniteLine(), a, b, c);
}
