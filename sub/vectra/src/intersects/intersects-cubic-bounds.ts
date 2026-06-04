import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, XYInput } from '../types';
import { allFinite, curveBoundsIntersects, makeCubicProbe } from './curve-primitive-relation.internal';

/**
 * cubic Bezier segment와 axis-aligned bounds가 교차하면 true를 반환한다.
 *
 * curve가 bounds 경계를 가로지르거나 endpoint가 bounds 내부(경계 포함)이면 true. bounds가
 * curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다. zero-extent bounds는 유효
 * 입력이고 inverted bounds (min > max)만 false. non-finite 입력: false.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param bounds 교차를 검사할 bounds
 * @param epsilon curve × edge 교차 numeric tolerance
 */
export function intersectsCubicBounds(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  bounds: BoundsLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const x0 = readX(min);
  const y0 = readY(min);
  const x1 = readX(max);
  const y1 = readY(max);
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, x0, y0, x1, y1])) return false;

  return curveBoundsIntersects(makeCubicProbe(p0, p1, p2, p3, epsilon), p0x, p0y, p3x, p3y, x0, y0, x1, y1);
}
