import type { CenterArcWritable, CubicToArcsOptions, XYInput } from '../types';
import { subdivideCubicToTolerance, validateCubicToArcsInputs } from './cubic-to-arcs.internal';

/**
 * cubic Bezier를 circular center-form arc collection으로 근사해 out 배열에 기록하고 out을 반환한다.
 *
 * 호출 초기에 out.length = 0으로 clear한다. 이후 RangeError가 발생하면 out 내용을 보장하지 않는다.
 * zero-length degenerate cubic(네 control point가 모두 동일한 좌표)은 빈 배열을 반환한다.
 * 입력 좌표 또는 내부 산술 결과가 non-finite이면 RangeError로 실패한다.
 * collinear segment, maxSegments 초과, minSegmentT 수렴 실패는 RangeError로 실패한다.
 * options.errorTolerance, maxSegments, minSegmentT가 finite positive가 아니면 RangeError로 실패한다.
 * 결과 arc는 circular(rx === ry)이고 xRotation === 0이다.
 * 결과 arc는 center-form 규약을 따른다. (endAngle - startAngle)의 부호와 크기가 진행 방향과 각폭을 담으며 sweep === (endAngle >= startAngle)이다. atan2 -π 경계를 교차하는 arc도 올바른 방향으로 기록한다.
 * 각 결과 arc는 새 plain object로 push한다. 입력 point나 기존 out element를 재사용하지 않는다.
 *
 * @param out arc를 기록할 writable array
 * @param p0 cubic Bezier 시작점
 * @param p1 첫 번째 control point
 * @param p2 두 번째 control point
 * @param p3 cubic Bezier 끝점
 * @param options 근사 옵션 (errorTolerance, maxSegments, minSegmentT)
 * @returns out
 */
export function cubicToArcsInto(
  out: CenterArcWritable[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: CubicToArcsOptions
): CenterArcWritable[] {
  out.length = 0;

  const errorTolerance = options?.errorTolerance ?? 1e-3;
  const maxSegments = options?.maxSegments ?? 64;
  const minSegmentT = options?.minSegmentT ?? 1e-6;

  const validated = validateCubicToArcsInputs(p0, p1, p2, p3, errorTolerance, maxSegments, minSegmentT);

  // zero-length degenerate: 네 control point가 모두 동일한 좌표
  if (
    validated.p0.x === validated.p1.x &&
    validated.p0.y === validated.p1.y &&
    validated.p0.x === validated.p2.x &&
    validated.p0.y === validated.p2.y &&
    validated.p0.x === validated.p3.x &&
    validated.p0.y === validated.p3.y
  ) {
    return out;
  }

  subdivideCubicToTolerance(
    out,
    validated.p0,
    validated.p1,
    validated.p2,
    validated.p3,
    errorTolerance,
    maxSegments,
    minSegmentT
  );

  return out;
}
