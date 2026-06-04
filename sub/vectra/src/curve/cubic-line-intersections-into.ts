import { readX, readY } from '../internal/xy';
import type {
  CurveIntersectionOptions,
  InfiniteLineLike,
  IntersectionHit,
  XYInput,
  XYObjectWritable,
  XYWritable,
} from '../types';
import { solveCubicInClosedUnit } from './cubic-solve.internal';
import { computeTA, pushHitIfNew, resolveOptions, setupLine } from './curve-intersections.internal';

/**
 * cubic Bezier curve와 infinite-line의 교차점을 outHits에 push한다.
 *
 * implicit polynomial 방식: n·B(t) - n·O = 0 (cubic → at³ + bt² + ct + d = 0)
 * tA: line parameter (origin + direction * tA), tB: curve parameter [0,1]
 * range 밖 root는 버린다. zero direction은 hit 없음.
 *
 * @param outHits 결과 배열 (호출 전 비워야 한다)
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param line infinite-line (origin + direction)
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 */
export function cubicLineIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  line: InfiniteLineLike,
  options?: CurveIntersectionOptions
): void {
  outHits.length = 0;

  const setup = setupLine(line);
  if (!setup) return;

  const { nx, ny, nDotO, epsilon, epsilonT } = { ...setup, ...resolveOptions(options) };

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  // n·P_i
  const n0 = nx * p0x + ny * p0y;
  const n1 = nx * p1x + ny * p1y;
  const n2 = nx * p2x + ny * p2y;
  const n3 = nx * p3x + ny * p3y;

  // cubic Bezier를 풀면:
  // f(t) = (-n0 + 3n1 - 3n2 + n3)t³ + (3n0 - 6n1 + 3n2)t² + (-3n0 + 3n1)t + (n0 - nDotO) = 0
  const ca = -n0 + 3 * n1 - 3 * n2 + n3;
  const cb = 3 * n0 - 6 * n1 + 3 * n2;
  const cc = -3 * n0 + 3 * n1;
  const cd = n0 - nDotO;

  // 다항식 계수 degeneracy 판정용 — 좌표 공간 epsilon(1e-9)보다 타이트하게 수치 noise만 차단
  const INTERNAL_EPS = 1e-12;

  const makePoint = (): P => ({}) as P;

  // curve 전체가 line 위에 놓이는 overlap case는 현재 result type이 interval을 표현하지 못한다.
  // endpoint touch로 축약하면 caller가 finite point 교차로 오해하므로 hit 없음으로 둔다.
  if (
    Math.abs(ca) < INTERNAL_EPS &&
    Math.abs(cb) < INTERNAL_EPS &&
    Math.abs(cc) < INTERNAL_EPS &&
    Math.abs(cd) < INTERNAL_EPS
  ) {
    return;
  }

  // endpoint를 solver보다 먼저 명시적으로 확인한다.
  // Cardano 공식은 t=0/1이 정확한 근일 때 수치 오차로 찾지 못할 수 있다.
  const f0 = cd; // f(0) = n0 - nDotO
  const f1 = ca + cb + cc + cd; // f(1)
  if (Math.abs(f0) <= epsilon) {
    const px = p0x;
    const py = p0y;
    pushHitIfNew(outHits, px, py, 'touch', computeTA(px, py, setup), 0, epsilonT, makePoint);
  }
  if (Math.abs(f1) <= epsilon) {
    const px = p3x;
    const py = p3y;
    pushHitIfNew(outHits, px, py, 'touch', computeTA(px, py, setup), 1, epsilonT, makePoint);
  }

  const roots: number[] = [];
  solveCubicInClosedUnit(roots, ca, cb, cc, cd);

  for (const t of roots) {
    const px = evaluateCubicX(p0x, p1x, p2x, p3x, t);
    const py = evaluateCubicY(p0y, p1y, p2y, p3y, t);
    const tA = computeTA(px, py, setup);

    // endpoint이거나 f'(t) ≈ 0이면 touch, 아니면 cross
    const isEndpoint = t <= epsilonT || t >= 1 - epsilonT;
    let kind: 'cross' | 'touch';
    if (isEndpoint) {
      kind = 'touch';
    } else {
      // 도함수 f'(t) ≈ 0이면 접선 → touch
      const fp = 3 * ca * t * t + 2 * cb * t + cc;
      // 다항식 도함수 계수 크기로 normalize — scale-invariant touch 판정
      const fpScale = Math.max(Math.abs(3 * ca), Math.abs(2 * cb), Math.abs(cc), INTERNAL_EPS);
      kind = Math.abs(fp) / fpScale < 1e-6 ? 'touch' : 'cross';
    }

    pushHitIfNew(outHits, px, py, kind, tA, t, epsilonT, makePoint);
  }
}

function evaluateCubicX(p0x: number, p1x: number, p2x: number, p3x: number, t: number): number {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return mt3 * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * p3x;
}

function evaluateCubicY(p0y: number, p1y: number, p2y: number, p3y: number, t: number): number {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y;
}
