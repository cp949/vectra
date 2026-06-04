import type { BoundsSweepDetail } from '../types';

/**
 * no-hit sweep 결과를 out에 기록하고 out을 반환한다.
 *
 * no-hit은 `hit: false`, `time: Infinity`, `normal (0, 0)`, `contact (NaN, NaN)`, `startOverlap: false`다.
 * target 빗나감, zero-velocity non-overlap, non-finite 입력, empty/inverted bounds가 모두 no-hit다.
 *
 * @param out 결과를 기록할 BoundsSweepDetail output
 */
export function writeBoundsSweepNoHit(out: BoundsSweepDetail): BoundsSweepDetail {
  out.hit = false;
  out.time = Number.POSITIVE_INFINITY;
  out.normal.x = 0;
  out.normal.y = 0;
  out.contact.x = Number.NaN;
  out.contact.y = Number.NaN;
  out.startOverlap = false;
  return out;
}

/**
 * moving point를 velocity로 stationary box에 sweep한 closed-boundary time-of-impact를 out에 기록한다.
 *
 * 호출자는 px/py/vx/vy가 finite이고 box가 `minX < maxX && minY < maxY`로 유효함을 보장한다.
 * sweep 비율은 `t ∈ [0, 1]`이다. 시작 시 box에 overlap(closed)이면 start-overlap(`time: 0`)을 기록하고
 * contact는 moving point 자체로 둔다. proper hit은 `time` 시점의 moving point 좌표를 contact로 쓰고
 * 마지막으로 진입한 axis의 outward normal을 기록한다. x/y가 같은 `time`에 진입하는 corner는 x axis를 고른다.
 * box를 빗나가거나 sweep 종료 후에 닿으면 no-hit을 기록한다. `boundsSweepBounds*`는 Minkowski expanded box와
 * moving bounds center를 px/py로 넘겨 같은 helper를 재사용한다.
 *
 * @param out 결과를 기록할 BoundsSweepDetail output
 * @param px moving point 시작 x
 * @param py moving point 시작 y
 * @param vx sweep velocity x
 * @param vy sweep velocity y
 * @param minX box 최소 x
 * @param minY box 최소 y
 * @param maxX box 최대 x
 * @param maxY box 최대 y
 */
export function sweepPointAgainstBox(
  out: BoundsSweepDetail,
  px: number,
  py: number,
  vx: number,
  vy: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): BoundsSweepDetail {
  // 시작 시 closed box에 overlap이면 start-overlap. zero-velocity inside도 이 분기로 처리된다.
  if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
    out.hit = true;
    out.time = 0;
    out.normal.x = 0;
    out.normal.y = 0;
    out.contact.x = px;
    out.contact.y = py;
    out.startOverlap = true;
    return out;
  }

  const x = axisSlab(px, vx, minX, maxX);
  const y = axisSlab(py, vy, minY, maxY);
  if (x === null || y === null) return writeBoundsSweepNoHit(out);

  const enter = Math.max(x.enter, y.enter);
  const exit = Math.min(x.exit, y.exit);
  // closed boundary: enter === exit인 grazing touch도 hit. sweep 범위 [0, 1] 밖이면 no-hit.
  if (enter > exit || enter > 1 || exit < 0) return writeBoundsSweepNoHit(out);

  out.hit = true;
  out.time = enter;
  // 마지막으로 진입한 axis가 충돌 면이다. tie는 x axis를 고른다. 결정 axis는 velocity가 0이 아니다.
  if (x.enter >= y.enter) {
    out.normal.x = vx > 0 ? -1 : 1;
    out.normal.y = 0;
  } else {
    out.normal.x = 0;
    out.normal.y = vy > 0 ? -1 : 1;
  }
  out.contact.x = px + vx * enter;
  out.contact.y = py + vy * enter;
  out.startOverlap = false;
  return out;
}

/**
 * 한 axis의 slab 진입/이탈 sweep 비율을 반환한다. slab에 절대 들어가지 못하면 null.
 *
 * velocity가 0이면 좌표가 slab 안일 때만 `[-Infinity, Infinity]`, 밖이면 null이다.
 */
function axisSlab(p: number, v: number, min: number, max: number): { enter: number; exit: number } | null {
  if (v === 0) {
    if (p < min || p > max) return null;
    return { enter: Number.NEGATIVE_INFINITY, exit: Number.POSITIVE_INFINITY };
  }
  const t1 = (min - p) / v;
  const t2 = (max - p) / v;
  return t1 <= t2 ? { enter: t1, exit: t2 } : { enter: t2, exit: t1 };
}
