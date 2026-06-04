import type { CurveSampleOptions, XYInput, XYObjectWritable } from '../types';
import { cubicPointAtTInto } from './cubic-point-at-t-into';

/**
 * cubic Bezier curve를 균등 steps로 샘플링해 out에 push하고 out을 반환한다.
 *
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * 각 output point는 새 { x: 0, y: 0 } object를 생성해 push한다.
 * steps validation 실패 시 RangeError를 던지고 out은 그대로 유지된다.
 *
 * @param out point를 push할 XYObjectWritable 배열. 기존 내용은 clear된다.
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param stepsOrOptions 샘플 수 또는 CurveSampleOptions. 기본값 32.
 * @returns out
 */
export function cubicSampleInto(
  out: XYObjectWritable[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
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
    cubicPointAtTInto(pt, p0, p1, p2, p3, t);
    out.push(pt);
  }
  return out;
}
