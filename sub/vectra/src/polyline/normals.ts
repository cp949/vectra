import type { PolylineLike, XYObjectWritable } from '../types';
import { normalsInto } from './normals-into';

/**
 * polyline의 모든 vertex left normal을 계산한 새 point 배열을 반환한다.
 *
 * normal은 vertex tangent `(tx, ty)`의 left normal `(-ty, tx)`다. 입력 vertex 수만큼 결과를
 * 반환한다. tangent를 계산할 수 없는 vertex는 index alignment를 유지하기 위해 `{ x: 0, y: 0 }`을
 * 반환한다. empty polyline은 빈 배열을 반환한다.
 *
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param polyline normal을 계산할 polyline
 */
export function normals(polyline: PolylineLike): XYObjectWritable[] {
  return normalsInto([], polyline);
}
