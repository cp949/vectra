/**
 * 기존 곡선 시험 데이터를 평평한 제어점과 교차 옵션으로 옮긴다.
 * v1 reader와 입력 타입에 기대지 않는다. F단계에서 v1 타입을 지워도 이 파일은 남는다.
 */
import { DEFAULT_EPSILON } from '../../../src/internal/numeric';
import type { CurveIntersectionOptions } from '../../../src/types';
import type { CubicCurve, Curve, InfiniteLine, QuadraticCurve } from '../../../src/types/flat-shapes.internal';

/** 시험 데이터의 점. 기존 시험은 점 객체와 [x, y] 배열을 함께 쓴다. */
type FixturePoint = { readonly x: number; readonly y: number } | readonly [number, number];

/** 시험 데이터 점의 x 좌표를 읽는다. */
function fixtureX(point: FixturePoint): number {
  return 'x' in point ? point.x : point[0];
}

/** 시험 데이터 점의 y 좌표를 읽는다. */
function fixtureY(point: FixturePoint): number {
  return 'y' in point ? point.y : point[1];
}

/** 제어점을 p0–p3 점으로 적은 곡선 시험 데이터. */
export type FixtureCurve =
  | { readonly kind: 'quadratic'; readonly p0: FixturePoint; readonly p1: FixturePoint; readonly p2: FixturePoint }
  | {
      readonly kind: 'cubic';
      readonly p0: FixturePoint;
      readonly p1: FixturePoint;
      readonly p2: FixturePoint;
      readonly p3: FixturePoint;
    };

/** 기점과 방향을 점으로 적은 직선 시험 데이터. [기점, 방향] 배열도 받는다. */
type FixtureLine =
  | { readonly origin: FixturePoint; readonly direction: FixturePoint }
  | readonly [FixturePoint, FixturePoint];

/** 기존 제어점 세 개를 평평한 이차 베지어로 옮긴다. */
export function flatQuadraticFromLegacyPoints(p0: FixturePoint, p1: FixturePoint, p2: FixturePoint): QuadraticCurve {
  return {
    kind: 'quadratic',
    x0: fixtureX(p0),
    y0: fixtureY(p0),
    x1: fixtureX(p1),
    y1: fixtureY(p1),
    x2: fixtureX(p2),
    y2: fixtureY(p2),
  };
}

/** 기존 제어점 네 개를 평평한 삼차 베지어로 옮긴다. */
export function flatCubicFromLegacyPoints(
  p0: FixturePoint,
  p1: FixturePoint,
  p2: FixturePoint,
  p3: FixturePoint
): CubicCurve {
  return {
    kind: 'cubic',
    x0: fixtureX(p0),
    y0: fixtureY(p0),
    x1: fixtureX(p1),
    y1: fixtureY(p1),
    x2: fixtureX(p2),
    y2: fixtureY(p2),
    x3: fixtureX(p3),
    y3: fixtureY(p3),
  };
}

/** 기존 판별 유니언을 평평한 곡선으로 옮긴다. */
export function flatCurveFromLegacy(curve: FixtureCurve): Curve {
  return curve.kind === 'cubic'
    ? flatCubicFromLegacyPoints(curve.p0, curve.p1, curve.p2, curve.p3)
    : flatQuadraticFromLegacyPoints(curve.p0, curve.p1, curve.p2);
}

/** 기존 직선 입력을 평평한 교차 커널 입력으로 옮긴다. */
export function flatLineFromLegacy(line: FixtureLine): InfiniteLine {
  const origin = 'origin' in line ? line.origin : line[0];
  const direction = 'direction' in line ? line.direction : line[1];
  return { ox: fixtureX(origin), oy: fixtureY(origin), dx: fixtureX(direction), dy: fixtureY(direction) };
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
