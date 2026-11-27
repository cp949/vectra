import type { Bounds, BoundsPadding, BoundsWritable } from '../types/flat-shapes.internal';
import { assertFinite, clampViewportAxis, ZERO_PADDING } from './viewport.internal';

/** clampViewportBoundsInto / clampViewportBounds 옵션. 옵션을 생략하면 네 방향에 0을 적용한다. */
export interface ClampViewportBoundsOptions {
  /** content를 안쪽으로 줄이는 네 방향 inset. */
  padding: BoundsPadding;
}

/**
 * viewportBounds가 padding 적용한 contentBounds를 벗어나지 않도록 translate한 결과를 out에 기록하고 out을 반환한다.
 *
 * viewport 크기는 보존하고 translation만 한다. 한 축에서 viewport가 padded content보다 크면 그 축은
 * padded content 중심에 viewport 중심을 맞춘다. 작거나 같으면 viewport를 padded content 안쪽으로 옮긴다.
 * viewport가 inverted empty이거나 padded content가 empty이면 viewport의 normalized copy를 기록한다.
 * bounds 또는 padding scalar가 finite하지 않으면 `RangeError`를 던진다.
 * 입력 좌표를 모두 먼저 읽으므로 `out === viewportBounds`여도 안전하다.
 *
 * @param out 보정된 viewport bounds를 기록할 경계 상자 객체
 * @param viewportBounds 보정할 viewport bounds
 * @param contentBounds viewport를 가둘 content bounds. padding으로 안쪽으로 줄어든다.
 * @param options padding 옵션
 */
export function clampViewportBoundsInto<Out extends BoundsWritable>(
  out: Out,
  viewportBounds: Bounds,
  contentBounds: Bounds,
  options?: ClampViewportBoundsOptions
): Out {
  // aliasing 안전: 모든 입력 좌표를 먼저 읽은 뒤 기록한다
  const vx0 = viewportBounds.minX;
  const vy0 = viewportBounds.minY;
  const vx1 = viewportBounds.maxX;
  const vy1 = viewportBounds.maxY;
  const cx0 = contentBounds.minX;
  const cy0 = contentBounds.minY;
  const cx1 = contentBounds.maxX;
  const cy1 = contentBounds.maxY;

  const padding = options === undefined ? ZERO_PADDING : options.padding;
  assertFinite([vx0, vy0, vx1, vy1, cx0, cy0, cx1, cy1, padding.top, padding.right, padding.bottom, padding.left]);

  const nvMinX = Math.min(vx0, vx1);
  const nvMinY = Math.min(vy0, vy1);
  const nvMaxX = Math.max(vx0, vx1);
  const nvMaxY = Math.max(vy0, vy1);

  const pcMinX = cx0 + padding.left;
  const pcMinY = cy0 + padding.top;
  const pcMaxX = cx1 - padding.right;
  const pcMaxY = cy1 - padding.bottom;

  // inverted viewport 또는 empty padded content → normalized viewport copy.
  // padded content는 한 축이라도 zero-size(`min >= max`)이면 empty다. fitBoundsMatrixInto와 같은 inclusive 경계.
  if (vx1 < vx0 || vy1 < vy0 || pcMaxX <= pcMinX || pcMaxY <= pcMinY) {
    out.minX = nvMinX;
    out.minY = nvMinY;
    out.maxX = nvMaxX;
    out.maxY = nvMaxY;
    return out;
  }

  const [newMinX, newMaxX] = clampViewportAxis(nvMinX, nvMaxX, pcMinX, pcMaxX);
  const [newMinY, newMaxY] = clampViewportAxis(nvMinY, nvMaxY, pcMinY, pcMaxY);
  out.minX = newMinX;
  out.minY = newMinY;
  out.maxX = newMaxX;
  out.maxY = newMaxY;
  return out;
}
