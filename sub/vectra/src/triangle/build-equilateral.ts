import type { TriangleWritable, XYInput } from '../types';
import { buildEquilateralInto } from './build-equilateral-into';

/**
 * buildEquilateralInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `buildEquilateralInto`와 동일하다.
 * NaN/Infinity 입력은 validation 없이 JS 산술 결과를 그대로 기록한다.
 * 특히 angle이 Infinity면 `Math.cos`/`Math.sin` 결과가 NaN이라 b/c가 NaN으로 흐른다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `buildEquilateralInto`와 동일하다.
 * @param origin 첫 vertex가 될 기준점
 * @param sideLength 변의 길이. clamp하지 않는다.
 * @param angle origin→b 방향의 radian. 기본값 0.
 */
export function buildEquilateral(origin: XYInput, sideLength: number, angle: number = 0): TriangleWritable {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  return buildEquilateralInto(out, origin, sideLength, angle);
}
