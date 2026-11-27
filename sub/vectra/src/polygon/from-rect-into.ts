import type { PolygonWritable, Rect } from '../types/flat-shapes.internal';

/**
 * rect 4-corner vertex를 out에 교대로 저장한 좌표 `[x0, y0, …]`로 기록하고 out을 반환한다.
 *
 * vertex 순서는 `[x, y] → [x+width, y] → [x+width, y+height] → [x, y+height]`이다.
 * negative `width` / `height`는 repair하지 않고 산술 결과 그대로 push한다 (좌표가 wrap된 결과, wind 방향이 바뀔 수 있어 caller 책임).
 * non-finite component(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 `out`을 clear한 뒤 정확히 4개 vertex를 push한다.
 *
 * @param out vertex 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param rect 변환할 rect (`x, y, width, height`)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function fromRectInto(out: PolygonWritable, rect: Rect): PolygonWritable {
  out.length = 0;

  const { x, y, width, height } = rect;
  const x1 = x + width;
  const y1 = y + height;

  out.push(x, y, x1, y, x1, y1, x, y1);

  return out;
}
