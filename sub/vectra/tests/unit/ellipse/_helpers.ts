import type { BoundsWritable, EllipseWritable } from '../../../src/types';

export function makeEllipse(cx = 0, cy = 0, rx = 0, ry = 0): EllipseWritable {
  return { center: { x: cx, y: cy }, radiusX: rx, radiusY: ry };
}

export function makeBoundsOut(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}
