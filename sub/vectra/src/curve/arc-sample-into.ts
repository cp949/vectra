import type { CurveSampleOptions } from '../types';
import type { CenterArc, PointWritable } from '../types/flat-shapes.internal';
import { arcPointAtTInto } from './arc-point-at-t-into';

/**
 * center form arc를 균등 steps로 샘플링해 out에 push하고 out을 반환한다.
 *
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * 각 output point는 새 { x: 0, y: 0 } object를 생성해 push한다.
 * steps validation 실패 시 RangeError를 던지고 out은 그대로 유지된다.
 * rx <= 0 또는 ry <= 0인 degenerate arc는 center 좌표를 반환한다.
 *
 * @param out 점을 push할 점 배열. 기존 내용은 clear된다.
 * @param centerArc center form arc input
 * @param options 샘플 수 옵션. 생략하면 32점을 기록한다.
 * @returns out
 */
export function arcSampleInto(
  out: PointWritable[],
  centerArc: CenterArc,
  options?: Required<CurveSampleOptions>
): PointWritable[] {
  const rawSteps = options === undefined ? 32 : options.steps;
  if (!Number.isSafeInteger(rawSteps) || rawSteps < 2 || rawSteps > 0xffffffff) {
    throw new RangeError(`steps must be a safe integer in [2, 4294967295], got ${rawSteps}`);
  }
  out.length = 0;
  for (let i = 0; i < rawSteps; i++) {
    const t = i / (rawSteps - 1);
    const pt: PointWritable = { x: 0, y: 0 };
    arcPointAtTInto(pt, centerArc, t);
    out.push(pt);
  }
  return out;
}
