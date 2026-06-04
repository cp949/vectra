import type { SegmentLike, TriangleWritable } from '../types';
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
 * aliasing: base 좌표를 모두 local에 먼저 읽으므로 base endpoint가 결과 triangle vertex
 * storage와 같은 object여도 안전하다(companion은 자체 storage를 새로 만든다).
 *
 * @param base 첫 두 vertex로 쓸 segment input. length가 finite positive여야 한다.
 * @param height base midpoint에서 normal 방향으로 이동할 거리. 음수면 반대쪽 apex.
 * @param options `{ side?: 'left' | 'right' }`. 기본 `side = 'left'`.
 */
export function fromSegmentHeight(
  base: SegmentLike,
  height: number,
  options?: { side?: 'left' | 'right' }
): TriangleWritable | undefined {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  const result = fromSegmentHeightInto(out, base, height, options);
  return result === false ? undefined : out;
}
