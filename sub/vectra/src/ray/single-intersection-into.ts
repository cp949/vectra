import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, XYObjectWritable } from '../types';

/**
 * 두 ray가 단일 교점을 가지면 `out`에 기록하고 `true`를 반환한다.
 *
 * collinear(선분 overlap) 또는 parallel 분기에서는 단일 교점이 없으므로 `false`를 반환한다.
 * degenerate ray(방향 벡터 = 0)는 점으로 취급해 origin 기반 containment로 판정한다.
 * t < 0 또는 u < 0이면 ray의 forward 방향에 교점이 없으므로 `false`를 반환한다.
 *
 * @param out 교점 좌표를 기록할 writable object
 * @param a 첫 번째 ray
 * @param b 두 번째 ray
 * @param epsilon cross product 절대값 및 거리 임계값 (기본값 `1e-9`)
 */
export function singleIntersectionInto(
  out: XYObjectWritable,
  a: RayLike,
  b: RayLike,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  const oax = readX(readRayOrigin(a));
  const oay = readY(readRayOrigin(a));
  const dax = readX(readRayDirection(a));
  const day = readY(readRayDirection(a));
  const obx = readX(readRayOrigin(b));
  const oby = readY(readRayOrigin(b));
  const dbx = readX(readRayDirection(b));
  const dby = readY(readRayDirection(b));

  const aLenSq = dax * dax + day * day;
  const bLenSq = dbx * dbx + dby * dby;

  // degenerate 분기: 하나 이상의 방향 벡터가 0인 경우
  if (aLenSq === 0 || bLenSq === 0) {
    if (aLenSq === 0 && bLenSq === 0) {
      // 양쪽 degenerate: origin 일치이면 a.origin 기록
      const dx = oax - obx;
      const dy = oay - oby;
      if (dx * dx + dy * dy <= epsilon * epsilon) {
        writeXY(out, oax, oay);
        return true;
      }
      return false;
    }
    if (aLenSq === 0) {
      // a degenerate: b ray가 a.origin을 포함하는지 검사
      const px = oax - obx;
      const py = oay - oby;
      const t = (px * dbx + py * dby) / bLenSq;
      if (t < 0) return false;
      const cx = t * dbx - px;
      const cy = t * dby - py;
      if (cx * cx + cy * cy <= epsilon * epsilon) {
        writeXY(out, oax, oay);
        return true;
      }
      return false;
    }
    // b degenerate: a ray가 b.origin을 포함하는지 검사
    const px = obx - oax;
    const py = oby - oay;
    const t = (px * dax + py * day) / aLenSq;
    if (t < 0) return false;
    const cx = t * dax - px;
    const cy = t * day - py;
    if (cx * cx + cy * cy <= epsilon * epsilon) {
      writeXY(out, obx, oby);
      return true;
    }
    return false;
  }

  // 양쪽 non-degenerate
  const qx = obx - oax;
  const qy = oby - oay;
  const cross = dax * dby - day * dbx;

  // parallel 또는 collinear: 단일 교점 없음
  if (Math.abs(cross) <= epsilon) return false;

  const t = (qx * dby - qy * dbx) / cross;
  const u = (day * qx - dax * qy) / cross;

  // backward 방향이면 교점 없음
  if (t < 0 || u < 0) return false;

  writeXY(out, oax + t * dax, oay + t * day);
  return true;
}
