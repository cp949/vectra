import type { TriangleLike, TriangleWritable, XYInput } from '../types';
import { copyInto } from './copy-into';

/** copyInto의 allocating companion. 새 TriangleWritable을 반환한다. */
export function triangleFrom(triangle: TriangleLike): TriangleWritable;
/** copyInto의 allocating companion. 세 XYInput으로 새 TriangleWritable을 반환한다. */
export function triangleFrom(a: XYInput, b: XYInput, c: XYInput): TriangleWritable;
export function triangleFrom(triangleOrA: TriangleLike | XYInput, b?: XYInput, c?: XYInput): TriangleWritable {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };

  if (b !== undefined && c !== undefined) {
    return copyInto(out, triangleOrA as XYInput, b, c);
  }
  return copyInto(out, triangleOrA as TriangleLike);
}
