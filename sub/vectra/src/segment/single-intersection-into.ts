import { segmentContainsPoint, segmentIsZeroLength } from '../internal/segment';
import { crossWithin, DEFAULT_EPSILON } from '../internal/numeric';
import type { PointWritable, Segment } from '../types/flat-shapes.internal';

/**
 * 두 segment가 단일 교점을 가지면 out에 기록하고 true를 반환한다. 교점이 없으면 false를 반환하고 out을 수정하지 않는다.
 * parallel/collinear 분기에서는 항상 false를 반환한다.
 * 교점 좌표는 line a 기준 a0 + t1*(a1-a0)로 계산한다.
 * endpoint touch는 해당 endpoint 좌표를 그대로 기록한다(t1 우선, 그 다음 t2).
 *
 * @param out 교점을 기록할 점 객체
 * @param a 첫 번째 segment
 * @param b 두 번째 segment
 * @param epsilon 거리 임계값 (기본값 `1e-9`). 생략하면 평행 판정은 `|cross| <= 1e-9·|a|·|b|`(sin θ 기준)로 scale 불변이다.
 *   명시하면 평행 판정도 `|cross| <= epsilon` 절대 비교를 쓴다.
 */
export function singleIntersectionInto(out: PointWritable, a: Segment, b: Segment, epsilon?: number): boolean {
  const distEpsilon = epsilon ?? DEFAULT_EPSILON;
  // zero-length 검출은 caller epsilon과 무관하게 기본 epsilon(1e-9)을 쓴다
  const aIsZero = segmentIsZeroLength(a, DEFAULT_EPSILON);
  const bIsZero = segmentIsZeroLength(b, DEFAULT_EPSILON);

  const ax = a.x1;
  const ay = a.y1;
  const bx = b.x1;
  const by = b.y1;

  if (aIsZero || bIsZero) {
    if (aIsZero && bIsZero) {
      // 점 vs 점: epsilon 거리 이내이면 a의 시작점을 기록
      const px = ax - bx;
      const py = ay - by;
      if (px * px + py * py <= distEpsilon * distEpsilon) {
        out.x = ax;
        out.y = ay;
        return true;
      }
      return false;
    }
    if (aIsZero) {
      // a가 점: b 위에 a의 시작점이 있으면 a의 시작점을 기록
      if (segmentContainsPoint(b, ax, ay, distEpsilon)) {
        out.x = ax;
        out.y = ay;
        return true;
      }
      return false;
    }
    // b가 점: a 위에 b의 시작점이 있으면 b의 시작점을 기록
    if (segmentContainsPoint(a, bx, by, distEpsilon)) {
      out.x = bx;
      out.y = by;
      return true;
    }
    return false;
  }

  const dax = a.x2 - ax;
  const day = a.y2 - ay;
  const dbx = b.x2 - bx;
  const dby = b.y2 - by;
  const cross = dax * dby - day * dbx;

  // collinear 또는 parallel: 단일 점이 결정되지 않으므로 항상 false
  if (crossWithin(cross, epsilon, dax * dax + day * day, dbx * dbx + dby * dby)) {
    return false;
  }

  // Cramer's rule로 parametric 위치 계산
  const qx = bx - ax;
  const qy = by - ay;
  const t1 = (qx * dby - qy * dbx) / cross;
  const t2 = (qx * day - qy * dax) / cross;

  if (t1 < 0 || t1 > 1 || t2 < 0 || t2 > 1) {
    return false;
  }

  // endpoint touch: 정밀도 보존을 위해 정확한 endpoint 좌표를 기록한다 (t1 우선)
  if (t1 === 0) {
    out.x = ax;
    out.y = ay;
    return true;
  }
  if (t1 === 1) {
    const { x2, y2 } = a;
    out.x = x2;
    out.y = y2;
    return true;
  }
  if (t2 === 0) {
    out.x = bx;
    out.y = by;
    return true;
  }
  if (t2 === 1) {
    const { x2, y2 } = b;
    out.x = x2;
    out.y = y2;
    return true;
  }

  // 일반 교차: line a 기준 interpolation
  out.x = ax + t1 * dax;
  out.y = ay + t1 * day;
  return true;
}
