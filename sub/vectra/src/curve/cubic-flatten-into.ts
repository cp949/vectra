import { readX, readY } from '../internal/xy';
import type { FlattenOptions, XYInput, XYObjectWritable } from '../types';
import { appendFlattenedCubic } from './cubic-flatten.internal';

/**
 * cubic Bezier curve를 adaptive subdivision으로 polyline에 근사하여 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length=0)한 뒤 근사 polyline의 점들을 순서대로 push한다.
 * 직선(flat) curve는 시작점과 끝점 두 개만 push한다.
 *
 * @param out polyline point를 push할 XYObjectWritable 배열. 기존 내용은 clear된다.
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param options flatten 옵션
 * @param options.flatness 선형 근사 허용 geometric error. 기본값: 0.5
 * @param options.maxRecursion subdivision 재귀 깊이 상한. 기본값: 32
 * @returns out
 */
export function cubicFlattenInto(
  out: XYObjectWritable[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: FlattenOptions
): XYObjectWritable[] {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;

  // 기존 내용 clear
  out.length = 0;

  appendFlattenedCubic(
    out,
    readX(p0),
    readY(p0),
    readX(p1),
    readY(p1),
    readX(p2),
    readY(p2),
    readX(p3),
    readY(p3),
    flatness,
    maxRecursion,
    true
  );

  return out;
}
