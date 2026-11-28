import type { EllipseWritable } from '../types/flat-shapes.internal';

/** 반지름과 중심 좌표가 모두 0인 타원을 만든다. */
export function createZeroEllipse(): EllipseWritable {
  return { cx: 0, cy: 0, rx: 0, ry: 0 };
}
