/**
 * ray × shape 가장 가까운 hit의 ray parameter `t`를 scalar로 계산하는 internal kernel.
 *
 * 세 kernel은 모두 `origin + t * direction`의 `t ≥ tMin` 중 가장 작은 값을 반환한다.
 * hit이 없으면 `Infinity`를 반환한다.
 * 객체를 만들지 않으므로 광선 수백 개를 매 프레임 쏘는 hot path에서 쓴다.
 * non-finite 입력은 검증하지 않는다. 비교가 모두 false가 되어 `Infinity`로 끝나거나 hit 없음으로 처리된다.
 */

import { crossWithin } from './numeric';

/**
 * ray와 선분 (a, b)의 교점 t를 반환한다.
 *
 * 선분 파라미터 `u`는 `[0, 1]` closed 구간을 정확 비교한다. 끝점 접촉도 hit이다.
 * parallel(collinear 포함)이면 `Infinity`다. zero-length 선분과 zero direction도 parallel로 처리된다.
 *
 * @param ox ray origin x
 * @param oy ray origin y
 * @param dx ray direction x
 * @param dy ray direction y
 * @param ax 선분 시작점 x
 * @param ay 선분 시작점 y
 * @param bx 선분 끝점 x
 * @param by 선분 끝점 y
 * @param tMin 허용하는 가장 작은 t (inclusive)
 * @param epsilon parallel 판정 임계값. `undefined`이면 `sin θ <= 1e-9` 상대 비교, 명시하면 `|cross| <= epsilon` 절대 비교
 */
export function raySegmentHitTXY(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  tMin: number,
  epsilon: number | undefined
): number {
  const ex = bx - ax;
  const ey = by - ay;
  const cross = dx * ey - dy * ex;
  if (crossWithin(cross, epsilon, dx * dx + dy * dy, ex * ex + ey * ey)) return Infinity;

  const qx = ax - ox;
  const qy = ay - oy;
  const t = (qx * ey - qy * ex) / cross;
  const u = (qx * dy - qy * dx) / cross;
  // NaN은 모든 비교가 false라 hit 없음으로 떨어진다.
  return u >= 0 && u <= 1 && t >= tMin ? t : Infinity;
}

/**
 * ray와 ellipse boundary의 가장 가까운 교점 t를 반환한다.
 *
 * ellipse local 좌표로 정규화한 단위원 이차식을 푼다.
 * discriminant가 `±epsilon²` 안이면 tangent로 보고 접점 t 하나를 쓴다.
 * 두 root 중 `tMin` 이상인 작은 쪽을 고르므로, origin이 안쪽이면 exit 교점이 나온다.
 * empty ellipse(radius ≤ 0)와 zero direction은 `Infinity`다.
 *
 * @param ox ray origin x
 * @param oy ray origin y
 * @param dx ray direction x
 * @param dy ray direction y
 * @param cx ellipse center x
 * @param cy ellipse center y
 * @param rx ellipse x반지름
 * @param ry ellipse y반지름
 * @param tMin 허용하는 가장 작은 t (inclusive)
 * @param epsilon discriminant tangent 판정 임계값
 */
export function rayEllipseHitTXY(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tMin: number,
  epsilon: number
): number {
  if (rx <= 0 || ry <= 0) return Infinity;

  const u = (ox - cx) / rx;
  const v = (oy - cy) / ry;
  const du = dx / rx;
  const dv = dy / ry;
  const a = du * du + dv * dv;
  if (a === 0) return Infinity;

  const halfB = u * du + v * dv;
  const disc = halfB * halfB - a * (u * u + v * v - 1);
  if (disc < -epsilon * epsilon) return Infinity;

  if (disc <= epsilon * epsilon) {
    const tTangent = -halfB / a;
    return tTangent >= tMin ? tTangent : Infinity;
  }

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-halfB - sqrtDisc) / a;
  if (t1 >= tMin) return t1;
  const t2 = (-halfB + sqrtDisc) / a;
  return t2 >= tMin ? t2 : Infinity;
}

/**
 * ray와 axis-aligned box boundary의 가장 가까운 교점 t를 반환한다.
 *
 * slab 방식으로 box에 들어가는 `tNear`와 나오는 `tFar`를 구한다.
 * `tNear ≥ tMin`이면 `tNear`, 아니면 `tFar ≥ tMin`일 때 `tFar`다. origin이 box 안이면 exit이다.
 * box는 closed다. 모서리·변 접촉도 hit이다.
 * 호출자가 box가 비어 있지 않음을 보장한다(`x0 ≤ x1`, `y0 ≤ y1`). zero direction은 `Infinity`다.
 *
 * @param ox ray origin x
 * @param oy ray origin y
 * @param dx ray direction x
 * @param dy ray direction y
 * @param x0 box min corner x
 * @param y0 box min corner y
 * @param x1 box max corner x
 * @param y1 box max corner y
 * @param tMin 허용하는 가장 작은 t (inclusive)
 */
export function rayBoxHitTXY(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  tMin: number
): number {
  let tNear = -Infinity;
  let tFar = Infinity;

  if (dx === 0) {
    // 축에 평행한 ray는 slab 안에 있어야 한다. NaN origin도 여기서 거른다.
    if (!(ox >= x0 && ox <= x1)) return Infinity;
  } else {
    const ta = (x0 - ox) / dx;
    const tb = (x1 - ox) / dx;
    tNear = Math.min(ta, tb);
    tFar = Math.max(ta, tb);
  }

  if (dy === 0) {
    if (!(oy >= y0 && oy <= y1)) return Infinity;
    // 두 축 모두 평행하면 방향이 없다.
    if (dx === 0) return Infinity;
  } else {
    const ta = (y0 - oy) / dy;
    const tb = (y1 - oy) / dy;
    tNear = Math.max(tNear, Math.min(ta, tb));
    tFar = Math.min(tFar, Math.max(ta, tb));
  }

  // NaN이면 이 비교가 false라 hit 없음이다.
  if (!(tNear <= tFar)) return Infinity;
  if (tNear >= tMin) return tNear;
  return tFar >= tMin ? tFar : Infinity;
}
