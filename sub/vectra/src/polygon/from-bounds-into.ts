import type { Bounds, PolygonWritable } from '../types/flat-shapes.internal';

/**
 * bounds 4-corner vertex를 out에 교대로 저장한 좌표 `[x0, y0, …]`로 기록하고 out을 반환한다.
 *
 * vertex 순서는 `[minX, minY] → [maxX, minY] → [maxX, maxY] → [minX, maxY]`이다.
 * `min > max` 역전 bounds는 repair하지 않고 같은 4-corner 산식 결과를 그대로 push한다 (예: `min=[2,3]`, `max=[1,0]` → `[2,3], [1,3], [1,0], [2,0]`).
 * non-finite corner(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 `out`을 clear한 뒤 정확히 4개 vertex를 push한다.
 *
 * @param out vertex 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param bounds 변환할 bounds (`minX, minY, maxX, maxY`)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function fromBoundsInto(out: PolygonWritable, bounds: Bounds): PolygonWritable {
  out.length = 0;

  const { minX, minY, maxX, maxY } = bounds;

  out.push(minX, minY);
  out.push(maxX, minY);
  out.push(maxX, maxY);
  out.push(minX, maxY);

  return out;
}
