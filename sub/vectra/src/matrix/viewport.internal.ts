/**
 * matrix viewport zoom helper의 domain-local shared 계산.
 *
 * `zoom-to-fit-into` / `zoom-at-point-into` / `clamp-viewport-bounds-into` leaf가 공유하는
 * 기본 padding, finite 검증, bounds-to-bounds fit matrix, axis clamp 계산을 모은다.
 * public 함수끼리 import하지 않기 위한 낮은 internal helper다.
 */

import type { BoundsPadding, MatrixWritable } from '../types/flat-shapes.internal';

/** zoomToFit fit mode. */
export type ZoomFitMode = 'contain' | 'cover' | 'stretch';

/** 옵션을 생략했을 때 사용할 네 방향 inset. */
export const ZERO_PADDING: BoundsPadding = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * 모든 scalar component가 finite하지 않으면 `RangeError`를 던진다.
 *
 * @param values finite 여부를 검증할 scalar 목록
 */
export function assertFinite(values: readonly number[]): void {
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new RangeError('모든 scalar component는 finite number여야 한다.');
    }
  }
}

/**
 * src bounds를 dest bounds에 fit하는 transform matrix를 out에 기록하고 out을 반환한다.
 *
 * src 또는 dest가 empty(`min >= max`)이면 identity matrix를 기록한다.
 * 입력 scalar는 호출자가 finite로 검증한 뒤 raw component로 전달한다.
 *
 * @param out transform matrix를 기록할 행렬 객체
 * @param sMinX src 최솟값 x
 * @param sMinY src 최솟값 y
 * @param sMaxX src 최댓값 x
 * @param sMaxY src 최댓값 y
 * @param dMinX dest 최솟값 x
 * @param dMinY dest 최솟값 y
 * @param dMaxX dest 최댓값 x
 * @param dMaxY dest 최댓값 y
 * @param mode fit mode
 */
export function fitBoundsMatrixInto<Out extends MatrixWritable>(
  out: Out,
  sMinX: number,
  sMinY: number,
  sMaxX: number,
  sMaxY: number,
  dMinX: number,
  dMinY: number,
  dMaxX: number,
  dMaxY: number,
  mode: ZoomFitMode
): Out {
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

  if (mode === 'stretch') {
    out.a = dw / sw;
    out.b = 0;
    out.c = 0;
    out.d = dh / sh;
    out.tx = dMinX - sMinX * (dw / sw);
    out.ty = dMinY - sMinY * (dh / sh);
    return out;
  }

  const srcRatio = sw / sh;
  const destRatio = dw / dh;
  let scale: number;
  if (mode === 'contain') {
    scale = srcRatio <= destRatio ? dh / sh : dw / sw;
  } else {
    scale = srcRatio <= destRatio ? dw / sw : dh / sh;
  }

  const scaledW = sw * scale;
  const scaledH = sh * scale;
  out.a = scale;
  out.b = 0;
  out.c = 0;
  out.d = scale;
  out.tx = dMinX + (dw - scaledW) / 2 - sMinX * scale;
  out.ty = dMinY + (dh - scaledH) / 2 - sMinY * scale;
  return out;
}

/**
 * 한 축에서 viewport span을 padded content span 안쪽으로 보정한 `[min, max]`를 반환한다.
 *
 * viewport span이 content span보다 작거나 같으면 translation만으로 content 안쪽에 둔다.
 * viewport span이 더 크면 content 중심에 viewport 중심을 맞춘다. span은 보존한다.
 *
 * @param vMin viewport 축 최솟값
 * @param vMax viewport 축 최댓값
 * @param pcMin padded content 축 최솟값
 * @param pcMax padded content 축 최댓값
 */
export function clampViewportAxis(vMin: number, vMax: number, pcMin: number, pcMax: number): [number, number] {
  const vSize = vMax - vMin;
  const pcSize = pcMax - pcMin;

  if (vSize > pcSize) {
    // viewport가 content보다 크면 중심을 맞춘다
    const center = (pcMin + pcMax) / 2;
    const half = vSize / 2;
    return [center - half, center + half];
  }

  let nMin = vMin;
  const maxMin = pcMax - vSize;
  if (nMin < pcMin) {
    nMin = pcMin;
  } else if (nMin > maxMin) {
    nMin = maxMin;
  }
  return [nMin, nMin + vSize];
}
