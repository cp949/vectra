import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY, writeXY } from '../internal/xy';
import type {
  CurveIntersectionOptions,
  InfiniteLineLike,
  IntersectionHit,
  IntersectionKind,
  XYObjectWritable,
  XYWritable,
} from '../types';

export const DEFAULT_EPSILON_T = 1e-10;

/** subdivision 재귀 기본 깊이 상한. */
export const DEFAULT_MAX_DEPTH = 32;

/** terminal subdivision box fan-out을 같은 교차점으로 병합하는 parameter span factor. */
export const SUBDIVISION_DEDUPE_T_FACTOR = 4;

/** terminal subdivision midpoint의 tangent 오차를 흡수하는 relative cross factor. */
export const SUBDIVISION_KIND_EPSILON_FACTOR = 128;

/** line 기반 intersection 계산에 쓰이는 준비된 값들. */
export interface LineSetup {
  ox: number;
  oy: number;
  dx: number;
  dy: number;
  /** normal: (-dy, dx) */
  nx: number;
  ny: number;
  /** D·D (speed squared) — tA 계산 분모 */
  dd: number;
  /** n·O — implicit 방정식 상수항 보정 */
  nDotO: number;
}

/**
 * InfiniteLineLike에서 intersection 계산용 값을 추출한다.
 * direction이 zero-vector이면 null을 반환한다.
 */
export function setupLine(line: InfiniteLineLike): LineSetup | null {
  const origin = readInfiniteLineOrigin(line);
  const direction = readInfiniteLineDirection(line);
  const ox = readX(origin);
  const oy = readY(origin);
  const dx = readX(direction);
  const dy = readY(direction);
  const dd = dx * dx + dy * dy;
  // zero-length direction → hit 없음
  if (dd < DEFAULT_EPSILON * DEFAULT_EPSILON) return null;
  const nx = -dy;
  const ny = dx;
  const nDotO = nx * ox + ny * oy;
  return { ox, oy, dx, dy, nx, ny, dd, nDotO };
}

/**
 * hit point P에서 tA를 계산한다: tA = D·(P-O) / (D·D)
 */
export function computeTA(px: number, py: number, setup: LineSetup): number {
  return (setup.dx * (px - setup.ox) + setup.dy * (py - setup.oy)) / setup.dd;
}

/**
 * 새 IntersectionHit를 생성해 outHits에 push한다.
 * 이미 등록된 hit와 |tB1 - tB2| <= epsilonT 이면 추가하지 않는다.
 */
export function pushHitIfNew<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  px: number,
  py: number,
  kind: IntersectionKind,
  tA: number,
  tB: number,
  epsilonT: number,
  makePoint: () => P
): void {
  for (const existing of outHits) {
    if (Math.abs(existing.tB - tB) <= epsilonT) return;
  }
  writeHit(outHits, px, py, kind, tA, tB, makePoint);
}

/** dedupe 없이 새 IntersectionHit를 생성해 outHits에 push한다. */
export function writeHit<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  px: number,
  py: number,
  kind: IntersectionKind,
  tA: number,
  tB: number,
  makePoint: () => P
): void {
  const point = makePoint();
  writeXY(point as XYWritable, px, py);
  outHits.push({ point, kind, tA, tB });
}

/** CurveIntersectionOptions에서 epsilon/epsilonT를 추출한다. */
export function resolveOptions(options: CurveIntersectionOptions | undefined): {
  epsilon: number;
  epsilonT: number;
} {
  return {
    epsilon: options?.epsilon ?? DEFAULT_EPSILON,
    epsilonT: options?.epsilonT ?? DEFAULT_EPSILON_T,
  };
}

/**
 * 새 IntersectionHit를 생성해 outHits에 push한다.
 * 이미 등록된 hit와 (tA, tB) 쌍이 모두 epsilonT 이내이면 추가하지 않는다.
 * curve × curve subdivision kernel 전용 — line kernel의 pushHitIfNew와 dedupe 기준이 다르다.
 */
