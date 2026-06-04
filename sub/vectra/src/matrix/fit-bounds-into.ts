import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, MatrixWritable } from '../types';

/** fitBoundsInto / fitBounds 옵션. */
export interface FitBoundsOptions {
  /** fit mode. 기본값 `'contain'`. */
  mode?: 'contain' | 'cover' | 'stretch';
}

/**
 * srcBounds를 destBounds에 fit하는 transform matrix를 out에 기록하고 out을 반환한다.
 *
 * src 또는 dest가 empty(`min >= max`)이면 identity matrix를 기록한다.
 * mode가 유효하지 않으면 `RangeError`를 던진다. scalar component가 finite하지 않으면 `RangeError`를 던진다.
 *
 * - `'contain'`: aspect ratio 유지, dest 내부에 완전 포함.
 * - `'cover'`: aspect ratio 유지, dest를 완전 덮음.
 * - `'stretch'`: aspect ratio 무시, dest에 정확히 맞춤.
 *
 * @param out transform matrix를 기록할 writable output
 * @param srcBounds 변환할 source bounds
 * @param destBounds 목적지 bounds
 * @param options fit 옵션
 */
export function fitBoundsInto<Out extends MatrixWritable>(
  out: Out,
  srcBounds: BoundsLike,
  destBounds: BoundsLike,
  options?: FitBoundsOptions
): Out {
  const mode = options?.mode ?? 'contain';
  if (mode !== 'contain' && mode !== 'cover' && mode !== 'stretch') {
    throw new RangeError(`유효하지 않은 mode: "${String(mode)}". 'contain', 'cover', 'stretch' 중 하나여야 한다.`);
  }

  const srcMin = readBoundsMin(srcBounds);
  const srcMax = readBoundsMax(srcBounds);
  const destMin = readBoundsMin(destBounds);
  const destMax = readBoundsMax(destBounds);

  const sMinX = readX(srcMin);
  const sMinY = readY(srcMin);
  const sMaxX = readX(srcMax);
  const sMaxY = readY(srcMax);
  const dMinX = readX(destMin);
  const dMinY = readY(destMin);
  const dMaxX = readX(destMax);
  const dMaxY = readY(destMax);

  if (
    !Number.isFinite(sMinX) ||
    !Number.isFinite(sMinY) ||
    !Number.isFinite(sMaxX) ||
    !Number.isFinite(sMaxY) ||
    !Number.isFinite(dMinX) ||
    !Number.isFinite(dMinY) ||
    !Number.isFinite(dMaxX) ||
    !Number.isFinite(dMaxY)
  ) {
    throw new RangeError('모든 scalar component는 finite number여야 한다.');
  }

  // empty src 또는 empty dest → identity
  if (sMinX >= sMaxX || sMinY >= sMaxY || dMinX >= dMaxX || dMinY >= dMaxY) {
    out.a = 1;
    out.b = 0;
    out.c = 0;
    out.d = 1;
    out.tx = 0;
    out.ty = 0;
    return out;
  }

  const sw = sMaxX - sMinX;
  const sh = sMaxY - sMinY;
  const dw = dMaxX - dMinX;
  const dh = dMaxY - dMinY;

  let scale: number;
  const srcRatio = sw / sh;
  const destRatio = dw / dh;

  if (mode === 'stretch') {
    out.a = dw / sw;
    out.b = 0;
    out.c = 0;
    out.d = dh / sh;
    out.tx = dMinX - sMinX * (dw / sw);
    out.ty = dMinY - sMinY * (dh / sh);
    return out;
  }

  if (mode === 'contain') {
    scale = srcRatio <= destRatio ? dh / sh : dw / sw;
  } else {
    // cover
    scale = srcRatio <= destRatio ? dw / sw : dh / sh;
  }

  const scaledW = sw * scale;
  const scaledH = sh * scale;
  const tx = dMinX + (dw - scaledW) / 2 - sMinX * scale;
  const ty = dMinY + (dh - scaledH) / 2 - sMinY * scale;

  out.a = scale;
  out.b = 0;
  out.c = 0;
  out.d = scale;
  out.tx = tx;
  out.ty = ty;
  return out;
}
