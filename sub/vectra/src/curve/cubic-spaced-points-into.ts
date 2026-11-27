import type { CurveSpacedPointsOptions } from '../types';
import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';
import { cubicLength } from './cubic-length';
import { cubicPointAtTInto } from './cubic-point-at-t-into';
import { cubicTAtLength } from './cubic-t-at-length';

/**
 * cubic Bezier curve를 arc-length 기준으로 균등 분포한 point collection으로 out에 push하고 out을 반환한다.
 *
 * sampling 위치: distance = totalLength * i / (count - 1), i = 0..count-1 (양 끝점 포함).
 * 양 끝점은 t=0 / t=1로 고정해 binary search drift 없이 정확한 start/end point가 된다.
 * 중간 점은 cubicTAtLength로 distance에 해당하는 t를 찾아 evaluate한다.
 * uniform t sampling(cubicSample)과 달리 arc-length 간격을 사용한다.
 * zero-length curve는 start point를 count개 반환한다.
 * 각 output point는 새 { x: 0, y: 0 } object를 생성해 push한다.
 * 좌표는 검증 없이 사용하므로 NaN/Infinity는 결과 좌표로 pass-through된다.
 * count validation 실패 시 RangeError를 던지고 out은 그대로 유지된다(temp commit).
 *
 * @param out point를 push할 PointWritable 배열. 성공 시 기존 내용은 clear된다.
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param count output point 수. 2 이상 0xffffffff 이하의 safe integer. 범위 밖이면 RangeError.
 * @param options TAtLength 탐색 옵션(segments / tolerance / maxIterations).
 * @returns out
 */
export function cubicSpacedPointsInto(
  out: PointWritable[],
  curve: CubicCurve,
  count: number,
  options?: Required<CurveSpacedPointsOptions>
): PointWritable[] {
  if (!Number.isSafeInteger(count) || count < 2 || count > 0xffffffff) {
    throw new RangeError(`count must be a safe integer in [2, 4294967295], got ${count}`);
  }

  const totalLength = cubicLength(curve, options);
  const last = count - 1;
  const temp: PointWritable[] = [];

  for (let i = 0; i < count; i++) {
    let t: number;
    if (totalLength === 0 || i === 0) {
      // zero-length curve는 start point를 count개 반환한다.
      t = 0;
    } else if (i === last) {
      // 마지막 point는 distance === totalLength 경계의 drift 없이 정확한 end point가 되도록 t=1로 고정한다.
      t = 1;
    } else {
      t = cubicTAtLength(curve, (totalLength * i) / last, options);
    }
    const pt: PointWritable = { x: 0, y: 0 };
    cubicPointAtTInto(pt, curve, t);
    temp.push(pt);
  }

  out.length = 0;
  for (const pt of temp) out.push(pt);
  return out;
}