export function pushHitIfNewAB<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  px: number,
  py: number,
  kind: IntersectionKind,
  tA: number,
  tB: number,
  epsilonT: number,
  makePoint: () => P
): void {
  for (const existing of outHits) {
    if (Math.abs(existing.tA - tA) <= epsilonT && Math.abs(existing.tB - tB) <= epsilonT) {
      if (existing.kind === 'cross' && kind === 'touch') existing.kind = 'touch';
      return;
    }
  }
  writeHit(outHits, px, py, kind, tA, tB, makePoint);
}

/**
 * 두 AABB가 epsilon margin을 포함해 겹치면 true를 반환한다.
 * hull bound(control point 포함 convex hull)를 사용하므로 실제 AABB보다 보수적이다.
 */
export function boundsOverlap(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  epsilon: number
): boolean {
  return ax0 <= bx1 + epsilon && bx0 <= ax1 + epsilon && ay0 <= by1 + epsilon && by0 <= ay1 + epsilon;
}

/**
 * quadratic Bezier의 control point hull AABB를 반환한다.
 * 실제 curve AABB보다 보수적이지만 subdivision이 깊어질수록 수렴한다.
 */
export function quadraticHullBounds(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number
): [number, number, number, number] {
  return [Math.min(p0x, p1x, p2x), Math.min(p0y, p1y, p2y), Math.max(p0x, p1x, p2x), Math.max(p0y, p1y, p2y)];
}

/**
 * cubic Bezier의 control point hull AABB를 반환한다.
 * 실제 curve AABB보다 보수적이지만 subdivision이 깊어질수록 수렴한다.
 */
export function cubicHullBounds(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number
): [number, number, number, number] {
  return [
    Math.min(p0x, p1x, p2x, p3x),
    Math.min(p0y, p1y, p2y, p3y),
    Math.max(p0x, p1x, p2x, p3x),
    Math.max(p0y, p1y, p2y, p3y),
  ];
}

/**
 * t 위치에서 quadratic Bezier의 tangent (미분벡터)를 계산한다.
 * B'(t) = 2(1-t)(p1-p0) + 2t(p2-p1)
 */
export function quadraticTangent(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  t: number
): [number, number] {
  const mt = 1 - t;
  return [2 * mt * (p1x - p0x) + 2 * t * (p2x - p1x), 2 * mt * (p1y - p0y) + 2 * t * (p2y - p1y)];
}

/**
 * t 위치에서 cubic Bezier의 tangent (미분벡터)를 계산한다.
 * B'(t) = 3(1-t)²(p1-p0) + 6(1-t)t(p2-p1) + 3t²(p3-p2)
 */
export function cubicTangent(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  t: number
): [number, number] {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return [
    3 * mt2 * (p1x - p0x) + 6 * mt * t * (p2x - p1x) + 3 * t2 * (p3x - p2x),
    3 * mt2 * (p1y - p0y) + 6 * mt * t * (p2y - p1y) + 3 * t2 * (p3y - p2y),
  ];
}

/**
 * 두 tangent 벡터의 cross product z-성분을 기반으로 교차 종류를 판정한다.
 * cross_z ≈ 0이면 접촉(touch), 그렇지 않으면 관통(cross).
 * epsilonCross는 |cross_z| / (|tA| * |tB|)에 대한 상대 임계값이다.
 */
export function classifyIntersectionKind(
  taxDx: number,
  taxDy: number,
  tbxDx: number,
  tbxDy: number,
  epsilon: number
): IntersectionKind {
  const crossZ = taxDx * tbxDy - taxDy * tbxDx;
  const lenA = Math.hypot(taxDx, taxDy);
  const lenB = Math.hypot(tbxDx, tbxDy);
  // 두 tangent 중 하나가 zero-length이면 'cross'로 보수적으로 처리한다
  const zeroEpsilon = Math.min(epsilon, DEFAULT_EPSILON);
  if (lenA < zeroEpsilon || lenB < zeroEpsilon) return 'cross';
  const relCross = Math.abs(crossZ) / (lenA * lenB);
  return relCross < epsilon ? 'touch' : 'cross';
}

