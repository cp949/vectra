import { readRectHeight, readRectWidth } from '../internal/rect';
import type { RectLike, XYWritable } from '../types';
import { perimeterPointInto } from './perimeter-point-into';

/**
 * rect perimeter 위 point 배열을 `out`에 push한다.
 *
 * `out.length = 0` 후 새 `{ x, y }` object를 push한다.
 *
 * options 분기:
 * - `{ count }`: `count`개 point를 `t = i / count`로 sampling.
 *   `count === 4`이면 네 corner를 반환한다.
 *   `count`는 positive integer여야 한다. 위반 시 `RangeError`.
 * - `{ step }`: perimeter 위 절대 거리 간격으로 sampling.
 *   `dist = 0, step, 2*step, ...` (dist < perimeter 조건). `t = dist / perimeter`.
 *   `step`은 finite positive number여야 한다. 위반 시 `RangeError`.
 *
 * `wrap` 옵션은 `perimeterPointInto`에 그대로 위임한다. 기본값: `true`.
 *
 * empty rect (`width <= 0 || height <= 0`):
 * - perimeter가 0이므로 `out.length = 0`만 설정하고 push하지 않는다.
 * - invalid count/step은 empty rect에서도 `RangeError`를 던진다.
 *
 * @param out point를 push할 writable array
 * @param rect 기준 rect
 * @param options `{ count, wrap? }` 또는 `{ step, wrap? }` 형태의 sampling 옵션
 */
export function perimeterPointsInto(
  out: XYWritable[],
  rect: RectLike,
  options: { count: number; wrap?: boolean } | { step: number; wrap?: boolean }
): void {
  // 입력 유효성을 먼저 검사한다 (empty rect 여부와 무관하게)
  if ('count' in options) {
    const { count } = options;
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError(`perimeterPointsInto: count must be a positive integer, got ${count}`);
    }
  } else {
    const { step } = options;
    if (!Number.isFinite(step) || step <= 0) {
      throw new RangeError(`perimeterPointsInto: step must be a finite positive number, got ${step}`);
    }
  }

  out.length = 0;

  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  // empty rect: perimeter가 없으므로 push하지 않는다
  if (w <= 0 || h <= 0) {
    return;
  }

  const wrapOpt = { wrap: options.wrap };

  if ('count' in options) {
    const { count } = options;
    for (let i = 0; i < count; i += 1) {
      const t = i / count;
      const pt = perimeterPointInto({ x: 0, y: 0 }, rect, t, wrapOpt);
      out.push(pt);
    }
  } else {
    const { step } = options;
    const perimeter = 2 * (w + h);
    let dist = 0;
    while (dist < perimeter) {
      const t = dist / perimeter;
      const pt = perimeterPointInto({ x: 0, y: 0 }, rect, t, wrapOpt);
      out.push(pt);
      dist += step;
    }
  }
}
