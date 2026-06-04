import type { CenterArcLike, CurveSampleOptions, XYObjectWritable } from '../types';
import { arcPointAtTInto } from './arc-point-at-t-into';

/**
 * center form arc를 균등 steps로 샘플링해 out에 push하고 out을 반환한다.
 *
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * 각 output point는 새 { x: 0, y: 0 } object를 생성해 push한다.
 * steps validation 실패 시 RangeError를 던지고 out은 그대로 유지된다.
 * rx <= 0 또는 ry <= 0인 degenerate arc는 center 좌표를 반환한다.
 *
 * @param out point를 push할 XYObjectWritable 배열. 기존 내용은 clear된다.
 * @param centerArc center form arc input
 * @param stepsOrOptions 샘플 수 또는 CurveSampleOptions. 기본값 32.
 * @returns out
 */
export function arcSampleInto(
  out: XYObjectWritable[],
  centerArc: CenterArcLike,
  stepsOrOptions?: number | CurveSampleOptions
): XYObjectWritable[] {
  const rawSteps = typeof stepsOrOptions === 'number' ? stepsOrOptions : (stepsOrOptions?.steps ?? 32);
  if (!Number.isSafeInteger(rawSteps) || rawSteps < 2 || rawSteps > 0xffffffff) {
    throw new RangeError(`steps must be a safe integer in [2, 4294967295], got ${rawSteps}`);
  }
  out.length = 0;
  for (let i = 0; i < rawSteps; i++) {
    const t = i / (rawSteps - 1);
    const pt: XYObjectWritable = { x: 0, y: 0 };
    arcPointAtTInto(pt, centerArc, t);
    out.push(pt);
  }
  return out;
}
