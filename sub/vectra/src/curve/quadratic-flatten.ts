import type { FlattenOptions, XYInput, XYObjectWritable } from '../types';
import { quadraticFlattenInto } from './quadratic-flatten-into';

/**
 * quadratic Bezier curve를 adaptive subdivision으로 polyline에 근사한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * 직선(flat) curve는 시작점과 끝점 두 개만 담은 길이 2 배열을 반환한다.
 * 성능 최적화가 필요하면 `quadraticFlattenInto`를 사용한다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param options flatten 옵션 (flatness 기본값 0.5, maxRecursion 기본값 32)
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function quadraticFlatten(p0: XYInput, p1: XYInput, p2: XYInput, options?: FlattenOptions): XYObjectWritable[] {
  return quadraticFlattenInto([], p0, p1, p2, options);
}
