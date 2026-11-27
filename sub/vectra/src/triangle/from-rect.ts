import { createZeroTriangle } from '../internal/triangle';
import type { Rect, TriangleWritable } from '../types/flat-shapes.internal';
import { fromRectInto } from './from-rect-into';

/**
 * fromRectInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `fromRectInto`와 동일하다.
 * - a = (x, y), b = (x + width, y), c = (x, y + height).
 *
 * `width = 0` 또는 `height = 0`은 degenerate triangle을 기록한다. 음수 width / height는
 * clamp하지 않고 JS 산술 결과를 따른다. NaN/Infinity component는 validation 없이 JS 산술
 * 결과를 그대로 기록한다.
 *
 * @param rect 세 corner를 읽을 rect 객체.
 */
export function fromRect(rect: Rect): TriangleWritable {
  const out = createZeroTriangle();
  return fromRectInto(out, rect);
}
