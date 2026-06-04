import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, XYWritable } from '../types';

/**
 * rect perimeter 위 normalized parameter `t`에 해당하는 좌표를 `out`에 기록하고 반환한다.
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
 * - perimeter가 0이므로 계산 없이 top-left raw 좌표 `(rect.x, rect.y)`를 `out`에 기록한다.
 *
 * @param out 좌표를 기록할 writable output
 * @param rect 기준 rect
 * @param t perimeter 전체에 대한 normalized parameter
 * @param options wrap 정책 옵션. `wrap` 기본값: `true`
 */
export function perimeterPointInto<Out extends XYWritable>(
  out: Out,
  rect: RectLike,
  t: number,
  options?: { wrap?: boolean }
): Out {
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  if (w <= 0 || h <= 0) {
    return writeXY(out, x, y);
  }

  const wrap = options?.wrap !== false;
  let nt: number;
  if (wrap) {
    nt = t - Math.floor(t);
  } else {
    if (t <= 0) {
      nt = 0;
    } else if (t >= 1) {
      nt = 1;
    } else {
      nt = t;
    }
  }

  const perimeter = 2 * (w + h);
  const dist = nt * perimeter;

  let px: number;
  let py: number;

  if (dist < w) {
    px = x + dist;
    py = y;
  } else if (dist < w + h) {
    px = x + w;
    py = y + (dist - w);
  } else if (dist < 2 * w + h) {
    px = x + w - (dist - (w + h));
    py = y + h;
  } else {
    px = x;
    py = y + h - (dist - (2 * w + h));
  }

  return writeXY(out, px, py);
}
