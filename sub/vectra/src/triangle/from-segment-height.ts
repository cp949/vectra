import { createZeroTriangle } from '../internal/triangle';
import type { Segment, TriangleWritable } from '../types/flat-shapes.internal';
import { fromSegmentHeightInto } from './from-segment-height-into';

/**
 * fromSegmentHeightInto의 allocating companion. 성공 시 새 TriangleWritable을, 실패 시
 * undefined를 반환한다.
 *
 * 좌표 정의는 `fromSegmentHeightInto`와 동일하다.
 *
 * 실패 조건: base length가 0, NaN, Infinity 중 하나이면 undefined를 반환한다.
 * 음수 height는 clamp하지 않고 반대쪽에 apex를 만든다. NaN/Infinity height는 성공 분기를
 * 통과하면 apex 좌표에 그대로 전파된다 (예: `midpoint + 1 * Infinity = Infinity`,
 * `midpoint + 0 * Infinity = NaN`).
 *
 * @param base 첫 두 vertex로 쓸 segment input. length가 finite positive여야 한다.
 * @param height base midpoint에서 normal 방향으로 이동할 거리. 음수면 반대쪽 apex.
 * @param options `{ side: 'left' | 'right' }`. 옵션 객체를 생략하면 `side = 'left'`다.
 */
export function fromSegmentHeight(
  base: Segment,
  height: number,
  options?: { side: 'left' | 'right' }
): TriangleWritable | undefined {
  const out = createZeroTriangle();
  const result = fromSegmentHeightInto(out, base, height, options);
  return result === false ? undefined : out;
}
