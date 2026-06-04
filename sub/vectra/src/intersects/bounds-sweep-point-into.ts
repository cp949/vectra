import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, BoundsSweepDetail, XYInput } from '../types';
import { sweepPointAgainstBox, writeBoundsSweepNoHit } from './bounds-sweep.internal';

/**
 * moving point를 velocity로 stationary target bounds에 sweep한 time-of-impact를 out에 기록하고 out을 반환한다.
 *
 * closed-boundary sweep이며 sweep 비율은 `t ∈ [0, 1]`이다. success/failure 모두 out에 full result를 기록한다.
 * no-hit도 valid result다(`hit: false`, `time: Infinity`, `normal (0, 0)`, `contact (NaN, NaN)`).
 * 시작 시 point가 target에 overlap(closed)이면 start-overlap(`time: 0`, `startOverlap: true`, `normal (0, 0)`)이고
 * contact는 moving point 자체다. zero velocity는 시작 overlap이면 start-overlap, 아니면 no-hit이다.
 * proper hit은 마지막으로 진입한 axis의 outward normal과 hit 시점 point 좌표를 기록하고, x/y가 같은 time에
 * 진입하는 corner는 x axis normal로 tie를 고정한다. non-finite point/velocity/target, empty/inverted target은 no-hit이다.
 * out과 input은 별개 object를 권장한다. out의 nested `normal`/`contact` object에 좌표를 덮어쓴다.
 *
 * @param out 결과를 기록할 BoundsSweepDetail output. nested normal/contact object에 좌표를 덮어쓴다
 * @param point sweep 시작 위치의 moving point
 * @param velocity sweep velocity. `t ∈ [0, 1]` 동안 point가 이동하는 변위
 * @param target sweep 대상 stationary bounds
 */
export function boundsSweepPointInto(
  out: BoundsSweepDetail,
  point: XYInput,
  velocity: XYInput,
  target: BoundsLike
): BoundsSweepDetail {
  const px = readX(point);
  const py = readY(point);
  const vx = readX(velocity);
  const vy = readY(velocity);
  const tMin = readBoundsMin(target);
  const tMax = readBoundsMax(target);
  const minX = readX(tMin);
  const minY = readY(tMin);
  const maxX = readX(tMax);
  const maxY = readY(tMax);

  if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(vx) || !Number.isFinite(vy)) {
    return writeBoundsSweepNoHit(out);
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return writeBoundsSweepNoHit(out);
  }
  if (!(maxX > minX && maxY > minY)) return writeBoundsSweepNoHit(out);

  return sweepPointAgainstBox(out, px, py, vx, vy, minX, minY, maxX, maxY);
}
