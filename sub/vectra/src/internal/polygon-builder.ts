import type { XYObjectWritable } from '../types';

/**
 * radial polygon vertex sequence를 out에 push한다.
 *
 * caller 책임:
 *  - `out.length = 0` clear는 caller가 호출 전에 한다.
 *  - `vertexCount`는 유효한 양의 정수여야 한다 (invalid count 검사 책임은 caller).
 *  - `vertexRadius` clamp(예: `radius <= 0 → 0`)는 caller가 한다.
 *  - non-finite 좌표/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다.
 *
 * 동작:
 *  - vertex `i`의 각도는 `startAngle + step * i`이고
 *    `step = ((clockwise ? 1 : -1) * 2π) / vertexCount`.
 *  - vertex `i` 좌표는 `(cx + r * cos(angle), cy + r * sin(angle))`.
 *    여기서 `r`은 `radiusAt`이 주어지면 `radiusAt(i)`, 아니면 `vertexRadius`다.
 *
 * @param out vertex object를 push할 mutable 배열 (caller가 미리 clear)
 * @param cx polygon 중심 x 좌표
 * @param cy polygon 중심 y 좌표
 * @param vertexRadius vertex 기본 반지름. `radiusAt` 미지정 시 모든 vertex가 이 값을 사용한다
 * @param vertexCount push할 vertex 수 (caller가 유효성 보장)
 * @param startAngle 첫 vertex 각도 (radian)
 * @param clockwise true면 SVG y-down clockwise 진행
 * @param radiusAt 선택 vertex별 반지름 callback. star처럼 vertex마다 radius가 다를 때 사용한다
 */
export function buildRadialVertices(
  out: XYObjectWritable[],
  cx: number,
  cy: number,
  vertexRadius: number,
  vertexCount: number,
  startAngle: number,
  clockwise: boolean,
  radiusAt?: (index: number) => number
): void {
  const step = ((clockwise ? 1 : -1) * (2 * Math.PI)) / vertexCount;
  for (let i = 0; i < vertexCount; i++) {
    const angle = startAngle + step * i;
    const r = radiusAt !== undefined ? radiusAt(i) : vertexRadius;
    out.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
}
