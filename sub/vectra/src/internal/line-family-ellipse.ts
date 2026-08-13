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
 * 판별식 계산은 {@link solveLineFamilyEllipse} kernel 하나로 모으고, 세 exported 함수는
 * 그 결과를 boolean/첫 점/전체 점으로 투영하는 adapter다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { XYObjectWritable, XYWritable } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import { lineFamilyRangeContains } from './line-family-range.internal';
import { writeXY } from './xy';

/**
 * {@link solveLineFamilyEllipse}의 결과. `kind`로 판별식 분기를 구분한다.
 *
 * - `none`      — empty ellipse 또는 교점 없음(disc < -epsilon²). 세 adapter 모두 "hit 없음".
 * - `degenerate`— direction이 zero-vector(a===0). `inside`(= origin이 closed disk 안)만 의미가
 *   있고, boolean adapter만 이 값을 쓴다. point/points adapter는 kind만 보고 항상 빈 결과다.
 * - `tangent`   — disc ≈ 0(epsilon band 안). 접점 `t` 하나. `inside`는 boolean adapter의
 *   range-밖 fallback에만 쓴다.
 * - `two-root`  — disc > epsilon². `t1 <= t2`(오름차순). `inside`는 tangent와 동일한 fallback 용도.
 */
export type LineFamilyEllipseSolution =
  | { readonly kind: 'none' }
  | { readonly kind: 'degenerate'; readonly inside: boolean }
  | { readonly kind: 'tangent'; readonly t: number; readonly inside: boolean }
  | { readonly kind: 'two-root'; readonly t1: number; readonly t2: number; readonly inside: boolean };

/**
 * 반복 호출에서 solve 결과 object를 재사용하기 위한 writable buffer.
 *
 * `kind`에 대응하는 field만 유효하다. `none`은 추가 field가 없고, `degenerate`는 `inside`,
 * `tangent`는 `t`/`inside`, `two-root`는 `t1`/`t2`/`inside`를 쓴다.
 */
export interface LineFamilyEllipseSolutionBuffer {
  kind: LineFamilyEllipseSolution['kind'];
  inside: boolean;
  t: number;
  t1: number;
  t2: number;
}

const solutionScratch: LineFamilyEllipseSolutionBuffer = {
  kind: 'none',
  inside: false,
  t: 0,
  t1: 0,
  t2: 0,
};

/**
 * line-family × ellipse 정규화 판별식을 계산해 분기 결과를 반환한다.
 *
 * `lineFamilyEllipseIntersects`/`IntersectionPoint`/`IntersectionPoints` 세 함수가 공유하는
 * kernel — 정규화(U/V/DU/DV)와 이차계수(a/halfB/c)·판별식(disc)을 한 번만 계산한다.
 *
 * @param ox    line-family origin x
 * @param oy    line-family origin y
 * @param dx    line-family direction x
 * @param dy    line-family direction y
 * @param cx    ellipse center x
 * @param cy    ellipse center y
 * @param rx    ellipse x반지름
 * @param ry    ellipse y반지름
 * @param epsilon discriminant 0 근방 임계값
 * @param out 반복 호출에서 재사용할 결과 buffer. 생략하면 정확한 discriminated-union object를 새로 만든다.
 */
