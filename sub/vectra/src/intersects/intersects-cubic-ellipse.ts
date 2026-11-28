import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CubicCurve, Ellipse } from '../types/flat-shapes.internal';
import { allFinite, curveEllipseDiskIntersects } from './curve-primitive-relation.internal';

/**
 * cubic Bezier segment와 ellipse가 교차하면 true를 반환한다.
 *
 * closed disk 판정. boundary 접촉(tangent), boundary 가로지르기, endpoint 내부 포함, ellipse가
 * curve를 완전히 둘러싸는 경우 모두 true. ellipse local 정규화로 implicit residual을 만들어
 * `[0, 1]` 최솟값으로 판정한다. empty ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * non-finite 입력: false.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param ellipse 교차를 검사할 ellipse
 * @param epsilon boundary 접촉 판정 tolerance. ellipse-local 정규화 residual에 대한 무차원
 *   임계값이며 geometric 거리가 아니다. geometric 접촉폭은 반지름에 비례한다.
 */
export function intersectsCubicEllipse(curve: CubicCurve, ellipse: Ellipse, epsilon = DEFAULT_EPSILON): boolean {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const p3x = curve.x3;
  const p3y = curve.y3;
  const { cx, cy, rx, ry } = ellipse;
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, cx, cy, rx, ry])) return false;
  if (rx <= 0 || ry <= 0) return false;

  const xCoef = [p0x, 3 * (p1x - p0x), 3 * (p0x - 2 * p1x + p2x), -p0x + 3 * p1x - 3 * p2x + p3x];
  const yCoef = [p0y, 3 * (p1y - p0y), 3 * (p0y - 2 * p1y + p2y), -p0y + 3 * p1y - 3 * p2y + p3y];
  return curveEllipseDiskIntersects(xCoef, yCoef, cx, cy, rx, ry, epsilon);
}
