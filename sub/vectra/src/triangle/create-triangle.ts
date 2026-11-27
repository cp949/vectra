import { createZeroTriangle } from '../internal/triangle';
import type { TriangleWritable } from '../types/flat-shapes.internal';

/**
 * 세 꼭짓점이 원점인 triangle 객체를 새로 만든다.
 *
 * 인자를 받지 않는다. 기존 triangle을 복사하려면 triangleFrom을 사용한다.
 */
export function createTriangle(): TriangleWritable {
  return createZeroTriangle();
}
