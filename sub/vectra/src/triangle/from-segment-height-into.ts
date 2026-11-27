import type { Segment, TriangleWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * base segment와 height로 isosceles triangle을 만들어 out에 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - (x1, y1) = 첫 끝점
 * - (x2, y2) = 둘째 끝점
 * - apex((x3, y3))는 base midpoint에서 base normal 방향으로 `height`만큼 이동한 점.
 * - `side: 'left'` (기본): normal = (-dy / len, dx / len)
 * - `side: 'right'`: normal = (dy / len, -dx / len)
 *
 * 실패 조건: base length가 0, NaN, Infinity 중 하나이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 조건: base length가 finite positive면 out에 기록하고 out을 반환한다.
 *
 * 음수 height는 clamp하지 않고 반대쪽에 apex를 만든다. NaN/Infinity height는 성공 분기를
 * 통과하면 apex 좌표에 그대로 전파된다 (예: `midpoint + 1 * Infinity = Infinity`,
 * `midpoint + 0 * Infinity = NaN`).
 *
 * 입력 좌표를 먼저 읽은 뒤 결과를 기록한다.
 * 같은 object여도 안전하다.
 *
 * @param out 삼각형 vertex를 기록할 triangle 객체
 * @param base 첫 두 vertex로 쓸 segment input. length가 finite positive여야 한다.
 * @param height base midpoint에서 normal 방향으로 이동할 거리. 음수면 반대쪽 apex.
 * @param options `{ side: 'left' | 'right' }`. 기본 `side = 'left'`.
 */
export function fromSegmentHeightInto<Out extends TriangleWritable>(
  out: Out,
  base: Segment,
  height: number,
  options?: { side: 'left' | 'right' }
): Out | false {
  const { x1: ax, y1: ay, x2: bx, y2: by } = base;

  const dx = bx - ax;
  const dy = by - ay;
  const len = hypot2(dx, dy);

  // base length가 0이거나 non-finite면 normal을 정의할 수 없다
  if (!Number.isFinite(len) || len === 0) {
    return false;
  }

  const side = options === undefined ? 'left' : options.side;
  const nx = side === 'right' ? dy / len : -dy / len;
  const ny = side === 'right' ? -dx / len : dx / len;

  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const cx = mx + nx * height;
  const cy = my + ny * height;

  out.x1 = ax;
  out.y1 = ay;
  out.x2 = bx;
  out.y2 = by;
  out.x3 = cx;
  out.y3 = cy;

  return out;
}
