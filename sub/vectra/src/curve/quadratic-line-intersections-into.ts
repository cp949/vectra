import { readX, readY } from '../internal/xy';
import { pushStableRoots } from '../math/quadratic-roots.internal';
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

  if (a === 0) {
    // linear equation: bt + c = 0
    if (b === 0) return;
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

  // 판별식은 길이² 단위라 길이 단위 epsilon과 직접 비교하면 좌표 scale에 따라 결과가 바뀐다.
  // 정점(t = -b/2a)과 직선 사이 거리로 바꿔 epsilon과 비교한다.
  // 법선 n = (-dy, dx)는 정규화하지 않아 |D| / (4|a|)는 거리 × |direction|이다. 그래서 √dd로 나눈다.
  // 정점이 epsilon 이내이면 수치 noise로 허수가 된 근도 중근으로 본다.
  if (Math.abs(discriminant) <= 4 * Math.abs(a) * epsilon * Math.sqrt(setup.dd)) {
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

  if (discriminant < 0) return;

  // 두 근 → cross (단, endpoint이면 touch)
  const roots: number[] = [];
  pushStableRoots(roots, a, b, c, Math.sqrt(discriminant));
  // hit 순서는 (-b - √D) / 2a, (-b + √D) / 2a 순이던 기존 결과와 같게 둔다. a < 0이면 tB 내림차순이다.
  if (a < 0) roots.reverse();

  for (const t of roots) {
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
