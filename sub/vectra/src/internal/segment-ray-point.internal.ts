/**
 * segment × ray 단일 교점 scalar kernel.
 *
 * `singleIntersectionSegmentRayInto`와 `singleIntersectionSegmentRay`만 호출한다.
 * `lineFamilyIntersectionPoint(segment param, ray param)`와 같은 식과 같은 판정 순서로 계산한다.
 * 호출마다 `LineFamilyParam` record를 만들지 않는다.
 * 점 하나가 degenerate(길이 0)인 입력은 드물어서 기존 함수에 맡긴다.
 */

import type { PointWritable } from '../types/flat-shapes.internal';
import { lineFamilyIntersectionPoint } from './line-family-core.internal';
import { rayToLineFamilyParam, segmentToLineFamilyParam } from './line-family-param-builders.internal';
import { crossWithin } from './numeric';

/**
 * segment (ax, ay)→(bx, by)와 ray (ox, oy, dx, dy)의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 평행·collinear, range 밖이면 false를 반환하고 out을 수정하지 않는다.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체.
 * @param ax segment 시작점 x
 * @param ay segment 시작점 y
 * @param bx segment 끝점 x
 * @param by segment 끝점 y
 * @param ox ray origin x
 * @param oy ray origin y
 * @param dx ray direction x
 * @param dy ray direction y
 * @param epsilon 평행 판정 임계값. 생략하면 `sin θ <= DEFAULT_EPSILON`이다.
 */
export function segmentRayPointInto(
  out: PointWritable,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  epsilon: number | undefined
): boolean {
  const ex = bx - ax;
  const ey = by - ay;
  const eLenSq = ex * ex + ey * ey;
  const dLenSq = dx * dx + dy * dy;

  // degenerate(점으로 환원)는 기존 판정에 맡긴다
  if (eLenSq === 0 || dLenSq === 0) {
    return lineFamilyIntersectionPoint(
      out,
      segmentToLineFamilyParam(ax, ay, bx, by),
      rayToLineFamilyParam(ox, oy, dx, dy),
      epsilon
    );
  }

  const cross = ex * dy - ey * dx;
  if (crossWithin(cross, epsilon, eLenSq, dLenSq)) return false;

  const qx = ox - ax;
  const qy = oy - ay;
  const t = (qx * dy - qy * dx) / cross;
  const u = (qx * ey - qy * ex) / cross;

  // segment는 [0, 1], ray는 [0, +Infinity) 안이어야 한다
  if (!(t >= 0 && t <= 1) || !(Number.isFinite(u) && u >= 0)) return false;

  const x = ax + t * ex;
  const y = ay + t * ey;
  out.x = x;
  out.y = y;
  return true;
}
