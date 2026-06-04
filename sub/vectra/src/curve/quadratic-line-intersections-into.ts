import { readX, readY } from '../internal/xy';
import type {
  CurveIntersectionOptions,
  InfiniteLineLike,
  IntersectionHit,
  XYInput,
  XYObjectWritable,
  XYWritable,
} from '../types';
import { computeTA, pushHitIfNew, resolveOptions, setupLine } from './curve-intersections.internal';

/**
 * quadratic Bezier curve와 infinite-line의 교차점을 outHits에 push한다.
 *
 * implicit polynomial 방식: n·B(t) - n·O = 0 (quadratic → at² + bt + c = 0)
 * tA: line parameter (origin + direction * tA), tB: curve parameter [0,1]
 * range 밖 root는 버린다. zero direction은 hit 없음.
 *
 * @param outHits 결과 배열 (호출 전 비워야 한다)
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param line infinite-line (origin + direction)
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 */
export function quadraticLineIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
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

  // n·P_i
  const n0 = nx * p0x + ny * p0y;
  const n1 = nx * p1x + ny * p1y;
  const n2 = nx * p2x + ny * p2y;

  // quadratic Bezier를 풀면:
  // f(t) = (n0 - 2n1 + n2)t² + 2(n1 - n0)t + n0 - nDotO = 0
  const a = n0 - 2 * n1 + n2;
  const b = 2 * (n1 - n0);
  const c = n0 - nDotO;

  // makePoint factory — caller의 P generic에 맞춰 object를 생성한다
  // 기본값은 XYObjectWritable이므로 {} as P로 초기화한다
  const makePoint = (): P => ({}) as P;

  // 다항식 계수 degeneracy 판정용 — 좌표 공간 epsilon(1e-9)보다 타이트하게 수치 noise만 차단
  const INTERNAL_EPS = 1e-12;

  if (Math.abs(a) < INTERNAL_EPS) {
    // linear equation: bt + c = 0
    if (Math.abs(b) < INTERNAL_EPS) return;
    const t = -c / b;
    if (t >= -epsilonT && t <= 1 + epsilonT) {
      const tClamped = Math.max(0, Math.min(1, t));
      const px = evaluateQuadraticX(p0x, p1x, p2x, tClamped);
      const py = evaluateQuadraticY(p0y, p1y, p2y, tClamped);
      const tA = computeTA(px, py, setup);
      const kind = tClamped <= epsilonT || tClamped >= 1 - epsilonT ? 'touch' : 'cross';
      pushHitIfNew(outHits, px, py, kind, tA, tClamped, epsilonT, makePoint);
    }
    return;
  }

  const discriminant = b * b - 4 * a * c;

  if (discriminant < -epsilon) return;

  // discriminant ∈ (-epsilon, epsilon) 구간은 수치 noise로 허수가 된 근 — 중근으로 처리
  if (Math.abs(discriminant) <= epsilon) {
    // 중근 → touch
    const t = -b / (2 * a);
    if (t >= -epsilonT && t <= 1 + epsilonT) {
      const tClamped = Math.max(0, Math.min(1, t));
      const px = evaluateQuadraticX(p0x, p1x, p2x, tClamped);
      const py = evaluateQuadraticY(p0y, p1y, p2y, tClamped);
      const tA = computeTA(px, py, setup);
      pushHitIfNew(outHits, px, py, 'touch', tA, tClamped, epsilonT, makePoint);
    }
    return;
  }

  // 두 근 → cross (단, endpoint이면 touch)
  const sqrtD = Math.sqrt(Math.max(0, discriminant));
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);

  for (const t of [t1, t2]) {
    if (t < -epsilonT || t > 1 + epsilonT) continue;
    const tClamped = Math.max(0, Math.min(1, t));
    const px = evaluateQuadraticX(p0x, p1x, p2x, tClamped);
    const py = evaluateQuadraticY(p0y, p1y, p2y, tClamped);
    const tA = computeTA(px, py, setup);
    const kind = tClamped <= epsilonT || tClamped >= 1 - epsilonT ? 'touch' : 'cross';
    pushHitIfNew(outHits, px, py, kind, tA, tClamped, epsilonT, makePoint);
  }
}

function evaluateQuadraticX(p0x: number, p1x: number, p2x: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x;
}

function evaluateQuadraticY(p0y: number, p1y: number, p2y: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y;
}
