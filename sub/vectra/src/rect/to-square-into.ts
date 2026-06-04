import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * rect를 정사각형으로 변환한 결과를 out에 기록한다.
 *
 * 결과는 rect 중심에 정렬된다. `mode === 'min'`은 짧은 변을 사용해 rect 내부에 fit하고,
 * `mode === 'max'`는 긴 변을 사용해 rect를 덮는다. 기본값은 `'min'`이다.
 * empty rect(`width <= 0` 또는 `height <= 0`)이면 out에 rect를 그대로 복사한다.
 * 그 외 mode 값은 `RangeError`를 던진다.
 * out과 rect가 같은 object여도 안전하다.
 *
 * @param out 정사각형 rect를 기록할 writable output
 * @param rect 변환할 source rect
 * @param mode 'min'은 짧은 변 길이, 'max'는 긴 변 길이를 한 변으로 사용한다. 기본값 'min'.
 */
export function toSquareInto<Out extends RectWritable>(out: Out, rect: RectLike, mode: 'min' | 'max' = 'min'): Out {
  if (mode !== 'min' && mode !== 'max') {
    throw new RangeError(`유효하지 않은 mode: "${String(mode)}". 'min', 'max' 중 하나여야 한다.`);
  }

  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  // empty rect → rect 복사
  if (w <= 0 || h <= 0) {
    out.x = x;
    out.y = y;
    out.width = w;
    out.height = h;
    return out;
  }

  const side = mode === 'min' ? Math.min(w, h) : Math.max(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;

  out.x = cx - side / 2;
  out.y = cy - side / 2;
  out.width = side;
  out.height = side;
  return out;
}
