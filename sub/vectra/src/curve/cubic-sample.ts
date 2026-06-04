import type { CurveSampleOptions, XYInput, XYObjectWritable } from '../types';
import { cubicSampleInto } from './cubic-sample-into';

/**
 * cubic Bezier curve를 균등 steps로 샘플링한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * steps validation 실패 시 RangeError를 던진다.
 * 성능 최적화가 필요하면 `cubicSampleInto`를 사용한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param stepsOrOptions 샘플 수 또는 CurveSampleOptions. 기본값 32.
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function cubicSample(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  stepsOrOptions?: number | CurveSampleOptions
): XYObjectWritable[] {
  return cubicSampleInto([], p0, p1, p2, p3, stepsOrOptions);
}
