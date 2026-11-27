/**
 * 점 객체 배열을 flat number 배열로 변환하여 out 버퍼에 기록한다.
 *
 * zero-allocation buffer reuse를 위한 Into 함수다.
 */

import type { Point } from '../../types/flat-shapes.internal';

/**
 * 점 객체 배열을 `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 배열로 변환하여 out에 기록한다.
 *
 * - index 0부터 순서대로 덮어쓴다. out.length는 재설정하지 않는다.
 * - out.length >= points.length * 2를 권장한다. 부족하면 JS 엔진이 자동 확장한다.
 * - 렌더러 파이프라인에서 매 프레임 동일 buffer를 재사용할 때 사용한다.
 *
 * @param out - 결과를 기록할 number 배열 (index 0부터 덮어씀)
 * @param points - 변환할 점 객체 배열
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function toFlatCoordsInto(out: number[], points: readonly Point[]): number[] {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    out[i * 2] = p.x;
    out[i * 2 + 1] = p.y;
  }
  return out;
}
