/**
 * line-family (segment, ray, infinite-line) × ellipse 교차 계산용 internal helper.
 *
 * ellipse local coordinate 정규화로 단위원 교차 문제로 환원한다.
 *
 * 정규화 공식:
 *   U = (ox - cx) / rx,  V = (oy - cy) / ry
 *   DU = dx / rx,        DV = dy / ry
 * quadratic: (DU²+DV²)t² + 2(U·DU+V·DV)t + (U²+V²-1) = 0
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { XYObjectWritable, XYWritable } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import { lineFamilyRangeContains } from './line-family-range.internal';
import { writeXY } from './xy';

/**
 * line-family와 ellipse가 교점을 가지면 true를 반환한다.
 *
 * - empty ellipse (rx <= 0 || ry <= 0): false
 * - degenerate direction (dx²+dy² = 0): origin이 ellipse 경계/내부에 있으면 true
 * - tangent (disc ≈ 0): 접점 t가 range 안이거나 origin이 closed disk이면 true
 * - 2-point crossing: range 안 root가 1개 이상이면 true
 * - 전체 내부 포함: range 밖 root뿐이어도 origin이 closed disk(U²+V² ≤ 1)이면 true
 *
 * boolean relation은 closed disk 판정이다. range가 ellipse 경계/내부 점을 하나라도 포함하면
 * true다. tangent·crossing 두 분기 모두 range 밖이어도 origin이 closed disk면 true로 떨어진다.
 *
 * @param ox    line-family origin x
 * @param oy    line-family origin y
 * @param dx    line-family direction x
 * @param dy    line-family direction y
 * @param kind  range kind
 * @param cx    ellipse center x
 * @param cy    ellipse center y
 * @param rx    ellipse x반지름
 * @param ry    ellipse y반지름
 * @param epsilon discriminant 0 근방 임계값
 */
export function lineFamilyEllipseIntersects(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number
): boolean {
  // empty ellipse
  if (rx <= 0 || ry <= 0) return false;

  // 정규화된 좌표
  const U = (ox - cx) / rx;
  const V = (oy - cy) / ry;
  const DU = dx / rx;
  const DV = dy / ry;

  // quadratic coefficients: a·t² + 2b·t + c = 0 (b는 half-b)
  const a = DU * DU + DV * DV;
  const halfB = U * DU + V * DV;
  const c = U * U + V * V - 1;

  // degenerate direction: origin이 ellipse 위 또는 내부인지 판정
  if (a === 0) return c <= 0;

  // disc = 4(halfB² - a·c) — 4로 나눈 reduced discriminant를 사용
  const disc = halfB * halfB - a * c;

  // 교점 없음
  if (disc < -epsilon * epsilon) return false;

  // tangent (disc ≈ 0): 접점 t가 range 안이면 true. range 밖이어도 origin이 closed disk(c ≤ 0)면
  // boundary touch이므로 true(crossing 분기 fallback과 같은 closed disk 정책). near-tangent
  // boundary origin은 접점 t가 epsilon band에서 range 밖으로 밀려 t 비교만으론 false가 된다.
  if (disc <= epsilon * epsilon) {
    const t = -halfB / a;
    if (lineFamilyRangeContains(t, kind)) return true;
    return c <= 0;
  }

  // disc > 0: 두 root
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-halfB - sqrtDisc) / a;
  const t2 = (-halfB + sqrtDisc) / a;

  if (lineFamilyRangeContains(t1, kind) || lineFamilyRangeContains(t2, kind)) return true;

  // range 밖: origin이 ellipse 내부 또는 경계(closed disk)이면 true.
  // degenerate direction 분기(c <= 0), tangent 분기 fallback과 같은 closed disk 정책이다.
  return c <= 0;
}

/**
 * line-family와 ellipse의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * | 케이스                     | 반환값 | out       |
 * |--------------------------|--------|-----------|
 * | no hit                   | false  | 미수정    |
 * | tangent 1점              | true   | 접점 기록  |
 * | 2점 crossing (range 안 2개)| false  | 미수정    |
 * | 1점 only (range 안 1개)  | true   | 교점 기록  |
 * | contained (전체 내부)     | false  | 미수정    |
 * | empty ellipse            | false  | 미수정    |
 * | degenerate direction     | false  | 미수정    |
 *
 * @param out   교점 좌표를 기록할 writable output
 * @param ox    line-family origin x
 * @param oy    line-family origin y
 * @param dx    line-family direction x
 * @param dy    line-family direction y
 * @param kind  range kind
 * @param cx    ellipse center x
 * @param cy    ellipse center y
 * @param rx    ellipse x반지름
 * @param ry    ellipse y반지름
 * @param epsilon discriminant 0 근방 임계값
 */