export function solveLineFamilyEllipse(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number
): LineFamilyEllipseSolution;
export function solveLineFamilyEllipse(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number,
  out: LineFamilyEllipseSolutionBuffer
): LineFamilyEllipseSolutionBuffer;
export function solveLineFamilyEllipse(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number,
  out?: LineFamilyEllipseSolutionBuffer
): LineFamilyEllipseSolution | LineFamilyEllipseSolutionBuffer {
  // empty ellipse
  if (rx <= 0 || ry <= 0) {
    if (!out) return { kind: 'none' };
    out.kind = 'none';
    return out;
  }

  // 정규화된 좌표
  const U = (ox - cx) / rx;
  const V = (oy - cy) / ry;
  const DU = dx / rx;
  const DV = dy / ry;

  // quadratic coefficients: a·t² + 2b·t + c = 0 (b는 half-b)
  const a = DU * DU + DV * DV;
  const halfB = U * DU + V * DV;
  const c = U * U + V * V - 1;

  // degenerate direction: origin이 ellipse 위 또는 내부인지만 boolean adapter에 전달
  if (a === 0) {
    const inside = c <= 0;
    if (!out) return { kind: 'degenerate', inside };
    out.kind = 'degenerate';
    out.inside = inside;
    return out;
  }

  // disc = 4(halfB² - a·c) — 4로 나눈 reduced discriminant를 사용
  const disc = halfB * halfB - a * c;

  // 교점 없음
  if (disc < -epsilon * epsilon) {
    if (!out) return { kind: 'none' };
    out.kind = 'none';
    return out;
  }

  // tangent (disc ≈ 0): 접점 t가 range 안이면 true. range 밖이어도 origin이 closed disk(c ≤ 0)면
  // boundary touch이므로 true(crossing 분기 fallback과 같은 closed disk 정책). near-tangent
  // boundary origin은 접점 t가 epsilon band에서 range 밖으로 밀려 t 비교만으론 false가 된다.
  if (disc <= epsilon * epsilon) {
    const t = -halfB / a;
    const inside = c <= 0;
    if (!out) return { kind: 'tangent', t, inside };
    out.kind = 'tangent';
    out.t = t;
    out.inside = inside;
    return out;
  }

  // disc > 0: 두 root. a > 0, sqrtDisc ≥ 0이므로 t1 ≤ t2로 이미 오름차순이다.
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-halfB - sqrtDisc) / a;
  const t2 = (-halfB + sqrtDisc) / a;
  const inside = c <= 0;
  if (!out) return { kind: 'two-root', t1, t2, inside };
  out.kind = 'two-root';
  out.t1 = t1;
  out.t2 = t2;
  out.inside = inside;
  return out;
}

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
  const sol = solveLineFamilyEllipse(ox, oy, dx, dy, cx, cy, rx, ry, epsilon, solutionScratch);
  switch (sol.kind) {
    case 'none':
      return false;
    case 'degenerate':
      return sol.inside;
    case 'tangent':
      // range 밖이어도 origin이 closed disk(inside)면 boundary touch이므로 true.
      return lineFamilyRangeContains(sol.t, kind) || sol.inside;
    case 'two-root':
      // range 밖: origin이 ellipse 내부 또는 경계(closed disk)이면 true.
      return lineFamilyRangeContains(sol.t1, kind) || lineFamilyRangeContains(sol.t2, kind) || sol.inside;
  }
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
  const sol = solveLineFamilyEllipse(ox, oy, dx, dy, cx, cy, rx, ry, epsilon, solutionScratch);
  // none/degenerate: point output 항상 false
  if (sol.kind === 'none' || sol.kind === 'degenerate') return false;

  if (sol.kind === 'tangent') {
    if (!lineFamilyRangeContains(sol.t, kind)) return false;
    writeXY(out, ox + sol.t * dx, oy + sol.t * dy);
    return true;
  }

  // two-root
  const in1 = lineFamilyRangeContains(sol.t1, kind);
  const in2 = lineFamilyRangeContains(sol.t2, kind);

  // 2-point crossing → false (out 미수정)
  if (in1 && in2) return false;

  if (in1) {
    writeXY(out, ox + sol.t1 * dx, oy + sol.t1 * dy);
    return true;
  }
  if (in2) {
    writeXY(out, ox + sol.t2 * dx, oy + sol.t2 * dy);
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

  const sol = solveLineFamilyEllipse(ox, oy, dx, dy, cx, cy, rx, ry, epsilon, solutionScratch);
  // none/degenerate: 교점 collection은 항상 빈 배열
  if (sol.kind === 'none' || sol.kind === 'degenerate') return outPoints;

  // tangent (disc ≈ 0): 중복 없이 1점만 push
  if (sol.kind === 'tangent') {
    if (lineFamilyRangeContains(sol.t, kind)) {
      outPoints.push({ x: ox + sol.t * dx, y: oy + sol.t * dy });
    }
    return outPoints;
  }

  // two-root: t1 ≤ t2로 이미 오름차순이다.
  if (lineFamilyRangeContains(sol.t1, kind)) {
    outPoints.push({ x: ox + sol.t1 * dx, y: oy + sol.t1 * dy });
  }
  if (lineFamilyRangeContains(sol.t2, kind)) {
    outPoints.push({ x: ox + sol.t2 * dx, y: oy + sol.t2 * dy });
  }

  return outPoints;
}
