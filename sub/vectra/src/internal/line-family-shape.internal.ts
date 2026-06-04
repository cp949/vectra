import type { XYWritable } from '../types';
import { lineFamilyIntersects } from './line-family-core.internal';
import type { LineFamilyParam } from './line-family-param.internal';
import { segmentToLineFamilyParam } from './line-family-param-builders.internal';
import { lineFamilyRangeContains } from './line-family-range.internal';
import { findSingleLineFamilySideIntersectionPoint } from './line-family-side.internal';
import { writeXY } from './xy';

/**
 * line-family와 box (x0, y0, x1, y1)가 교점을 가지면 true를 반환한다.
 *
 * box는 left=x0, top=y0, right=x1, bottom=y1의 4변으로 구성된다.
 * empty box (x0 >= x1 or y0 >= y1) 검사는 caller가 담당한다.
 * 각 변을 segment로 보고 lineFamilyIntersects를 호출한다.
 */
export function lineFamilyBoxIntersects(
  line: LineFamilyParam,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  epsilon: number
): boolean {
  // top: (x0,y0)→(x1,y0), right: (x1,y0)→(x1,y1), bottom: (x1,y1)→(x0,y1), left: (x0,y1)→(x0,y0)
  return (
    lineFamilyIntersects(line, segmentToLineFamilyParam(x0, y0, x1, y0), epsilon) ||
    lineFamilyIntersects(line, segmentToLineFamilyParam(x1, y0, x1, y1), epsilon) ||
    lineFamilyIntersects(line, segmentToLineFamilyParam(x1, y1, x0, y1), epsilon) ||
    lineFamilyIntersects(line, segmentToLineFamilyParam(x0, y1, x0, y0), epsilon)
  );
}

/**
 * line-family와 box가 단일 교점을 가지면 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear side overlap이면 false를 반환하고 out을 수정하지 않는다.
 * corner 공유로 인한 중복 점은 거리 ≤ epsilon으로 제거한다.
 */
export function lineFamilyBoxIntersectionPoint(
  out: XYWritable,
  line: LineFamilyParam,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  epsilon: number
): boolean {
  const sides: LineFamilyParam[] = [
    segmentToLineFamilyParam(x0, y0, x1, y0),
    segmentToLineFamilyParam(x1, y0, x1, y1),
    segmentToLineFamilyParam(x1, y1, x0, y1),
    segmentToLineFamilyParam(x0, y1, x0, y0),
  ];
  return findSingleLineFamilySideIntersectionPoint(out, line, sides, epsilon);
}

/**
 * line-family와 circle이 교점을 가지면 true를 반환한다.
 *
 * closed disk 판정: line이 disk 내부에 있으면(0 boundary crossing이지만 내부) true.
 * empty circle (r <= 0): false.
 * degenerate direction (lenSq === 0): origin이 disk 안에 있으면 true.
 */
export function lineFamilyCircleIntersects(
  line: LineFamilyParam,
  cx: number,
  cy: number,
  r: number,
  epsilon: number
): boolean {
  if (r <= 0) return false;
  const qx = line.ox - cx;
  const qy = line.oy - cy;
  const qLenSq = qx * qx + qy * qy;
  const lenSq = line.dx * line.dx + line.dy * line.dy;
  const rSq = r * r;

  if (lenSq === 0) return qLenSq <= rSq;

  const p = qx * line.dx + qy * line.dy;
  const disc = p * p - lenSq * (qLenSq - rSq);

  if (disc < 0) return false;

  if (disc === 0) {
    return lineFamilyRangeContains(-p / lenSq, line.kind);
  }

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-p - sqrtDisc) / lenSq;
  const t2 = (-p + sqrtDisc) / lenSq;

  if (lineFamilyRangeContains(t1, line.kind) || lineFamilyRangeContains(t2, line.kind)) return true;
  // 0 roots in range: origin이 disk 안에 있으면 true (segment 전체가 disk 내부)
  return qLenSq <= rSq;
}