export function lineFamilyEllipseIntersectionPoint(
  out: XYWritable,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number
): boolean {
  // empty ellipse
  if (rx <= 0 || ry <= 0) return false;

  // 정규화된 좌표
  const U = (ox - cx) / rx;
  const V = (oy - cy) / ry;
  const DU = dx / rx;
  const DV = dy / ry;

  const a = DU * DU + DV * DV;
  const halfB = U * DU + V * DV;
  const c = U * U + V * V - 1;

  // degenerate direction: point output 항상 false
  if (a === 0) return false;

  const disc = halfB * halfB - a * c;

  // 교점 없음
  if (disc < -epsilon * epsilon) return false;

  // tangent (disc ≈ 0)
  if (disc <= epsilon * epsilon) {
    const t = -halfB / a;
    if (!lineFamilyRangeContains(t, kind)) return false;
    writeXY(out, ox + t * dx, oy + t * dy);
    return true;
  }

  // disc > 0: 두 root
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-halfB - sqrtDisc) / a;
  const t2 = (-halfB + sqrtDisc) / a;
  const in1 = lineFamilyRangeContains(t1, kind);
  const in2 = lineFamilyRangeContains(t2, kind);

  // 2-point crossing → false (out 미수정)
  if (in1 && in2) return false;

  if (in1) {
    writeXY(out, ox + t1 * dx, oy + t1 * dy);
    return true;
  }
  if (in2) {
    writeXY(out, ox + t2 * dx, oy + t2 * dy);
    return true;
  }

  // range 밖: contained → false (out 미수정)
  return false;
}

/**
 * line-family와 ellipse의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * outPoints는 먼저 clear되고 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object다. 반환 순서는 line-family parameter `t` 오름차순이다.
 *
 * | 케이스                                 | 결과               |
 * |--------------------------------------|-------------------|
 * | no hit                               | 빈 배열            |
 * | tangent, 접점 t가 range 안            | 접점 1개           |
 * | tangent, 접점 t가 range 밖            | 빈 배열            |
 * | 2점 crossing (range 안 2개)           | 교점 2개           |
 * | 1점 only (range 안 1개)               | 교점 1개           |
 * | contained (전체 내부)                 | 빈 배열            |
 * | empty ellipse                        | 빈 배열            |
 * | degenerate direction                 | 빈 배열            |
 *
 * tangent는 접점 t가 range 안일 때만 접점 1개다. infinite-line(`infinite`)은 range가 전체이므로
 * tangent이면 항상 접점 1개지만, segment(`finite`)/ray range는 접점 t가 range 밖이면 빈 배열이다.
 *
 * single-intersection helper와 달리 range 안 root가 2개여도 두 점을 모두 push한다.
 * contained interior(boundary root 없음)는 boolean relation과 달리 빈 배열로 둔다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param ox    line-family origin x
 * @param oy    line-family origin y
 * @param dx    line-family direction x
 * @param dy    line-family direction y
 * @param kind  range kind
 * @param cx    ellipse center x
 * @param cy    ellipse center y
 * @param rx    ellipse x반지름
 * @param ry    ellipse y반지름
 * @param epsilon discriminant 0 근방 임계값
 */
export function lineFamilyEllipseIntersectionPoints(
  outPoints: XYObjectWritable[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number
): XYObjectWritable[] {
  outPoints.length = 0;

  // empty ellipse
  if (rx <= 0 || ry <= 0) return outPoints;

  // 정규화된 좌표
  const U = (ox - cx) / rx;
  const V = (oy - cy) / ry;
  const DU = dx / rx;
  const DV = dy / ry;

  const a = DU * DU + DV * DV;
  const halfB = U * DU + V * DV;
  const c = U * U + V * V - 1;

  // degenerate direction: 교점 collection은 항상 빈 배열
  if (a === 0) return outPoints;

  const disc = halfB * halfB - a * c;

  // 교점 없음
  if (disc < -epsilon * epsilon) return outPoints;

  // tangent (disc ≈ 0): 중복 없이 1점만 push
  if (disc <= epsilon * epsilon) {
    const t = -halfB / a;
    if (lineFamilyRangeContains(t, kind)) {
      outPoints.push({ x: ox + t * dx, y: oy + t * dy });
    }
    return outPoints;
  }

  // disc > 0: 두 root. a > 0, sqrtDisc ≥ 0이므로 t1 ≤ t2로 이미 오름차순이다.
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-halfB - sqrtDisc) / a;
  const t2 = (-halfB + sqrtDisc) / a;

  if (lineFamilyRangeContains(t1, kind)) {
    outPoints.push({ x: ox + t1 * dx, y: oy + t1 * dy });
  }
  if (lineFamilyRangeContains(t2, kind)) {
    outPoints.push({ x: ox + t2 * dx, y: oy + t2 * dy });
  }

  return outPoints;
}
