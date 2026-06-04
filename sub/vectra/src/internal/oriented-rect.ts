import type { OrientedRectLike, OrientedRectTuple, XYInput } from '../types';

function isOrientedRectTuple(rect: OrientedRectLike): rect is OrientedRectTuple {
  return Array.isArray(rect);
}

/** oriented-rect input에서 center 좌표를 읽는다. */
export function readOrientedRectCenter(rect: OrientedRectLike): XYInput {
  return isOrientedRectTuple(rect) ? rect[0] : rect.center;
}

/** oriented-rect input에서 size pair를 읽는다. `x`는 width, `y`는 height다. */
export function readOrientedRectSize(rect: OrientedRectLike): XYInput {
  return isOrientedRectTuple(rect) ? rect[1] : rect.size;
}

/** oriented-rect input에서 angle을 읽는다. 단위는 radian. */
export function readOrientedRectAngle(rect: OrientedRectLike): number {
  return isOrientedRectTuple(rect) ? rect[2] : rect.angle;
}

/**
 * oriented-rect의 size 두 성분과 angle이 finite인지 검증한다.
 *
 * `width`, `height`, `angle` 중 하나라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. `width <= 0` 또는 `height <= 0`은 empty 판정에 쓰이므로 throw하지 않는다.
 * center 좌표는 검증하지 않고 산술 결과로 pass-through한다. 모든 public oriented-rect query가
 * 같은 실패 정책을 공유하도록 이 helper를 통해 size/angle을 검증한다.
 *
 * @param width 검증할 size width 성분
 * @param height 검증할 size height 성분
 * @param angle 검증할 회전각. 단위는 radian.
 */
export function validateOrientedRectSizeAndAngle(width: number, height: number, angle: number): void {
  if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(angle)) {
    throw new RangeError(
      `oriented rect size and angle must be finite numbers, got size (${String(width)}, ${String(height)}), angle ${String(angle)}`
    );
  }
}
