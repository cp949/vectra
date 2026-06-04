import type { XYInput, XYObjectWritable } from '../types';
import { cornerBisectorInto } from './corner-bisector-into';

/**
 * cornerBisectorInto의 allocating companion.
 * corner a -> b -> c에서 vertex b의 내각 이등분 단위 벡터를 새 object로 반환한다.
 *
 * b에서 a로 향하는 단위 방향과 b에서 c로 향하는 단위 방향의 합을 정규화한 방향이다.
 *
 * 다음 경우 bisector가 정의되지 않으므로 undefined를 반환한다.
 * - |a - b| === 0 또는 |c - b| === 0 (zero-length edge).
 * - 두 edge가 정확히 반대 방향이라 단위 방향 합이 zero vector (straight line, bisector 미정의).
 *
 * non-finite(NaN, Infinity, -Infinity) 입력 검증은 caller 책임이며, 검증 없이 JS 산술 결과를 그대로 반환한다.
 *
 * @param a corner 한쪽 끝점
 * @param b corner vertex
 * @param c corner 다른쪽 끝점
 * @returns 단위 벡터 object 또는 undefined(degenerate)
 */
export function cornerBisector(a: XYInput, b: XYInput, c: XYInput): XYObjectWritable | undefined {
  const result = cornerBisectorInto({ x: 0, y: 0 }, a, b, c);
  return result === false ? undefined : result;
}
