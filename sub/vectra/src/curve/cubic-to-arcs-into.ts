import type { CubicToArcsOptions } from '../types';
import type { CenterArcWritable, CubicCurve } from '../types/flat-shapes.internal';
import { subdivideCubicToTolerance, validateCubicToArcsInputs } from './cubic-to-arcs.internal';

/**
 * cubic Bezier를 circular center-form arc collection으로 근사해 out 배열에 기록하고 out을 반환한다.
 *
 * 호출 초기에 out.length = 0으로 clear한다. 이후 RangeError가 발생하면 out 내용을 보장하지 않는다.
 * zero-length degenerate cubic(네 control point가 모두 동일한 좌표)은 빈 배열을 반환한다.
 * 입력 좌표 또는 내부 산술 결과가 non-finite이면 RangeError로 실패한다.
 * collinear segment, maxSegments 초과, minSegmentT 수렴 실패는 RangeError로 실패한다.
 * 곡률 반지름이 segment 길이의 대략 1e16배를 넘어 endAngle이 startAngle로 반올림되는 거의 직선인 segment도 collinear로 보고 재분할한다.
 * center-form으로 재구성한 시작점·끝점이 segment 끝점에서 errorTolerance보다 먼 segment도 collinear로 보고 재분할한다. 반지름이 r이면 각도 반올림만으로 끝점이 대략 r·1e-16 어긋난다.
 * options.errorTolerance, maxSegments, minSegmentT가 finite positive가 아니면 RangeError로 실패한다.
 * 결과 arc는 circular(rx === ry)이고 xRotation === 0이다.
 * 결과 arc는 center-form 규약을 따른다. (endAngle - startAngle)의 부호와 크기가 진행 방향과 각폭을 담으며 sweep === (endAngle >= startAngle)이다. atan2 -π 경계를 교차하는 arc도 올바른 방향으로 기록한다.
 * 각 결과 arc는 새 plain object로 push한다. 입력 point나 기존 out element를 재사용하지 않는다.
 *
 * @param out 근사 원호를 기록할 중심 원호 배열
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options 근사 옵션 (errorTolerance, maxSegments, minSegmentT)
 * @returns out
 */
export function cubicToArcsInto(
  out: CenterArcWritable[],
  curve: CubicCurve,
  options?: Required<CubicToArcsOptions>
): CenterArcWritable[] {
  out.length = 0;

  const errorTolerance = options === undefined ? 1e-3 : options.errorTolerance;
  const maxSegments = options === undefined ? 64 : options.maxSegments;
  const minSegmentT = options === undefined ? 1e-6 : options.minSegmentT;

  const validated = validateCubicToArcsInputs(curve, errorTolerance, maxSegments, minSegmentT);

  // zero-length degenerate: 네 control point가 모두 동일한 좌표
  if (
    validated.x0 === validated.x1 &&
    validated.y0 === validated.y1 &&
    validated.x0 === validated.x2 &&
    validated.y0 === validated.y2 &&
    validated.x0 === validated.x3 &&
    validated.y0 === validated.y3
  ) {
    return out;
  }

  subdivideCubicToTolerance(out, validated, errorTolerance, maxSegments, minSegmentT);

  return out;
}
