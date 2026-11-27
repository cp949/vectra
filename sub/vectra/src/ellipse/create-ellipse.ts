import { createZeroEllipse } from '../internal/ellipse';
import type { EllipseWritable } from '../types/flat-shapes.internal';

/**
 * 원점 (0, 0), rx/ry 0인 zero ellipse writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `Ellipse`를 새 plain object로 복사하려면 `ellipseFrom`을 사용한다.
 */
export function createEllipse(): EllipseWritable {
  return createZeroEllipse();
}