/** Newton refinement 반복 상한. 수렴 지점에서 시작하므로 2회면 double 정밀도에 닿는다. */
const NEWTON_MAX_ITERATIONS = 3;

/**
 * Newton step이 시작 parameter에서 벗어날 수 있는 최대 거리를 box span의 몇 배로 볼지 정한다.
 * 얕은 각도로 교차하면 box 중점에서 실제 근까지 span의 수십 배가 떨어질 수 있다.
 * 너무 작으면 보정을 거절당한 box가 보정된 hit 옆에 중복 hit로 남는다.
 */
const NEWTON_MAX_SHIFT_FACTOR = 64;

/** Jacobian을 특이로 보는 상대 임계값. |A' × B'| / (|A'||B'|) 즉 두 tangent 사이 sin 값이다. */
const NEWTON_SINGULAR_FACTOR = 1e-6;

/** 곡선 평가 결과 [x, y, dx/dt, dy/dt]를 out에 쓴다. */
export type CurveEvaluator = (t: number, out: [number, number, number, number]) => void;

/** quadratic Bezier의 위치와 1차 미분을 out에 쓴다. */
export function evalQuadraticInto(p: QuadFlat, t: number, out: [number, number, number, number]): void {
  const mt = 1 - t;
  out[0] = mt * mt * p[0] + 2 * mt * t * p[2] + t * t * p[4];
  out[1] = mt * mt * p[1] + 2 * mt * t * p[3] + t * t * p[5];
  out[2] = 2 * mt * (p[2] - p[0]) + 2 * t * (p[4] - p[2]);
  out[3] = 2 * mt * (p[3] - p[1]) + 2 * t * (p[5] - p[3]);
}

/** cubic Bezier의 위치와 1차 미분을 out에 쓴다. */
export function evalCubicInto(p: CubicFlat, t: number, out: [number, number, number, number]): void {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  out[0] = a * p[0] + b * p[2] + c * p[4] + d * p[6];
  out[1] = a * p[1] + b * p[3] + c * p[5] + d * p[7];
  const da = 3 * mt * mt;
  const db = 6 * mt * t;
  const dc = 3 * t * t;
  out[2] = da * (p[2] - p[0]) + db * (p[4] - p[2]) + dc * (p[6] - p[4]);
  out[3] = da * (p[3] - p[1]) + db * (p[5] - p[3]) + dc * (p[7] - p[5]);
}

/**
 * subdivision sub-curve를 원본 parameter 기준 evaluator로 감싼다.
 * sub는 원본 구간 [t0, t0 + span]을 local [0, 1]로 담고 있다.
 * 미분은 chain rule에 따라 span으로 나눈다.
 */
export function subCurveEvaluator<S>(
  evalLocal: (sub: S, t: number, out: [number, number, number, number]) => void,
  sub: S,
  t0: number,
  span: number
): CurveEvaluator {
  return (t, out) => {
    evalLocal(sub, (t - t0) / span, out);
    out[2] /= span;
    out[3] /= span;
  };
}

/**
 * 수렴 지점 (tA, tB)에서 F(t, u) = A(t) - B(u) = 0 을 2D Newton으로 다듬는다.
 * subdivision은 maxDepth에서 멈춰 parameter 정밀도가 span 수준에 그치므로 그 뒤에 보정한다.
 *
 * 다음이면 step을 버리고 직전 값을 유지한다.
 * - Jacobian이 특이하다 (touch, 평행 tangent).
 * - 새 값이 [0, 1] 밖이거나 시작점에서 maxShift보다 멀다.
 * - 잔차 |F|²가 줄지 않는다.
 *
 * @param span 수렴 box의 parameter span. 시작점에서 허용하는 최대 이동량(span의 배수)을 정한다.
 * @returns 다듬은 [tA, tB]. 한 번도 받아들이지 못하면 입력 값 그대로다.
 */
