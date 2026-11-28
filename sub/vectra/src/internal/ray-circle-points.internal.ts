/**
 * ray × circle 교점 scalar kernel.
 *
 * `rayCircleIntersectionsInto`만 호출한다.
 * `lineFamilyEllipseIntersectionPoints`의 `rx === ry` 경우와 같은 식, 같은 판정 순서로 계산한다.
 * 결과 buffer(`solveLineFamilyEllipse`의 scratch)를 거치지 않고 root에서 바로 점을 만든다.
 */

import type { PointWritable } from '../types/flat-shapes.internal';

/**
 * ray (ox, oy, dx, dy)와 circle 둘레의 range(`t ≥ 0`) 안 교점을 `t` 오름차순으로 outPoints에 push한다.
 *
 * outPoints를 먼저 비운다. 매 교점마다 새 `{ x, y }` object를 만든다.
 * empty circle, zero direction, 교점 없음, contained interior는 빈 배열이다.
 *
 * @param outPoints 교점 object를 기록할 array
 * @param ox ray origin x
 * @param oy ray origin y
 * @param dx ray direction x
 * @param dy ray direction y
 * @param cx circle center x
 * @param cy circle center y
 * @param r circle 반지름
 * @param epsilon discriminant tangent 판정 임계값
 */
export function rayCirclePointsInto(
  outPoints: PointWritable[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  r: number,
  epsilon: number
): PointWritable[] {
  outPoints.length = 0;
  if (r <= 0) return outPoints;

  const u = (ox - cx) / r;
  const v = (oy - cy) / r;
  const du = dx / r;
  const dv = dy / r;
  const a = du * du + dv * dv;
  const halfB = u * du + v * dv;
  const c = u * u + v * v - 1;
  if (a === 0) return outPoints;

  const disc = halfB * halfB - a * c;
  const epsSq = epsilon * epsilon;
  if (disc < -epsSq) return outPoints;

  if (disc <= epsSq) {
    const t = -halfB / a;
    if (Number.isFinite(t) && t >= 0) outPoints.push({ x: ox + t * dx, y: oy + t * dy });
    return outPoints;
  }

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-halfB - sqrtDisc) / a;
  const t2 = (-halfB + sqrtDisc) / a;
  if (Number.isFinite(t1) && t1 >= 0) outPoints.push({ x: ox + t1 * dx, y: oy + t1 * dy });
  if (Number.isFinite(t2) && t2 >= 0) outPoints.push({ x: ox + t2 * dx, y: oy + t2 * dy });
  return outPoints;
}
