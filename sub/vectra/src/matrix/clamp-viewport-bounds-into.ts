import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsPaddingLike, BoundsWritable, XYWritable } from '../types';
import { assertFinite, clampViewportAxis, resolvePadding } from './viewport.internal';

/** clampViewportBoundsInto / clampViewportBounds 옵션. */
export interface ClampViewportBoundsOptions {
  /** content를 안쪽으로 줄이는 inset. `number`는 네 방향 동일. 기본값 0. */
  padding?: BoundsPaddingLike | number;
}

/**
 * viewportBounds가 padding 적용한 contentBounds를 벗어나지 않도록 translate한 결과를 out에 기록하고 out을 반환한다.
 *
 * viewport 크기는 보존하고 translation만 한다. 한 축에서 viewport가 padded content보다 크면 그 축은
 * padded content 중심에 viewport 중심을 맞춘다. 작거나 같으면 viewport를 padded content 안쪽으로 옮긴다.
 * viewport가 inverted empty이거나 padded content가 empty이면 viewport의 normalized copy를 기록한다.
 * bounds 또는 padding scalar가 finite하지 않으면 `RangeError`를 던진다.
 * 입력 좌표를 모두 먼저 읽으므로 `out`과 `viewportBounds` nested point aliasing이 안전하다.
 *
 * @param out 보정된 viewport bounds를 기록할 writable output
 * @param viewportBounds 보정할 viewport bounds
 * @param contentBounds viewport를 가둘 content bounds. padding으로 안쪽으로 줄어든다.
 * @param options padding 옵션
 */
export function clampViewportBoundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(
  out: Out,
  viewportBounds: BoundsLike,
  contentBounds: BoundsLike,
  options?: ClampViewportBoundsOptions
): Out {
  const viewportMin = readBoundsMin(viewportBounds);
  const viewportMax = readBoundsMax(viewportBounds);
  const contentMin = readBoundsMin(contentBounds);
  const contentMax = readBoundsMax(contentBounds);

  // aliasing 안전: 모든 입력 좌표를 먼저 읽은 뒤 기록한다
  const vx0 = readX(viewportMin);
  const vy0 = readY(viewportMin);
  const vx1 = readX(viewportMax);
  const vy1 = readY(viewportMax);
  const cx0 = readX(contentMin);
  const cy0 = readY(contentMin);
  const cx1 = readX(contentMax);
  const cy1 = readY(contentMax);

  const padding = resolvePadding(options?.padding);
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
    writeXY(out.min, nvMinX, nvMinY);
    writeXY(out.max, nvMaxX, nvMaxY);
    return out;
  }

  const [newMinX, newMaxX] = clampViewportAxis(nvMinX, nvMaxX, pcMinX, pcMaxX);
  const [newMinY, newMaxY] = clampViewportAxis(nvMinY, nvMaxY, pcMinY, pcMaxY);
  writeXY(out.min, newMinX, newMinY);
  writeXY(out.max, newMaxX, newMaxY);
  return out;
}
