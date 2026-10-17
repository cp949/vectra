import type { XYWritable } from '../types';
import type { LineFamilyParam } from './line-family-param.internal';
import {
  getLineFamilyOwnRangeInterval,
  getMappedLineFamilyRangeInterval,
  lineFamilyRangeContains,
} from './line-family-range.internal';
import { crossExceeds, crossWithin, DEFAULT_EPSILON } from './numeric';
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
 * @param epsilon 거리 임계값. 생략하면 거리는 `DEFAULT_EPSILON`, 평행 판정은 `sin θ <= DEFAULT_EPSILON`이다.
 *   명시하면 평행 판정도 `|cross| <= epsilon` 절대 비교를 쓴다.
 */
export function lineFamilyIntersects(a: LineFamilyParam, b: LineFamilyParam, epsilon: number | undefined): boolean {
  const aLenSq = a.dx * a.dx + a.dy * a.dy;
  const bLenSq = b.dx * b.dx + b.dy * b.dy;
  const cross = a.dx * b.dy - a.dy * b.dx;

  // hot path: O(n²) self-intersection loop가 쌍마다 호출한다.
  // 1e-18은 DEFAULT_EPSILON²이고, 식은 `crossExceeds`의 유한 길이 곱 분기와 같다. 상수 로드를 줄이려고 풀어 썼다.
  // 길이 곱이 오버플로한 경우와 degenerate(임계 0, cross = 0)는 여기서 false이고 아래 함수가 처리한다.
  if (epsilon === undefined ? cross * cross > 1e-18 * (aLenSq * bLenSq) : Math.abs(cross) > epsilon) {
    return crossingIntersects(a, b, cross);
  }
  return lineFamilyParallelIntersects(a, b, cross, aLenSq, bLenSq, epsilon);
}

/** non-parallel 두 line-family의 교점이 양쪽 range 안에 있으면 true를 반환한다. */
function crossingIntersects(a: LineFamilyParam, b: LineFamilyParam, cross: number): boolean {
  const qx = b.ox - a.ox;
  const qy = b.oy - a.oy;
  const t = (qx * b.dy - qy * b.dx) / cross;
  const u = (qx * a.dy - qy * a.dx) / cross;
  return lineFamilyRangeContains(t, a.kind) && lineFamilyRangeContains(u, b.kind);
}

/**
 * non-parallel로 확정되지 않은 두 line-family의 교점 여부를 판정한다.
 *
 * `lineFamilyIntersects`의 hot path를 작게 유지하려고 분리했다.
 * 길이 곱 오버플로로 hot path가 거른 non-parallel은 `crossExceeds`로 다시 확인해 처리한다.
 * degenerate(direction = 0)는 점으로 환원해 containment로 판정하고, 그 외에는 collinear overlap으로 판정한다.
 */
function lineFamilyParallelIntersects(
  a: LineFamilyParam,
  b: LineFamilyParam,
  cross: number,
  aLenSq: number,
  bLenSq: number,
  epsilonArg: number | undefined
): boolean {
  if (crossExceeds(cross, epsilonArg, aLenSq, bLenSq)) return crossingIntersects(a, b, cross);

  const epsilon = epsilonArg ?? DEFAULT_EPSILON;
  const qx = b.ox - a.ox;
  const qy = b.oy - a.oy;
  const aDegen = aLenSq === 0;
  const bDegen = bLenSq === 0;

  // degenerate 분기: 한 쪽 이상이 점으로 환원된다
  if (aDegen || bDegen) {
    if (aDegen && bDegen) {
      // 점 vs 점: epsilon 거리 이내 여부 (range는 의미 없으므로 origin 일치만 확인)
      return qx * qx + qy * qy <= epsilon * epsilon;
    }
    if (aDegen) {
      return containsPointNormalized(b, a.ox, a.oy, epsilon);
    }
    return containsPointNormalized(a, b.ox, b.oy, epsilon);
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
 * @param epsilon 거리 임계값. 생략하면 거리는 `DEFAULT_EPSILON`, 평행 판정은 `sin θ <= DEFAULT_EPSILON`이다.
 *   명시하면 평행 판정도 `|cross| <= epsilon` 절대 비교를 쓴다.
 */
export function lineFamilyIntersectionPoint(
  out: XYWritable,
  a: LineFamilyParam,
  b: LineFamilyParam,
  epsilonArg: number | undefined
): boolean {
  const epsilon = epsilonArg ?? DEFAULT_EPSILON;
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
  if (crossWithin(cross, epsilonArg, aLenSq, bLenSq)) return false;

  const qx = b.ox - a.ox;
  const qy = b.oy - a.oy;
  const t = (qx * b.dy - qy * b.dx) / cross;
  const u = (qx * a.dy - qy * a.dx) / cross;

  if (!lineFamilyRangeContains(t, a.kind) || !lineFamilyRangeContains(u, b.kind)) return false;

  writeXY(out, a.ox + t * a.dx, a.oy + t * a.dy);
  return true;
}
