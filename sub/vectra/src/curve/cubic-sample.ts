import type { CurveSampleOptions } from '../types';
import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';
import { cubicSampleInto } from './cubic-sample-into';

/**
 * cubic Bezier curve를 균등 steps로 샘플링한 새 점 배열을 반환한다.
 *
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * steps validation 실패 시 RangeError를 던진다.
 * 성능 최적화가 필요하면 `cubicSampleInto`를 사용한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options 샘플 수 옵션. 생략하면 32점을 기록한다.
 * @returns 새로 만든 점 배열
 */
export function cubicSample(curve: CubicCurve, options?: Required<CurveSampleOptions>): PointWritable[] {
  return cubicSampleInto([], curve, options);
}
