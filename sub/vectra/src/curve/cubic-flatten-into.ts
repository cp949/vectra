import type { FlattenOptions } from '../types';
import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';
import { appendFlattenedCubic } from './cubic-flatten.internal';

/**
 * cubic Bezier curve를 adaptive subdivision으로 polyline에 근사하여 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length=0)한 뒤 근사 polyline의 점들을 순서대로 push한다.
 * 직선(flat) curve는 시작점과 끝점 두 개만 push한다.
 *
 * @param out polyline point를 push할 PointWritable 배열. 기존 내용은 clear된다.
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options flatten 옵션
 * @param options.flatness 선형 근사 허용 geometric error. 기본값: 0.5
 * @param options.maxRecursion subdivision 재귀 깊이 상한. 기본값: 32
 * @returns out
 */
export function cubicFlattenInto(
  out: PointWritable[],
  curve: CubicCurve,
  options?: Required<FlattenOptions>
): PointWritable[] {
  const flatness = options === undefined ? 0.5 : options.flatness;
  const maxRecursion = options === undefined ? 32 : options.maxRecursion;

  // 기존 내용 clear
  out.length = 0;

  appendFlattenedCubic(
    out,
    curve.x0,
    curve.y0,
    curve.x1,
    curve.y1,
    curve.x2,
    curve.y2,
    curve.x3,
    curve.y3,
    flatness,
    maxRecursion,
    true
  );

  return out;
}