/**
 * line-family와 circle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * degenerate direction: origin이 circle 경계 위 (|dist - r| <= epsilon)이면 origin 기록.
 */
export function lineFamilyCircleIntersectionPoint(
  out: XYWritable,
  line: LineFamilyParam,
  cx: number,
  cy: number,
  r: number,
  epsilon: number
): boolean {
  if (r <= 0) return false;
  const qx = line.ox - cx;
  const qy = line.oy - cy;
  const qLenSq = qx * qx + qy * qy;
  const lenSq = line.dx * line.dx + line.dy * line.dy;
  const rSq = r * r;

  if (lenSq === 0) {
    // degenerate: origin이 circle 경계 위인지 확인
    if (Math.abs(Math.hypot(qx, qy) - r) <= epsilon) {
      writeXY(out, line.ox, line.oy);
      return true;
    }
    return false;
  }

  const p = qx * line.dx + qy * line.dy;
  const disc = p * p - lenSq * (qLenSq - rSq);

  if (disc < 0) return false;

  if (disc === 0) {
    const t = -p / lenSq;
    if (!lineFamilyRangeContains(t, line.kind)) return false;
    writeXY(out, line.ox + t * line.dx, line.oy + t * line.dy);
    return true;
  }

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-p - sqrtDisc) / lenSq;
  const t2 = (-p + sqrtDisc) / lenSq;
  const in1 = lineFamilyRangeContains(t1, line.kind);
  const in2 = lineFamilyRangeContains(t2, line.kind);

  if (in1 && in2) return false; // 2-point crossing
  if (in1) {
    writeXY(out, line.ox + t1 * line.dx, line.oy + t1 * line.dy);
    return true;
  }
  if (in2) {
    writeXY(out, line.ox + t2 * line.dx, line.oy + t2 * line.dy);
    return true;
  }
  return false;
}

/**
 * line-family와 triangle이 교점을 가지면 true를 반환한다.
 *
 * degenerate triangle (signed area 2× === 0): false.
 * segment가 triangle 내부에 완전히 포함된 경우도 true를 반환한다.
 */
export function lineFamilyTriangleIntersects(
  line: LineFamilyParam,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  epsilon: number
): boolean {
  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (area2 === 0) return false;

  if (lineFamilyIntersects(line, segmentToLineFamilyParam(bx, by, cx, cy), epsilon)) return true;
  if (lineFamilyIntersects(line, segmentToLineFamilyParam(cx, cy, ax, ay), epsilon)) return true;
  if (lineFamilyIntersects(line, segmentToLineFamilyParam(ax, ay, bx, by), epsilon)) return true;

  // edge hit 없음 — segment이면 origin이 내부에 있는지 확인
  if (line.kind !== 'finite') return false;
  const ox = line.ox;
  const oy = line.oy;
  const d1 = (ox - ax) * (by - ay) - (oy - ay) * (bx - ax);
  const d2 = (ox - bx) * (cy - by) - (oy - by) * (cx - bx);
  const d3 = (ox - cx) * (ay - cy) - (oy - cy) * (ax - cx);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

/**
 * line-family와 triangle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * vertex를 공유하는 두 edge가 같은 corner를 보고하면 거리 ≤ epsilon 기준으로 중복 제거한다.
 * degenerate triangle: false.
 */
export function lineFamilyTriangleIntersectionPoint(
  out: XYWritable,
  line: LineFamilyParam,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  epsilon: number
): boolean {
  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (area2 === 0) return false;

  const sides: LineFamilyParam[] = [
    segmentToLineFamilyParam(bx, by, cx, cy),
    segmentToLineFamilyParam(cx, cy, ax, ay),
    segmentToLineFamilyParam(ax, ay, bx, by),
  ];
  return findSingleLineFamilySideIntersectionPoint(out, line, sides, epsilon);
}
