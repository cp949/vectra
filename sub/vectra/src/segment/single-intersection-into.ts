import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB, segmentContainsPoint } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';
import { isZeroLength } from './is-zero-length';

/**
 * 두 segment가 단일 교점을 가지면 out에 기록하고 true를 반환한다. 교점이 없으면 false를 반환하고 out을 수정하지 않는다.
 * collinear 분기(|cross(da,db)| <= epsilon)에서는 항상 false를 반환한다.
 * 교점 좌표는 line a 기준 a0 + t1*(a1-a0)로 계산한다.
 * endpoint touch는 해당 endpoint 좌표를 그대로 기록한다(t1 우선, 그 다음 t2).
 *
 * @param out 교점을 기록할 writable output
 * @param a 첫 번째 segment
 * @param b 두 번째 segment
 * @param epsilon cross product 절대값 임계값과 점 판정 거리 임계값
 */
export function singleIntersectionInto(
  out: XYWritable,
  a: SegmentLike,
  b: SegmentLike,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  // zero-length 검출은 caller epsilon과 무관하게 isZeroLength 기본값(1e-9) 사용
  const aIsZero = isZeroLength(a);
  const bIsZero = isZeroLength(b);

  if (aIsZero || bIsZero) {
    if (aIsZero && bIsZero) {
      // 점 vs 점: epsilon 거리 이내이면 a의 시작점을 기록
      const px = readX(readSegmentA(a)) - readX(readSegmentA(b));
      const py = readY(readSegmentA(a)) - readY(readSegmentA(b));
      if (px * px + py * py <= epsilon * epsilon) {
        writeXY(out, readX(readSegmentA(a)), readY(readSegmentA(a)));
        return true;
      }
      return false;
    }
    if (aIsZero) {
      // a가 점: b 위에 a의 시작점이 있으면 a의 시작점을 기록
      if (segmentContainsPoint(b, readX(readSegmentA(a)), readY(readSegmentA(a)), epsilon)) {
        writeXY(out, readX(readSegmentA(a)), readY(readSegmentA(a)));
        return true;
      }
      return false;
    }
    // b가 점: a 위에 b의 시작점이 있으면 b의 시작점을 기록
    if (segmentContainsPoint(a, readX(readSegmentA(b)), readY(readSegmentA(b)), epsilon)) {
      writeXY(out, readX(readSegmentA(b)), readY(readSegmentA(b)));
      return true;
    }
    return false;
  }

  const ax = readX(readSegmentA(a));
  const ay = readY(readSegmentA(a));
  const dax = readX(readSegmentB(a)) - ax;
  const day = readY(readSegmentB(a)) - ay;
  const bx = readX(readSegmentA(b));
  const by = readY(readSegmentA(b));
  const dbx = readX(readSegmentB(b)) - bx;
  const dby = readY(readSegmentB(b)) - by;
  const cross = dax * dby - day * dbx;

  // collinear 또는 parallel: 단일 점이 결정되지 않으므로 항상 false
  if (Math.abs(cross) <= epsilon) {
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
    writeXY(out, ax, ay);
    return true;
  }
  if (t1 === 1) {
    writeXY(out, readX(readSegmentB(a)), readY(readSegmentB(a)));
    return true;
  }
  if (t2 === 0) {
    writeXY(out, bx, by);
    return true;
  }
  if (t2 === 1) {
    writeXY(out, readX(readSegmentB(b)), readY(readSegmentB(b)));
    return true;
  }

  // 일반 교차: line a 기준 interpolation
  writeXY(out, ax + t1 * dax, ay + t1 * day);
  return true;
}