export function refineIntersectionParams(
  evalA: CurveEvaluator,
  evalB: CurveEvaluator,
  tA: number,
  tB: number,
  span: number
): [number, number] {
  const maxShift = NEWTON_MAX_SHIFT_FACTOR * span;
  const a: [number, number, number, number] = [0, 0, 0, 0];
  const b: [number, number, number, number] = [0, 0, 0, 0];
  let t = tA;
  let u = tB;
  evalA(t, a);
  evalB(u, b);
  let fx = a[0] - b[0];
  let fy = a[1] - b[1];
  let residual = fx * fx + fy * fy;

  for (let i = 0; i < NEWTON_MAX_ITERATIONS; i++) {
    const det = b[2] * a[3] - a[2] * b[3];
    const scale = Math.hypot(a[2], a[3]) * Math.hypot(b[2], b[3]);
    // NaN이면 비교가 false라 아래 조건을 통과하지 못한다
    if (!(Math.abs(det) > NEWTON_SINGULAR_FACTOR * scale)) break;

    const nextT = t + (fx * b[3] - b[2] * fy) / det;
    const nextU = u + (a[3] * fx - a[2] * fy) / det;
    if (!(nextT >= 0 && nextT <= 1 && nextU >= 0 && nextU <= 1)) break;
    if (!(Math.abs(nextT - tA) <= maxShift && Math.abs(nextU - tB) <= maxShift)) break;

    evalA(nextT, a);
    evalB(nextU, b);
    const nextFx = a[0] - b[0];
    const nextFy = a[1] - b[1];
    const nextResidual = nextFx * nextFx + nextFy * nextFy;
    if (!(nextResidual < residual)) break;

    t = nextT;
    u = nextU;
    fx = nextFx;
    fy = nextFy;
    residual = nextResidual;
  }
  return [t, u];
}

/** cubic sub-curve flat 좌표 — [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y]. */
export type CubicFlat = [number, number, number, number, number, number, number, number];

/** quadratic sub-curve flat 좌표 — [p0x, p0y, p1x, p1y, p2x, p2y]. */
export type QuadFlat = [number, number, number, number, number, number];

/**
 * cubic Bezier를 t=0.5에서 De Casteljau 분할한다.
 */
export function splitCubic(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number
): [CubicFlat, CubicFlat] {
  const m01x = (p0x + p1x) * 0.5;
  const m01y = (p0y + p1y) * 0.5;
  const m12x = (p1x + p2x) * 0.5;
  const m12y = (p1y + p2y) * 0.5;
  const m23x = (p2x + p3x) * 0.5;
  const m23y = (p2y + p3y) * 0.5;
  const m012x = (m01x + m12x) * 0.5;
  const m012y = (m01y + m12y) * 0.5;
  const m123x = (m12x + m23x) * 0.5;
  const m123y = (m12y + m23y) * 0.5;
  const mx = (m012x + m123x) * 0.5;
  const my = (m012y + m123y) * 0.5;
  return [
    [p0x, p0y, m01x, m01y, m012x, m012y, mx, my],
    [mx, my, m123x, m123y, m23x, m23y, p3x, p3y],
  ];
}

/**
 * quadratic Bezier를 t=0.5에서 De Casteljau 분할한다.
 */
export function splitQuadratic(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number
): [QuadFlat, QuadFlat] {
  const m01x = (p0x + p1x) * 0.5;
  const m01y = (p0y + p1y) * 0.5;
  const m12x = (p1x + p2x) * 0.5;
  const m12y = (p1y + p2y) * 0.5;
  const mx = (m01x + m12x) * 0.5;
  const my = (m01y + m12y) * 0.5;
  return [
    [p0x, p0y, m01x, m01y, mx, my],
    [mx, my, m12x, m12y, p2x, p2y],
  ];
}

/** curve × curve subdivision kernel에 주입하는 타입별 adapter 묶음. */
export interface CurveSubdivisionAdapters<A, B, P extends XYWritable> {
  /** curve A sub-curve의 control point hull AABB. */
  hullBoundsA: (sub: A) => [number, number, number, number];

  /** curve B sub-curve의 control point hull AABB. */
  hullBoundsB: (sub: B) => [number, number, number, number];

  /** curve A sub-curve를 t=0.5에서 두 half로 분할한다. */
  splitA: (sub: A) => [A, A];

  /** curve B sub-curve를 t=0.5에서 두 half로 분할한다. */
  splitB: (sub: B) => [B, B];

