import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, BoundsSweepDetail, XYInput } from '../types';
import { sweepPointAgainstBox, writeBoundsSweepNoHit } from './bounds-sweep.internal';

/**
 * moving bounds를 velocity로 stationary target bounds에 sweep한 time-of-impact를 out에 기록하고 out을 반환한다.
 *
 * Minkowski expansion으로 target을 moving bounds half-extent만큼 키운 뒤 moving bounds center를 point로
 * sweep한다. closed-boundary sweep이며 sweep 비율은 `t ∈ [0, 1]`이다. success/failure 모두 out에 full result를
 * 기록한다. no-hit도 valid result다(`hit: false`, `time: Infinity`, `normal (0, 0)`, `contact (NaN, NaN)`).
 * 시작 시 moving bounds가 target에 overlap(closed)이면 start-overlap(`time: 0`, `startOverlap: true`,
 * `normal (0, 0)`)이고 contact는 moving bounds center다. proper hit의 contact는 expanded-space hit point가 아니라
 * hit 시점 moving bounds center다. zero velocity는 시작 overlap이면 start-overlap, 아니면 no-hit이다. x/y가 같은
 * time에 진입하는 corner는 x axis normal로 tie를 고정한다. non-finite 입력, empty/inverted moving·target bounds는
 * no-hit이다. out과 input은 별개 object를 권장한다. out의 nested `normal`/`contact` object에 좌표를 덮어쓴다.
 *
 * @param out 결과를 기록할 BoundsSweepDetail output. nested normal/contact object에 좌표를 덮어쓴다
 * @param moving sweep 시작 위치의 moving bounds
 * @param velocity sweep velocity. `t ∈ [0, 1]` 동안 moving bounds가 이동하는 변위
 * @param target sweep 대상 stationary bounds
 */
export function boundsSweepBoundsInto(
  out: BoundsSweepDetail,
  moving: BoundsLike,
  velocity: XYInput,
  target: BoundsLike
): BoundsSweepDetail {
  const mMin = readBoundsMin(moving);
  const mMax = readBoundsMax(moving);
  const mMinX = readX(mMin);
  const mMinY = readY(mMin);
  const mMaxX = readX(mMax);
  const mMaxY = readY(mMax);
  const vx = readX(velocity);
  const vy = readY(velocity);
  const tMin = readBoundsMin(target);
  const tMax = readBoundsMax(target);
  const tMinX = readX(tMin);
  const tMinY = readY(tMin);
  const tMaxX = readX(tMax);
  const tMaxY = readY(tMax);

  if (!Number.isFinite(mMinX) || !Number.isFinite(mMinY) || !Number.isFinite(mMaxX) || !Number.isFinite(mMaxY)) {
    return writeBoundsSweepNoHit(out);
  }
  if (!Number.isFinite(vx) || !Number.isFinite(vy)) return writeBoundsSweepNoHit(out);
  if (!Number.isFinite(tMinX) || !Number.isFinite(tMinY) || !Number.isFinite(tMaxX) || !Number.isFinite(tMaxY)) {
    return writeBoundsSweepNoHit(out);
  }
  if (!(mMaxX > mMinX && mMaxY > mMinY)) return writeBoundsSweepNoHit(out);
  if (!(tMaxX > tMinX && tMaxY > tMinY)) return writeBoundsSweepNoHit(out);

  // moving bounds center를 point로, half-extent만큼 키운 target을 box로 환원한다.
  const cx = (mMinX + mMaxX) / 2;
  const cy = (mMinY + mMaxY) / 2;
  const hx = (mMaxX - mMinX) / 2;
  const hy = (mMaxY - mMinY) / 2;
  return sweepPointAgainstBox(out, cx, cy, vx, vy, tMinX - hx, tMinY - hy, tMaxX + hx, tMaxY + hy);
}
