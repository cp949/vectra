import type {
  EllipseLike,
  EllipseTuple,
  EllipseWritable,
  RotatedEllipseLike,
  RotatedEllipseTuple,
  XYInput,
} from '../types';

import type { EllipseWritable as FlatEllipseWritable } from '../types/flat-shapes.internal';

/** 반지름과 중심 좌표가 모두 0인 타원을 만든다. */
export function createZeroEllipse(): FlatEllipseWritable {
  return { cx: 0, cy: 0, rx: 0, ry: 0 };
}

// v2-migration: 남은 ellipse companion 전환이 끝나면 제거한다.
export function createLegacyEllipse(): EllipseWritable {
  return { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 0 };
}

function isEllipseTuple(ellipse: EllipseLike): ellipse is EllipseTuple {
  return Array.isArray(ellipse);
}

/** ellipse input에서 중심점을 읽는다. */
export function readEllipseCenter(ellipse: EllipseLike): XYInput {
  return isEllipseTuple(ellipse) ? ellipse[0] : ellipse.center;
}

/** ellipse input에서 x축 반지름을 읽는다. */
export function readEllipseRadiusX(ellipse: EllipseLike): number {
  return isEllipseTuple(ellipse) ? ellipse[1] : ellipse.radiusX;
}

/** ellipse input에서 y축 반지름을 읽는다. */
export function readEllipseRadiusY(ellipse: EllipseLike): number {
  return isEllipseTuple(ellipse) ? ellipse[2] : ellipse.radiusY;
}

function isRotatedEllipseTuple(ellipse: RotatedEllipseLike): ellipse is RotatedEllipseTuple {
  return Array.isArray(ellipse);
}

/** rotated ellipse input에서 중심점을 읽는다. */
export function readRotatedEllipseCenter(ellipse: RotatedEllipseLike): XYInput {
  return isRotatedEllipseTuple(ellipse) ? ellipse[0] : ellipse.center;
}

/** rotated ellipse input에서 local x축 반지름을 읽는다. */
export function readRotatedEllipseRadiusX(ellipse: RotatedEllipseLike): number {
  return isRotatedEllipseTuple(ellipse) ? ellipse[1] : ellipse.radiusX;
}

/** rotated ellipse input에서 local y축 반지름을 읽는다. */
export function readRotatedEllipseRadiusY(ellipse: RotatedEllipseLike): number {
  return isRotatedEllipseTuple(ellipse) ? ellipse[2] : ellipse.radiusY;
}

/** rotated ellipse input에서 rotation(radian)을 읽는다. */
export function readRotatedEllipseRotation(ellipse: RotatedEllipseLike): number {
  return isRotatedEllipseTuple(ellipse) ? ellipse[3] : ellipse.rotation;
}