  /** true를 반환한 parameter box는 재귀하지 않는다. 겹침 구간 내부 box를 건너뛸 때 쓴다. */
  skipBox?: (tA0: number, tA1: number, tB0: number, tB1: number) => boolean;

  /**
   * subdivision이 수렴(또는 maxDepth 도달)했을 때 호출된다.
   * origA는 재귀 내내 불변인 curve A 원본 좌표 — 정밀 교차점 계산에 사용한다.
   * bSub는 현재 재귀 depth의 curve B sub-curve 좌표다.
   * self-intersection처럼 A/B가 같은 원본을 공유하는 경우 bSub는 무시해도 된다.
   */
  onConverge: (
    outHits: IntersectionHit<P>[],
    tA0: number,
    tA1: number,
    tB0: number,
    tB1: number,
    origA: A,
    bSub: B,
    epsilon: number,
    epsilonT: number,
    makePoint: () => P
  ) => void;
}

/**
 * curve × curve subdivision 재귀 kernel.
 * hull bound가 겹치지 않으면 branch를 중단하고, span이 더 큰 쪽을 매 단계 분할해
 * parameter box를 좁힌다. 수렴(또는 maxDepth 도달) 시 adapters.onConverge에 위임한다.
 *
 * adapters.skipBox가 true를 반환한 box는 hull 검사 없이 버린다.
 *
 * 호출자는 각 parameter 구간을 오름차순으로 전달하고 epsilon/epsilonT/maxDepth/depth를
 * 음이 아닌 값으로 보장해야 한다. 일반 호출은 depth=0에서 시작한다. zero-span 구간은
 * 양쪽 span이 epsilonT 이하일 때 즉시 수렴한다.
 */
export function subdivideCurves<A, B, P extends XYWritable>(
  outHits: IntersectionHit<P>[],
  aSub: A,
  tA0: number,
  tA1: number,
  bSub: B,
  tB0: number,
  tB1: number,
  // 원본 curve A 좌표 — 수렴 시 정밀 좌표 계산에 사용한다
  origA: A,
  epsilon: number,
  epsilonT: number,
  maxDepth: number,
  depth: number,
  makePoint: () => P,
  adapters: CurveSubdivisionAdapters<A, B, P>
): void {
  const { hullBoundsA, hullBoundsB, splitA, splitB, skipBox, onConverge } = adapters;
  if (skipBox?.(tA0, tA1, tB0, tB1)) return;

  const [aMinX, aMinY, aMaxX, aMaxY] = hullBoundsA(aSub);
  const [bMinX, bMinY, bMaxX, bMaxY] = hullBoundsB(bSub);

  if (!boundsOverlap(aMinX, aMinY, aMaxX, aMaxY, bMinX, bMinY, bMaxX, bMaxY, epsilon)) return;

  const spanA = tA1 - tA0;
  const spanB = tB1 - tB0;

  if ((spanA <= epsilonT && spanB <= epsilonT) || depth >= maxDepth) {
    onConverge(outHits, tA0, tA1, tB0, tB1, origA, bSub, epsilon, epsilonT, makePoint);
    return;
  }

  if (spanA >= spanB) {
    const tAMid = (tA0 + tA1) * 0.5;
    const [leftA, rightA] = splitA(aSub);
    subdivideCurves(
      outHits,
      leftA,
      tA0,
      tAMid,
      bSub,
      tB0,
      tB1,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint,
      adapters
    );
    subdivideCurves(
      outHits,
      rightA,
      tAMid,
      tA1,
      bSub,
      tB0,
      tB1,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint,
      adapters
    );
  } else {
    const tBMid = (tB0 + tB1) * 0.5;
    const [leftB, rightB] = splitB(bSub);
    subdivideCurves(
      outHits,
      aSub,
      tA0,
      tA1,
      leftB,
      tB0,
      tBMid,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint,
      adapters
    );
    subdivideCurves(
      outHits,
      aSub,
      tA0,
      tA1,
      rightB,
      tBMid,
      tB1,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint,
      adapters
    );
  }
}
