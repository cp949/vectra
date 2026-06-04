import type { CenterArcWritable, CubicToArcsOptions, XYInput } from '../types';
import { cubicToArcsInto } from './cubic-to-arcs-into';

/**
 * cubic Bezier를 circular center-form arc collection으로 근사한 새 CenterArcWritable[] 배열을 반환한다.
 *
 * zero-length degenerate cubic(네 control point가 모두 동일한 좌표)은 빈 배열을 반환한다.
 * 입력 좌표 또는 내부 산술 결과가 non-finite이면 RangeError로 실패한다.
 * collinear segment, maxSegments 초과, minSegmentT 수렴 실패는 RangeError로 실패한다.
 * options.errorTolerance, maxSegments, minSegmentT가 finite positive가 아니면 RangeError로 실패한다.
 * 결과 arc는 circular(rx === ry)이고 xRotation === 0이다.
 * 결과 arc는 center-form 규약을 따른다. (endAngle - startAngle)의 부호와 크기가 진행 방향과 각폭을 담으며 sweep === (endAngle >= startAngle)이다. atan2 -π 경계를 교차하는 arc도 올바른 방향으로 기록한다.
 * 각 결과 arc는 새 plain object다. 입력 point를 재사용하지 않는다.
 * 성능 최적화가 필요하면 `cubicToArcsInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `cubicToArcsInto`와 동일하다.
 * @param p0 cubic Bezier 시작점
 * @param p1 첫 번째 control point
 * @param p2 두 번째 control point
 * @param p3 cubic Bezier 끝점
 * @param options 근사 옵션 (errorTolerance, maxSegments, minSegmentT)
 * @returns 새로 만든 CenterArcWritable 배열
 */
export function cubicToArcs(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: CubicToArcsOptions
): CenterArcWritable[] {
  return cubicToArcsInto([], p0, p1, p2, p3, options);
}
