import type { CenterArcLike, CurveSampleOptions, XYObjectWritable } from '../types';
import { arcSampleInto } from './arc-sample-into';

/**
 * center form arc를 균등 steps로 샘플링한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * steps validation 실패 시 RangeError를 던진다.
 * rx <= 0 또는 ry <= 0인 degenerate arc는 center 좌표를 반환한다.
 * 성능 최적화가 필요하면 `arcSampleInto`를 사용한다.
 *
 * @param centerArc center form arc input
 * @param stepsOrOptions 샘플 수 또는 CurveSampleOptions. 기본값 32.
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function arcSample(centerArc: CenterArcLike, stepsOrOptions?: number | CurveSampleOptions): XYObjectWritable[] {
  return arcSampleInto([], centerArc, stepsOrOptions);
}
