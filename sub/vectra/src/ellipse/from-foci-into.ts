import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseWritable, XYInput, XYWritable } from '../types';

/**
 * 두 초점과 초점까지의 거리 합으로 x축 정렬 ellipse를 계산하여 out에 기록하고 out을 반환한다.
 *
 * center = midpoint(focusA, focusB), c = dist/2, a = sumOfDistances/2, b = sqrt(a²-c²).
 * radiusX = a (semi-major), radiusY = b (semi-minor).
 * invalid 조건이면 false를 반환하고 out을 수정하지 않는다.
 *
 * invalid 조건:
 * - sumOfDistances <= 0
 * - 입력에 NaN 또는 ±Infinity 포함
 * - sumOfDistances < dist(focusA, focusB) (삼각형 부등식 위반)
 *
 * @param out 결과를 기록할 EllipseWritable output
 * @param focusA 첫 번째 초점
 * @param focusB 두 번째 초점
 * @param sumOfDistances 타원 위 임의의 점에서 두 초점까지 거리의 합 (= 2a)
 */
export function fromFociInto<Center extends XYWritable>(
  out: EllipseWritable<Center>,
  focusA: XYInput,
  focusB: XYInput,
  sumOfDistances: number
): EllipseWritable<Center> | false {
  const ax = readX(focusA);
  const ay = readY(focusA);
  const bx = readX(focusB);
  const by = readY(focusB);

  // non-finite 입력 검사
  if (
    !Number.isFinite(ax) ||
    !Number.isFinite(ay) ||
    !Number.isFinite(bx) ||
    !Number.isFinite(by) ||
    !Number.isFinite(sumOfDistances)
  ) {
    return false;
  }

  // sumOfDistances는 양수여야 한다
  if (sumOfDistances <= 0) {
    return false;
  }

  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);

  // 삼각형 부등식: sumOfDistances >= dist (두 초점 사이 거리 이상이어야 한다)
  if (sumOfDistances < dist) {
    return false;
  }

  const cx = (ax + bx) / 2;
  const cy = (ay + by) / 2;
  // semi-major axis
  const a = sumOfDistances / 2;
  // linear eccentricity
  const c = dist / 2;
  // semi-minor axis (degenerate일 때 0이 될 수 있음)
  const b = Math.sqrt(a * a - c * c);

  writeXY(out.center, cx, cy);
  out.radiusX = a;
  out.radiusY = b;

  return out;
}
