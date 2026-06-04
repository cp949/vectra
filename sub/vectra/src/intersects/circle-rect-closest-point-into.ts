import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, RectLike, XYWritable } from '../types';

/**
 * circle center와 rect area 사이의 closest point를 out에 기록하고 true를 반환한다.
 *
 * center가 rect 밖이면 rect로 axis clamp한 point, rect boundary 위면 그 point, rect 내부면 가장 가까운
 * boundary point를 반환한다. closest point는 항상 rect 위 또는 내부다. radius는 입력 validation에만 쓰고
 * 결과 point에는 반영하지 않는다(반지름 offset closest pair나 penetration point를 만들지 않는다).
 * 내부 center의 boundary tie는 left, right, top, bottom 순서로 deterministic하게 고정한다(같은 거리면 앞쪽 우선).
 * empty rect(width ≤ 0 또는 height ≤ 0), non-finite rect, non-finite circle center, negative/non-finite radius는
 * `false`를 반환하고 out을 수정하지 않는다.
 *
 * @param out closest point 좌표를 기록할 writable output. 실패 시 수정하지 않는다
 * @param circle closest point 기준 circle. center만 위치 계산에 쓰고 radius는 validation에만 쓴다
 * @param rect closest point 대상 rect (axis-aligned)
 */
export function circleRectClosestPointInto(out: XYWritable, circle: CircleLike, rect: RectLike): boolean {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (!(rw > 0 && rh > 0)) return false;
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  if (!Number.isFinite(rx) || !Number.isFinite(ry)) return false;

  const radius = readCircleRadius(circle);
  if (!Number.isFinite(radius) || radius < 0) return false;

  const center = readCircleCenter(circle);
  const cx = readX(center);
  const cy = readY(center);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return false;

  const minX = rx;
  const minY = ry;
  const maxX = rx + rw;
  const maxY = ry + rh;

  // boundary 포함 외부면 axis clamp가 closest point다. boundary 위 center도 이 분기로 자기 자신을 반환한다.
  if (cx <= minX || cx >= maxX || cy <= minY || cy >= maxY) {
    writeXY(out, clamp(cx, minX, maxX), clamp(cy, minY, maxY));
    return true;
  }

  // strict 내부: 가장 가까운 boundary edge로 투영한다. tie는 left, right, top, bottom 순서로 고정한다.
  const dLeft = cx - minX;
  const dRight = maxX - cx;
  const dTop = cy - minY;
  const dBottom = maxY - cy;

  let best = dLeft;
  let px = minX;
  let py = cy;
  if (dRight < best) {
    best = dRight;
    px = maxX;
    py = cy;
  }
  if (dTop < best) {
    best = dTop;
    px = cx;
    py = minY;
  }
  if (dBottom < best) {
    best = dBottom;
    px = cx;
    py = maxY;
  }

  writeXY(out, px, py);
  return true;
}

/** v를 [min, max]로 clamp한다. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(v, max));
}
