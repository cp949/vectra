import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/** halvesInto 옵션. */
export interface HalvesOptions {
  /**
   * 분할 축. `'x'`는 left/right 분할, `'y'`는 top/bottom 분할.
   * 기본값: `'x'`.
   */
  axis?: 'x' | 'y';

  /**
   * 분할 비율. `[0, 1]` closed interval.
   * 기본값: `0.5`.
   * 범위 밖이거나 `NaN`이면 `RangeError`를 던진다.
   */
  ratio?: number;
}

/**
 * rect를 first/second 두 부분으로 분할하여 `out`에 기록하고 `out`을 반환한다.
 *
 * **axis: 'x'** (기본값) — left/right 분할:
 * - `split = x + width * ratio`
 * - `first`:  `{ x: x,     y: y, width: split - x,        height: height }`
 * - `second`: `{ x: split, y: y, width: x + width - split, height: height }`
 *
 * **axis: 'y'** — top/bottom 분할:
 * - `split = y + height * ratio`
 * - `first`:  `{ x: x, y: y,     width: width, height: split - y         }`
 * - `second`: `{ x: x, y: split, width: width, height: y + height - split }`
 *
 * `axis` 기본값: `'x'`. `ratio` 기본값: `0.5`.
 *
 * `ratio`가 `[0, 1]` 범위를 벗어나거나 `NaN`이면 `RangeError`를 던진다.
 *
 * `axis`가 `'x'` / `'y'` 이외의 문자열이면 `RangeError`를 던진다.
 * `axis`가 `undefined`이면 기본값 `'x'`를 사용한다.
 *
 * 정규화하지 않는다. negative width/height rect는 raw 산식으로 분할한다.
 *
 * **aliasing 안전**: `out.first`/`out.second`가 `rect`와 동일한 object여도 결과가
 * 정확히 계산된다. 모든 입력 값을 local 변수로 먼저 읽은 후 기록한다.
 *
 * @param out 분할 결과를 기록할 writable output
 * @param rect 분할할 rect
 * @param options axis / ratio 옵션
 */
export function halvesInto<
  Out extends {
    first: RectWritable;
    second: RectWritable;
  },
>(out: Out, rect: RectLike, options?: HalvesOptions): Out {
  const axis = options?.axis ?? 'x';
  const ratio = options?.ratio ?? 0.5;

  // axis 검증 — undefined는 기본값으로 이미 처리됨
  if (axis !== 'x' && axis !== 'y') {
    throw new RangeError(`halvesInto: axis must be 'x' or 'y', got ${String(axis)}`);
  }

  // ratio 검증 — NaN을 먼저 검사해야 한다 (NaN < 0 과 NaN > 1은 모두 false)
  if (Number.isNaN(ratio) || ratio < 0 || ratio > 1) {
    throw new RangeError(`halvesInto: ratio must be in [0, 1], got ${ratio}`);
  }

  // aliasing 안전 - 모든 입력 값을 먼저 local 변수로 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  if (axis === 'x') {
    const split = x + w * ratio;

    out.first.x = x;
    out.first.y = y;
    out.first.width = split - x;
    out.first.height = h;

    out.second.x = split;
    out.second.y = y;
    out.second.width = x + w - split;
    out.second.height = h;
  } else {
    const split = y + h * ratio;

    out.first.x = x;
    out.first.y = y;
    out.first.width = w;
    out.first.height = split - y;

    out.second.x = x;
    out.second.y = split;
    out.second.width = w;
    out.second.height = y + h - split;
  }

  return out;
}
