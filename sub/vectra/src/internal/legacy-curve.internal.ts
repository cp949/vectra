import { readInfiniteLineDirection, readInfiniteLineOrigin } from './infinite-line';
import { DEFAULT_EPSILON } from './numeric';
import type { CurveIntersectionOptions, CurveLike, InfiniteLineLike, XYInput } from '../types';
import type { CubicCurve, Curve, InfiniteLine, QuadraticCurve } from '../types/flat-shapes.internal';
import { readX, readY } from './xy';

// v2-migration: 곡선 호출처가 평평한 제어점을 넘기면 이 변환을 지운다.
/** 기존 제어점 세 개를 평평한 이차 베지어로 옮긴다. */
export function flatQuadraticFromLegacyPoints(p0: XYInput, p1: XYInput, p2: XYInput): QuadraticCurve {
  return {
    kind: 'quadratic',
    x0: readX(p0),
    y0: readY(p0),
    x1: readX(p1),
    y1: readY(p1),
    x2: readX(p2),
    y2: readY(p2),
  };
}

/** 기존 제어점 네 개를 평평한 삼차 베지어로 옮긴다. */
export function flatCubicFromLegacyPoints(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput): CubicCurve {
  return {
    kind: 'cubic',
    x0: readX(p0),
    y0: readY(p0),
    x1: readX(p1),
    y1: readY(p1),
    x2: readX(p2),
    y2: readY(p2),
    x3: readX(p3),
    y3: readY(p3),
  };
}

/** 기존 판별 유니언을 평평한 곡선으로 옮긴다. */
export function flatCurveFromLegacy(curve: CurveLike): Curve {
  return curve.kind === 'cubic'
    ? flatCubicFromLegacyPoints(curve.p0, curve.p1, curve.p2, curve.p3)
    : flatQuadraticFromLegacyPoints(curve.p0, curve.p1, curve.p2);
}

/** 기존 직선 입력을 평평한 교차 커널 입력으로 옮긴다. */
export function flatLineFromLegacy(line: InfiniteLineLike): InfiniteLine {
  const origin = readInfiniteLineOrigin(line);
  const direction = readInfiniteLineDirection(line);
  return { ox: readX(origin), oy: readY(origin), dx: readX(direction), dy: readY(direction) };
}

/** 기존 교차 파사드의 부분 옵션에 같은 기본값을 채운다. */
export function flatIntersectionOptions(
  options: CurveIntersectionOptions | undefined
): Required<CurveIntersectionOptions> | undefined {
  if (options === undefined) return undefined;
  return {
    epsilon: options.epsilon ?? DEFAULT_EPSILON,
    epsilonT: options.epsilonT ?? 1e-10,
    maxDepth: options.maxDepth ?? 32,
  };
}
