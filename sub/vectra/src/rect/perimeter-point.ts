import type { RectLike } from '../types';
import { perimeterPointInto } from './perimeter-point-into';

/**
 * rect perimeter 위 normalized parameter `t`에 해당하는 좌표를 새 `{ x, y }` object로 반환한다.
 *
 * 시작점은 top-left `(x, y)`, 진행 방향은 clockwise.
 * edge 순서: top → right → bottom → left.
 * `t = 0`은 top-left, `t = 0.25`는 정사각형 기준 top-right.
 *
 * wrap 정책:
 * - `wrap: true` (기본값): `t - Math.floor(t)`로 wrapping. `t === 1.0`은 top-left로 돌아온다.
 * - `wrap: false`: `t`를 `[0, 1]`로 clamp. `t <= 0`은 top-left, `t >= 1`은 top-left (폐곡선 종점).
 *
 * NaN/Infinity 처리:
 * - `t = NaN | Infinity | -Infinity`는 JS 산술 결과를 그대로 전파한다.
 * - `wrap: false` clamp는 `t < 0`과 `t > 1`만 검사하므로 NaN은 통과해 산술 전파된다.
 *
 * empty rect (`width <= 0 || height <= 0`):
 * - perimeter가 0이므로 계산 없이 top-left raw 좌표 `(rect.x, rect.y)`를 반환한다.
 *
 * @param rect 기준 rect
 * @param t perimeter 전체에 대한 normalized parameter
 * @param options wrap 정책 옵션. `wrap` 기본값: `true`
 */
export function perimeterPoint(rect: RectLike, t: number, options?: { wrap?: boolean }): { x: number; y: number } {
  return perimeterPointInto({ x: 0, y: 0 }, rect, t, options);
}
