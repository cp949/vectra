import type { TriangleWritable, XYInput } from '../types';
import { buildRightInto } from './build-right-into';

/**
 * buildRightInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `buildRightInto`와 동일하다.
 * NaN/Infinity 입력은 validation 없이 JS 산술 결과를 그대로 기록한다.
 * 특히 angle이 Infinity면 `Math.cos`/`Math.sin` 결과가 NaN이라 b/c가 NaN으로 흐른다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `buildRightInto`와 동일하다.
 * @param origin 직각이 되는 첫 vertex
 * @param width origin→b의 길이. clamp하지 않는다.
 * @param height origin→c의 길이. clamp하지 않는다.
 * @param angle origin→b 방향의 radian. 기본값 0.
 */
export function buildRight(origin: XYInput, width: number, height: number, angle: number = 0): TriangleWritable {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  return buildRightInto(out, origin, width, height, angle);
}
