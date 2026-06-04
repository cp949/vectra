import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, XYObjectWritable } from '../types/index';

/**
 * bounds 4-corner vertex를 out에 새 `{ x, y }` object로 기록하고 out을 반환한다.
 *
 * vertex 순서는 `[minX, minY] → [maxX, minY] → [maxX, maxY] → [minX, maxY]`이다.
 * `min > max` 역전 bounds는 repair하지 않고 같은 4-corner 산식 결과를 그대로 push한다 (예: `min=[2,3]`, `max=[1,0]` → `[2,3], [1,3], [1,0], [2,0]`).
 * non-finite corner(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 `out`을 clear한 뒤 정확히 4개 vertex를 push한다.
 *
 * @param out vertex object를 기록할 mutable 배열
 * @param bounds 변환할 bounds (object 또는 tuple, corner는 XYInput)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function fromBoundsInto<Out extends XYObjectWritable[]>(out: Out, bounds: BoundsLike): Out {
  out.length = 0;

  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);

  out.push({ x: minX, y: minY });
  out.push({ x: maxX, y: minY });
  out.push({ x: maxX, y: maxY });
  out.push({ x: minX, y: maxY });

  return out;
}
