import type { EllipseWritable } from '../types';

/**
 * 원점 (0, 0), radiusX/radiusY 0인 zero ellipse writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `EllipseLike`를 새 plain object로 복사하려면 `ellipseFrom`을 사용한다.
 */
export function createEllipse(): EllipseWritable {
  return { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 0 };
}
