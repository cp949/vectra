/**
 * handle drag → affine transform matrix 합성 internal helper.
 *
 * transformFromHandlesInto / transformFromHandles가 공유하는 순수 수치 계산만 담는다.
 * src/internal/matrix.ts kernel을 사용한다.
 */

import { readX, readY } from '../internal/xy';
import type { BoundsLike, MatrixWritable, XYInput } from '../types';
import { anchorX, anchorY, readBoundsCoords, resizeHandleX, resizeHandleY } from './handle-position.internal';
import type { AnchorKind, ResizeHandleId } from './types';

// ---------------------------------------------------------------------------
// handle → 대각 anchor 매핑
// ---------------------------------------------------------------------------

/**
 * resize handle id에 해당하는 기본 anchor kind를 반환한다.
 *
 * handle의 대각 반대쪽 corner/edge를 고정 anchor로 사용한다.
 * - corner handle: 대각 corner
 * - edge handle: 반대쪽 edge 중심 (n→bottom, s→top, e→left, w→right)
 *
 * @param handle resize handle 식별자
 */
export function defaultAnchorForHandle(handle: ResizeHandleId): AnchorKind {
  switch (handle) {
    case 'nw':
      return 'bottom-right';
    case 'n':
      return 'bottom';
    case 'ne':
      return 'bottom-left';
    case 'e':
      return 'left';
    case 'se':
      return 'top-left';
    case 's':
      return 'top';
    case 'sw':
      return 'top-right';
    case 'w':
      return 'right';
  }
}

// ---------------------------------------------------------------------------
// handle이 영향을 주는 축 판별
// ---------------------------------------------------------------------------

/**
 * handle이 x축(가로) 크기에 영향을 주면 true를 반환한다.
 *
 * @param handle resize handle 식별자
 */
export function handleAffectsX(handle: ResizeHandleId): boolean {
  switch (handle) {
    case 'n':
    case 's':
      return false;
    default:
      return true;
  }
}

/**
 * handle이 y축(세로) 크기에 영향을 주면 true를 반환한다.
 *
 * @param handle resize handle 식별자
 */
export function handleAffectsY(handle: ResizeHandleId): boolean {
  switch (handle) {
    case 'e':
    case 'w':
      return false;
    default:
      return true;
  }
}

/**
 * handle이 corner handle(두 축 모두 영향)이면 true를 반환한다.
 *
 * @param handle resize handle 식별자
 */
function isCornerHandle(handle: ResizeHandleId): boolean {
  return handleAffectsX(handle) && handleAffectsY(handle);
}

// ---------------------------------------------------------------------------
// transform 합성
// ---------------------------------------------------------------------------

/**
 * handle drag 입력에서 scale + translate 2D affine matrix를 합성해 out에 기록한다.
 *
 * 실패 조건(false 반환 + out 미수정):
 * - 영향 있는 축의 기존 extent가 0 (scale 정의 불가)
 * - 산출된 scale 또는 translate 값이 finite하지 않음 (NaN/Infinity propagation)
 *
 * @param out matrix를 기록할 writable output
 * @param bounds 원본 unrotated AABB
 * @param handle 드래그한 resize handle 식별자
 * @param to handle이 이동한 새 위치
 * @param anchor 고정 기준점 kind
 * @param aspectLocked corner handle에서 등비례 보정 여부
 */
export function composeTransformFromHandles<Out extends MatrixWritable>(
  out: Out,
  bounds: BoundsLike,
  handle: ResizeHandleId,
  to: XYInput,
  anchor: AnchorKind,
  aspectLocked: boolean
): boolean {
  const { minX, minY, maxX, maxY, midX, midY } = readBoundsCoords(bounds);
  const oldWidth = maxX - minX;
  const oldHeight = maxY - minY;

  const toX = readX(to);
  const toY = readY(to);

  const affectsX = handleAffectsX(handle);
  const affectsY = handleAffectsY(handle);
  const corner = isCornerHandle(handle);

  // zero-size: 영향 있는 축 extent가 0이면 scale 정의 불가
  if (affectsX && oldWidth === 0) return false;
  if (affectsY && oldHeight === 0) return false;

  // 새 bounds 산출: handle이 영향주는 축만 변경
  // handle의 원래 위치에서 to까지 이동량을 파악해 해당 edge를 갱신한다.
  let newWidth = oldWidth;
  let newHeight = oldHeight;

  if (affectsX) {
    // handle이 minX 측이면 새 minX = toX, maxX 고정
    // handle이 maxX 측이면 새 maxX = toX, minX 고정
    const handleOrigX = resizeHandleX(handle, minX, maxX, midX);
    if (handleOrigX === minX) {
      // nw / sw / w handle: minX가 이동
      newWidth = maxX - toX;
    } else {
      // ne / se / e handle: maxX가 이동
      newWidth = toX - minX;
    }
  }

  if (affectsY) {
    const handleOrigY = resizeHandleY(handle, minY, maxY, midY);
    if (handleOrigY === minY) {
      // nw / n / ne handle: minY가 이동
      newHeight = maxY - toY;
    } else {
      // sw / s / se handle: maxY가 이동
      newHeight = toY - minY;
    }
  }

  // scale 계산
  let sx = affectsX ? newWidth / oldWidth : 1;
  let sy = affectsY ? newHeight / oldHeight : 1;

  // aspectLocked: corner handle에서만 min scale로 두 축 보정
  if (aspectLocked && corner) {
    const minScale = Math.min(Math.abs(sx), Math.abs(sy));
    sx = sx < 0 ? -minScale : minScale;
    sy = sy < 0 ? -minScale : minScale;
  }

  // anchor 좌표 (고정점)
  const ax = anchorX(anchor, minX, maxX, midX);
  const ay = anchorY(anchor, minY, maxY, midY);

  // translate: anchor * (1 - scale)
  const tx = ax - sx * ax;
  const ty = ay - sy * ay;

  // finite 검사: NaN/Infinity 전파 시 false
  if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(tx) || !Number.isFinite(ty)) {
    return false;
  }

  // out에 기록 (b=0, c=0: shear 없는 순수 scale+translate)
  out.a = sx;
  out.b = 0;
  out.c = 0;
  out.d = sy;
  out.tx = tx;
  out.ty = ty;

  return true;
}
