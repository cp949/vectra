import type { BoundsSweepDetail } from '../types';
import type { Bounds, Point } from '../types/flat-shapes.internal';
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
 * no-hit이다. 입력 좌표는 출력에 쓰기 전에 읽는다. out의 nested `normal`/`contact` object에 좌표를 덮어쓴다.
 *
 * @param out 충돌 여부와 시각을 기록할 BoundsSweepDetail. normal·contact의 `{ x, y }`에 좌표를 덮어쓴다
 * @param moving sweep 시작 위치의 moving bounds
 * @param velocity sweep velocity. `t ∈ [0, 1]` 동안 moving bounds가 이동하는 변위
 * @param target sweep 대상 stationary bounds
 */
export function boundsSweepBoundsInto<Out extends BoundsSweepDetail>(
  out: Out,
  moving: Bounds,
  velocity: Point,
  target: Bounds
): Out {
  const mMinX = moving.minX;
  const mMinY = moving.minY;
  const mMaxX = moving.maxX;
  const mMaxY = moving.maxY;
  const vx = velocity.x;
  const vy = velocity.y;
  const tMinX = target.minX;
  const tMinY = target.minY;
  const tMaxX = target.maxX;
  const tMaxY = target.maxY;

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
