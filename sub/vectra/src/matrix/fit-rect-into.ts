import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { MatrixWritable, RectLike } from '../types';

/** fitRectInto / fitRect 옵션. */
export interface FitRectOptions {
  /** fit mode. 기본값 `'contain'`. */
  mode?: 'contain' | 'cover' | 'stretch';
  /**
   * y축을 뒤집는다. 기본값 `false`.
   *
   * `true`이면 `d < 0`으로 설정해 y축 방향을 반전시킨다.
   * contain / cover 모드에서는 scaled src가 dest 중심에 수직 반전된 채 배치된다.
   * stretch 모드에서는 각 축 독립 scale을 유지하면서 y축만 뒤집는다.
   * src 또는 dest가 empty이면 `flipY: true`여도 identity matrix를 기록한다.
   */
  flipY?: boolean;
}

/**
 * srcRect를 destRect에 fit하는 transform matrix를 out에 기록하고 out을 반환한다.
 *
 * src 또는 dest가 empty(`width <= 0` 또는 `height <= 0`)이면 identity matrix를 기록한다.
 * mode가 유효하지 않으면 `RangeError`를 던진다. scalar component가 finite하지 않으면 `RangeError`를 던진다.
 *
 * - `'contain'`: aspect ratio 유지, dest 내부에 완전 포함.
 * - `'cover'`: aspect ratio 유지, dest를 완전 덮음.
 * - `'stretch'`: aspect ratio 무시, dest에 정확히 맞춤.
 *
 * `options.flipY`가 `true`이면 y축을 뒤집는다(`d < 0`).
 * contain / cover 모드에서는 scaled src center를 dest center에 맞추되 수직 반전된 채 배치된다.
 * stretch 모드에서는 y축 scale만 반전된다.
 * src 또는 dest가 empty이면 `flipY: true`여도 identity matrix를 기록한다.
 *
 * @param out transform matrix를 기록할 writable output
 * @param srcRect 변환할 source rect
 * @param destRect 목적지 rect
 * @param options fit 옵션
 */
export function fitRectInto<Out extends MatrixWritable>(
  out: Out,
  srcRect: RectLike,
  destRect: RectLike,
  options?: FitRectOptions
): Out {
  const mode = options?.mode ?? 'contain';
  if (mode !== 'contain' && mode !== 'cover' && mode !== 'stretch') {
    throw new RangeError(`유효하지 않은 mode: "${String(mode)}". 'contain', 'cover', 'stretch' 중 하나여야 한다.`);
  }
  const flipY = options?.flipY === true;

  const sx = readRectX(srcRect);
  const sy = readRectY(srcRect);
  const sw = readRectWidth(srcRect);
  const sh = readRectHeight(srcRect);
  const dx = readRectX(destRect);
  const dy = readRectY(destRect);
  const dw = readRectWidth(destRect);
  const dh = readRectHeight(destRect);

  if (
    !Number.isFinite(sx) ||
    !Number.isFinite(sy) ||
    !Number.isFinite(sw) ||
    !Number.isFinite(sh) ||
    !Number.isFinite(dx) ||
    !Number.isFinite(dy) ||
    !Number.isFinite(dw) ||
    !Number.isFinite(dh)
  ) {
    throw new RangeError('모든 scalar component는 finite number여야 한다.');
  }

  // empty src 또는 empty dest → identity
  if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) {
    out.a = 1;
    out.b = 0;
    out.c = 0;
    out.d = 1;
    out.tx = 0;
    out.ty = 0;
    return out;
  }

  let scale: number;
  const srcRatio = sw / sh;
  const destRatio = dw / dh;

  if (mode === 'stretch') {
    // 비율 무시: 각 축 독립 scale
    out.a = dw / sw;
    out.b = 0;
    out.c = 0;
    if (flipY) {
      out.d = -(dh / sh);
      out.tx = dx - sx * (dw / sw);
      out.ty = dy + dh + sy * (dh / sh);
    } else {
      out.d = dh / sh;
      out.tx = dx - sx * (dw / sw);
      out.ty = dy - sy * (dh / sh);
    }
    return out;
  }

  if (mode === 'contain') {
    // src 전체가 dest에 들어오도록: 더 작은 scale 기준
    scale = srcRatio <= destRatio ? dh / sh : dw / sw;
  } else {
    // cover: dest 전체를 src가 덮도록: 더 큰 scale 기준
    scale = srcRatio <= destRatio ? dw / sw : dh / sh;
  }

  // src center를 dest center에 맞춘다
  const scaledW = sw * scale;
  const scaledH = sh * scale;
  const tx = dx + (dw - scaledW) / 2 - sx * scale;

  out.a = scale;
  out.b = 0;
  out.c = 0;
  if (flipY) {
    out.d = -scale;
    out.tx = tx;
    out.ty = dy + (dh + scaledH) / 2 + sy * scale;
  } else {
    out.d = scale;
    out.tx = tx;
    out.ty = dy + (dh - scaledH) / 2 - sy * scale;
  }
  return out;
}
