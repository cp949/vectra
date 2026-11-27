import type { Bounds, BoundsPadding, MatrixWritable } from '../types/flat-shapes.internal';
import { assertFinite, fitBoundsMatrixInto, ZERO_PADDING } from './viewport.internal';

/** zoomToFitInto / zoomToFit 옵션. 옵션을 생략하면 `mode: 'contain'`과 네 방향 padding 0을 적용한다. */
export interface ZoomToFitOptions {
  /** 맞춤 방식. */
  mode: 'contain' | 'cover' | 'stretch';

  /** viewport를 안쪽으로 줄이는 네 방향 inset. */
  padding: BoundsPadding;
}

/**
 * contentBounds를 padding 적용한 viewportBounds에 맞추는 transform matrix를 out에 기록하고 out을 반환한다.
 *
 * content 또는 padded viewport가 empty(`min >= max`)이면 identity matrix를 기록한다.
 * mode가 유효하지 않으면 `RangeError`를 던진다. bounds 또는 padding scalar가 finite하지 않으면 `RangeError`를 던진다.
 *
 * - `'contain'`: aspect ratio 유지, padded viewport 내부에 완전 포함.
 * - `'cover'`: aspect ratio 유지, padded viewport를 완전 덮음.
 * - `'stretch'`: aspect ratio 무시, padded viewport에 정확히 맞춤.
 *
 * @param out transform matrix를 기록할 행렬 객체
 * @param contentBounds viewport에 맞출 content bounds
 * @param viewportBounds content를 담을 viewport bounds. padding으로 안쪽으로 줄어든다.
 * @param options fit mode와 padding 옵션
 */
export function zoomToFitInto<Out extends MatrixWritable>(
  out: Out,
  contentBounds: Bounds,
  viewportBounds: Bounds,
  options?: ZoomToFitOptions
): Out {
  const mode = options === undefined ? 'contain' : options.mode;
  if (mode !== 'contain' && mode !== 'cover' && mode !== 'stretch') {
    throw new RangeError(`유효하지 않은 mode: "${String(mode)}". 'contain', 'cover', 'stretch' 중 하나여야 한다.`);
  }

  const cMinX = contentBounds.minX;
  const cMinY = contentBounds.minY;
  const cMaxX = contentBounds.maxX;
  const cMaxY = contentBounds.maxY;
  const vMinX = viewportBounds.minX;
  const vMinY = viewportBounds.minY;
  const vMaxX = viewportBounds.maxX;
  const vMaxY = viewportBounds.maxY;

  const padding = options === undefined ? ZERO_PADDING : options.padding;
  assertFinite([
    cMinX,
    cMinY,
    cMaxX,
    cMaxY,
    vMinX,
    vMinY,
    vMaxX,
    vMaxY,
    padding.top,
    padding.right,
    padding.bottom,
    padding.left,
  ]);

  // padded viewport는 각 방향으로 inset만큼 좁아진다
  return fitBoundsMatrixInto(
    out,
    cMinX,
    cMinY,
    cMaxX,
    cMaxY,
    vMinX + padding.left,
    vMinY + padding.top,
    vMaxX - padding.right,
    vMaxY - padding.bottom,
    mode
  );
}
