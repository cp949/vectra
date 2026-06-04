import { readOrientedRectQueryFrame } from '../internal/oriented-rect-query';
import { readX, readY, writeXY } from '../internal/xy';
import type { OrientedRectLike, XYInput, XYWritable } from '../types';

/**
 * oriented rect 내부 또는 boundary에서 point와 가장 가까운 점을 out에 기록한다.
 *
 * point를 rect local-space로 변환한 뒤 local 좌표를 `[-width/2, width/2]`, `[-height/2, height/2]`에
 * clamp하고 다시 world-space로 되돌려 기록한다. axis convention은 `xAxis=(cos, sin)`,
 * `yAxis=(-sin, cos)`다. 내부 또는 boundary point는 clamp가 일어나지 않아 input point 좌표와 같은
 * 위치를 기록한다. 성공하면 true를 반환한다.
 *
 * `size.x <= 0 || size.y <= 0`인 empty oriented rect는 false를 반환하고 out을 수정하지 않는다.
 * size 두 성분이나 angle이 non-finite이면 `RangeError`이며 no-mutation을 보장하지 않는다.
 * center 또는 point 좌표 non-finite는 검증하지 않고 산술 결과를 그대로 기록한다(`NaN`/무한대 가능).
 * center/size/angle/point/clamp 결과를 모두 먼저 확정한 뒤 기록하므로 out이 rect.center, size,
 * point와 같은 object여도 안전하다.
 *
 * @param out closest point를 기록할 writable output
 * @param rect closest point를 탐색할 oriented rect
 * @param point closest point를 탐색할 기준 point
 */
export function closestPointInto(out: XYWritable, rect: OrientedRectLike, point: XYInput): boolean {
  const frame = readOrientedRectQueryFrame(rect);
  if (frame.width <= 0 || frame.height <= 0) return false;

  // aliasing 안전 - out 기록 전에 모든 입력과 clamp 결과를 local 변수로 확정한다
  const px = readX(point);
  const py = readY(point);
  const dx = px - frame.cx;
  const dy = py - frame.cy;
  const localX = dx * frame.cos + dy * frame.sin;
  const localY = -dx * frame.sin + dy * frame.cos;
  const clampedX = Math.min(frame.hw, Math.max(-frame.hw, localX));
  const clampedY = Math.min(frame.hh, Math.max(-frame.hh, localY));

  // local → world
  const wx = frame.cx + clampedX * frame.cos - clampedY * frame.sin;
  const wy = frame.cy + clampedX * frame.sin + clampedY * frame.cos;
  writeXY(out, wx, wy);
  return true;
}
