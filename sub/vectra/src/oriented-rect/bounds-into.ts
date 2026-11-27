import { validateOrientedRectSizeAndAngle } from '../internal/oriented-rect';
import type { BoundsWritable, OrientedRect } from '../types/flat-shapes.internal';

/**
 * oriented rect를 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * 회전된 corner의 min/max로 AABB를 구한다. center 기준 half-extent는
 * `ex = |hw*cos| + |hh*sin|`, `ey = |hw*sin| + |hh*cos|`이며 `(minX, minY) = (cx - ex, cy - ey)`,
 * `(maxX, maxY) = (cx + ex, cy + ey)`다. `width <= 0 || height <= 0`인 empty oriented rect는 sentinel empty
 * bounds(`minX = minY = Infinity`, `maxX = maxY = -Infinity`)를 기록한다. width, height, angle 중
 * 하나가 non-finite이면 `RangeError`다. center 좌표 non-finite는 검증하지 않고 산술 결과를 따른다.
 * source 값을 먼저 모두 읽으므로 input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param rect bounds로 변환할 oriented rect
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, rect: OrientedRect): Out {
  // aliasing 안전 - 모든 입력 값을 먼저 읽은 후 기록한다
  const { cx, cy, width, height, angle } = rect;
  validateOrientedRectSizeAndAngle(width, height, angle);

  if (width <= 0 || height <= 0) {
    // empty oriented rect는 sentinel empty bounds를 기록한다
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  const hw = width / 2;
  const hh = height / 2;
  const ex = Math.abs(hw * Math.cos(angle)) + Math.abs(hh * Math.sin(angle));
  const ey = Math.abs(hw * Math.sin(angle)) + Math.abs(hh * Math.cos(angle));

  out.minX = cx - ex;
  out.minY = cy - ey;
  out.maxX = cx + ex;
  out.maxY = cy + ey;
  return out;
}
