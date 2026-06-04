/**
 * line-family (segment, ray, infinite-line) × circle/rect crop 계산용 internal helper.
 *
 * parametric line `origin + t * direction`를 shape 내부 구간으로 자르고, line-family range로
 * clip한 뒤 bounded segment endpoint를 writable output에 기록한다. degenerate direction,
 * empty shape, tangent(zero-length clip)는 모두 실패(`false`)로 통일한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { SegmentWritable, XYWritable } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import { getLineFamilyOwnRangeInterval } from './line-family-range.internal';
import { writeXY } from './xy';

/** origin/direction 좌표가 모두 finite이면 true. non-finite는 valid bounded segment를 만들 수 없다. */
function isFiniteLine(ox: number, oy: number, dx: number, dy: number): boolean {
  return Number.isFinite(ox) && Number.isFinite(oy) && Number.isFinite(dx) && Number.isFinite(dy);
}

/** parametric 축에서 shape 내부 구간 `[lo, hi]`. */
export interface LineFamilyCropInterval {
  /** 구간 시작 parameter */
  lo: number;

  /** 구간 끝 parameter */
  hi: number;
}

/**
 * disk 내부에 들어가는 parametric 구간을 반환한다. tangent/no-hit이면 null.
 *
 * 전제: `lenSq = dx*dx + dy*dy > 0` (caller가 degenerate direction을 먼저 거른다).
 * disc <= 0(접점 single point 또는 교점 없음)은 길이 0 구간이므로 null로 통일한다.
 */
function circleCropInterval(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  r: number
): LineFamilyCropInterval | null {
  const qx = ox - cx;
  const qy = oy - cy;
  const lenSq = dx * dx + dy * dy;
  const b = qx * dx + qy * dy;
  const c = qx * qx + qy * qy - r * r;
  const disc = b * b - lenSq * c;
  if (!(disc > 0)) return null;
  const sqrtDisc = Math.sqrt(disc);
  return { lo: (-b - sqrtDisc) / lenSq, hi: (-b + sqrtDisc) / lenSq };
}

/**
 * axis-aligned box 내부에 들어가는 parametric 구간을 Liang-Barsky로 반환한다. 교점 없으면 null.
 *
 * 전제: `lenSq > 0`이고 box가 비어 있지 않다(`x0 < x1`, `y0 < y1`).
 * slab과 평행하면서 바깥(`q < 0`)이면 null. 결과 구간 길이가 0 이하이면 null.
 */
function rectCropInterval(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): LineFamilyCropInterval | null {
  let lo = Number.NEGATIVE_INFINITY;
  let hi = Number.POSITIVE_INFINITY;

  // 각 slab 제약 p*t <= q를 누적한다. p === 0이면 slab과 평행하므로 q < 0일 때만 바깥이다.
  const constraints: readonly [p: number, q: number][] = [
    [-dx, ox - x0],
    [dx, x1 - ox],
    [-dy, oy - y0],
    [dy, y1 - oy],
  ];
  for (const [p, q] of constraints) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) {
      if (t > lo) lo = t;
    } else if (t < hi) {
      hi = t;
    }
  }

  if (!(lo < hi)) return null;
  return { lo, hi };
}

/**
 * shape 내부 구간을 line-family range로 clip한 뒤 bounded segment를 out에 기록하고 true를 반환한다.
 *
 * clip 결과 길이가 0 이하이거나 NaN이면 false를 반환하고 out을 수정하지 않는다.
 * endpoint 순서는 source direction의 increasing t를 따른다.
 */
function writeClippedCropInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  interval: LineFamilyCropInterval
): boolean {
  const own = getLineFamilyOwnRangeInterval(kind);
  const lo = Math.max(interval.lo, own.lo);
  const hi = Math.min(interval.hi, own.hi);
  // strict 비교로 zero-length clip과 NaN(non-finite 좌표 전파)을 모두 실패로 거른다.
  if (!(hi > lo)) return false;
  const ax = ox + lo * dx;
  const ay = oy + lo * dy;
  const bx = ox + hi * dx;
  const by = oy + hi * dy;
  if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) return false;
  writeXY(out.a, ax, ay);
  writeXY(out.b, bx, by);
  return true;
}

/**
 * line-family를 circle boundary로 crop한 결과 segment를 out에 기록하고 true를 반환한다.
 *
 * radius가 finite positive가 아니거나 degenerate direction(`lenSq === 0`)이면 false.
 * tangent(single contact)나 disk와 만나지 않으면 false. 실패 시 out을 수정하지 않는다.
 * out과 source가 좌표를 공유해도 안전하다(caller가 좌표를 먼저 읽어 넘긴다).
 *
 * @param out crop된 segment를 기록할 writable output
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind (segment/ray/infinite-line)
 * @param cx circle 중심 x
 * @param cy circle 중심 y
 * @param r circle 반지름
 */
export function cropLineFamilyByCircleInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  cx: number,
  cy: number,
  r: number
): boolean {
  if (!(r > 0) || !Number.isFinite(r)) return false;
  if (!isFiniteLine(ox, oy, dx, dy) || !Number.isFinite(cx) || !Number.isFinite(cy)) return false;
  if (dx * dx + dy * dy === 0) return false;
  const interval = circleCropInterval(ox, oy, dx, dy, cx, cy, r);
  if (interval === null) return false;
  return writeClippedCropInto(out, ox, oy, dx, dy, kind, interval);
}

/**
 * line-family를 axis-aligned rect boundary로 crop한 결과 segment를 out에 기록하고 true를 반환한다.
 *
 * empty rect(`width <= 0` 또는 `height <= 0`), non-finite/overflow extent, degenerate direction이면 false.
 * box와 만나지 않거나 clip 길이가 0이면 false. 실패 시 out을 수정하지 않는다.
 * out과 source가 좌표를 공유해도 안전하다(caller가 좌표를 먼저 읽어 넘긴다).
 *
 * @param out crop된 segment를 기록할 writable output
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind (segment/ray/infinite-line)
 * @param rx rect 왼쪽 x
 * @param ry rect 위쪽 y
 * @param rw rect 너비
 * @param rh rect 높이
 */
export function cropLineFamilyByRectInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  if (!(rw > 0) || !(rh > 0) || !Number.isFinite(rw) || !Number.isFinite(rh)) return false;
  if (!isFiniteLine(ox, oy, dx, dy) || !Number.isFinite(rx) || !Number.isFinite(ry)) return false;
  if (dx * dx + dy * dy === 0) return false;
  const x1 = rx + rw;
  const y1 = ry + rh;
  if (!Number.isFinite(x1) || !Number.isFinite(y1)) return false;
  const interval = rectCropInterval(ox, oy, dx, dy, rx, ry, x1, y1);
  if (interval === null) return false;
  return writeClippedCropInto(out, ox, oy, dx, dy, kind, interval);
}
