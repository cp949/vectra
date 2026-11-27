import type { EllipseLike, EllipseTuple, XYInput } from '../types';

import type { EllipseWritable } from '../types/flat-shapes.internal';

/** 반지름과 중심 좌표가 모두 0인 타원을 만든다. */
export function createZeroEllipse(): EllipseWritable {
  return { cx: 0, cy: 0, rx: 0, ry: 0 };
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
