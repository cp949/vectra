import type { XYWritable } from '../types';
import type { LineFamilyParam } from './line-family-param.internal';
import {
  getLineFamilyOwnRangeInterval,
  getMappedLineFamilyRangeInterval,
  lineFamilyRangeContains,
} from './line-family-range.internal';
import { writeXY } from './xy';

/**
 * normal LineFamilyParam에 대해 외부 좌표 (px, py)가 line-family 위에 있는지 검사한다.
 *
 * 전제: `param`이 degenerate가 아니다 (`dx*dx + dy*dy > 0`).
 * distSq 임계값은 `epsilon * epsilon`이고, range boundary는 정확 비교한다.
 */
function containsPointNormalized(param: LineFamilyParam, px: number, py: number, epsilon: number): boolean {
  const qx = px - param.ox;
  const qy = py - param.oy;
  const lenSq = param.dx * param.dx + param.dy * param.dy;
  const t = (qx * param.dx + qy * param.dy) / lenSq;
  // 직선까지 거리 제곱: 투영점과 입력점의 차
  const cx = t * param.dx - qx;
  const cy = t * param.dy - qy;
  if (cx * cx + cy * cy > epsilon * epsilon) return false;
  return lineFamilyRangeContains(t, param.kind);
}

/**
 * 두 line-family가 교점을 가지면 true를 반환한다.
 *
 * non-parallel이면 각 parameter range를 정확 비교로 검사하고,
 * collinear이면 A의 parameter 축으로 두 range를 매핑한 뒤 closed interval overlap으로 판정한다.
 * degenerate(direction = 0)는 점으로 환원해 다른 쪽 line-family의 containment로 판정한다.
 *
 * @param a 첫 번째 line-family
 * @param b 두 번째 line-family
 * @param epsilon cross product 절대값 및 거리 임계값
 */
export function lineFamilyIntersects(a: LineFamilyParam, b: LineFamilyParam, epsilon: number): boolean {
  const aLenSq = a.dx * a.dx + a.dy * a.dy;
  const bLenSq = b.dx * b.dx + b.dy * b.dy;
  const aDegen = aLenSq === 0;
  const bDegen = bLenSq === 0;

  // degenerate 분기: 한 쪽 이상이 점으로 환원된다
  if (aDegen || bDegen) {
    if (aDegen && bDegen) {
      // 점 vs 점: epsilon 거리 이내 여부 (range는 의미 없으므로 origin 일치만 확인)
      const dx = a.ox - b.ox;
      const dy = a.oy - b.oy;
      return dx * dx + dy * dy <= epsilon * epsilon;
    }
    if (aDegen) {
      return containsPointNormalized(b, a.ox, a.oy, epsilon);
    }
    return containsPointNormalized(a, b.ox, b.oy, epsilon);
  }

  const qx = b.ox - a.ox;
  const qy = b.oy - a.oy;
  const cross = a.dx * b.dy - a.dy * b.dx;

  if (Math.abs(cross) > epsilon) {
    const t = (qx * b.dy - qy * b.dx) / cross;
    const u = (qx * a.dy - qy * a.dx) / cross;
    return lineFamilyRangeContains(t, a.kind) && lineFamilyRangeContains(u, b.kind);
  }

  const tBo = (qx * a.dx + qy * a.dy) / aLenSq;
  const colCx = tBo * a.dx - qx;
  const colCy = tBo * a.dy - qy;
  if (colCx * colCx + colCy * colCy > epsilon * epsilon) {
    return false;
  }

  // collinear non-degenerate이면 dB는 dA와 평행하고 둘 다 0이 아니므로 s = (dB . dA) / aLenSq != 0
  const s = (b.dx * a.dx + b.dy * a.dy) / aLenSq;
  const aInterval = getLineFamilyOwnRangeInterval(a.kind);
  const bInterval = getMappedLineFamilyRangeInterval(b, tBo, s);

  return aInterval.lo <= bInterval.hi && bInterval.lo <= aInterval.hi;
}

/**
 * 두 line-family가 단일 교점을 가지면 out에 기록하고 true를 반환한다.
 *
 * non-parallel이고 양쪽 range 안이면 a 기준 좌표를 기록한다.
 * parallel/collinear 분기와 range 밖 케이스에서는 false를 반환하고 out을 수정하지 않는다.
 * degenerate(direction = 0)는 점으로 환원해 containment로 판정하며, 일치 시 점 좌표를 기록한다.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param a 첫 번째 line-family
 * @param b 두 번째 line-family
 * @param epsilon cross product 절대값 및 거리 임계값
 */
export function lineFamilyIntersectionPoint(
  out: XYWritable,
  a: LineFamilyParam,
  b: LineFamilyParam,
  epsilon: number
): boolean {
  const aLenSq = a.dx * a.dx + a.dy * a.dy;
  const bLenSq = b.dx * b.dx + b.dy * b.dy;
  const aDegen = aLenSq === 0;
  const bDegen = bLenSq === 0;

  if (aDegen || bDegen) {
    if (aDegen && bDegen) {
      const dx = a.ox - b.ox;
      const dy = a.oy - b.oy;
      if (dx * dx + dy * dy <= epsilon * epsilon) {
        writeXY(out, a.ox, a.oy);
        return true;
      }
      return false;
    }
    if (aDegen) {
      if (containsPointNormalized(b, a.ox, a.oy, epsilon)) {
        writeXY(out, a.ox, a.oy);
        return true;
      }
      return false;
    }
    if (containsPointNormalized(a, b.ox, b.oy, epsilon)) {
      writeXY(out, b.ox, b.oy);
      return true;
    }
    return false;
  }

  const cross = a.dx * b.dy - a.dy * b.dx;

  // parallel 또는 collinear: 단일 교점이 없으므로 항상 false (out 미수정)
  if (Math.abs(cross) <= epsilon) return false;

  const qx = b.ox - a.ox;
  const qy = b.oy - a.oy;
  const t = (qx * b.dy - qy * b.dx) / cross;
  const u = (qx * a.dy - qy * a.dx) / cross;

  if (!lineFamilyRangeContains(t, a.kind) || !lineFamilyRangeContains(u, b.kind)) return false;

  writeXY(out, a.ox + t * a.dx, a.oy + t * a.dy);
  return true;
}
